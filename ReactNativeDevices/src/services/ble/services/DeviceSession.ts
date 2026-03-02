// ============================================================
// services/DeviceSession.ts — Connection state machine
// ============================================================
//
// Manages the full lifecycle of a device connection:
// DISCONNECTED → CONNECTING → IDENTIFYING → AUTHORIZING → ACTIVE → TEARDOWN
//
// Handles protocol identification race, ping loops,
// watchdog timers, and the 7s Delightech reconnection cooldown.
// ============================================================

import { Device } from 'react-native-ble-plx';
import {
    ConnectionState,
    CommandType,
    ProtocolType,
    IProtocol,
    WorkoutState,
} from '../types/protocol';
import { BluetoothManager } from './BluetoothManager';
import { ProtocolRegistry } from './ProtocolRegistry';

/** Callback when parsed workout data arrives. */
export type WorkoutDataCallback = (data: Partial<WorkoutState>) => void;

/** Callback when connection state changes. */
export type StateChangeCallback = (state: ConnectionState) => void;

/** Callback when watchdog detects stale/fresh telemetry. */
export type StaleCallback = (isStale: boolean) => void;

/**
 * Watchdog timeout: no data for 5 seconds → stale.
 * BMAD spec: 5x the standard 1Hz update; allows for transient interference.
 */
const WATCHDOG_TIMEOUT_MS = 5000;

/** Identification timeout: if no protocol found in 5s, fail. */
const IDENTIFICATION_TIMEOUT_MS = 5000;

/** Delightech reconnection cooldown: 7 seconds. */
const DELIGHTECH_COOLDOWN_MS = 7000;

/** Ping interval for Delightech/Fitshow: 1Hz. */
const PING_INTERVAL_MS = 1000;

/**
 * GATT settling delay: 500ms after connect before probing.
 * Prevents Android GATT Status 133 ("GATT Busy") errors.
 */
const GATT_SETTLING_DELAY_MS = 500;

export class DeviceSession {
    private ble: BluetoothManager;
    private registry: ProtocolRegistry;
    private state: ConnectionState = ConnectionState.DISCONNECTED;
    private activeProtocol: IProtocol | null = null;
    private connectedDevice: Device | null = null;
    private deviceId: string | null = null;

    // Timers
    private watchdogTimer: ReturnType<typeof setTimeout> | null = null;
    private pingInterval: ReturnType<typeof setInterval> | null = null;
    private identificationTimer: ReturnType<typeof setTimeout> | null = null;

    // Callbacks
    private onData: WorkoutDataCallback | null = null;
    private onStateChange: StateChangeCallback | null = null;
    private onStale: StaleCallback | null = null;

    // Pause awareness (prevents watchdog false positives)
    private isPaused = false;
    private isStale = false;

    // Cooldown tracking
    private lastDisconnectTime = 0;
    private lastDisconnectedProtocol: ProtocolType | null = null;

    constructor(ble: BluetoothManager, registry: ProtocolRegistry) {
        this.ble = ble;
        this.registry = registry;
    }

    // =======================
    // Public API
    // =======================

    /** Set callback for workout data updates. */
    setDataCallback(cb: WorkoutDataCallback): void {
        this.onData = cb;
    }

    /** Set callback for state changes. */
    setStateChangeCallback(cb: StateChangeCallback): void {
        this.onStateChange = cb;
    }

    /** Set callback for stale/fresh telemetry state. */
    setStaleCallback(cb: StaleCallback): void {
        this.onStale = cb;
    }

    /** Mark the session as paused (suppresses watchdog reconnection). */
    setPaused(paused: boolean): void {
        this.isPaused = paused;
        // If resuming from pause, clear any stale state
        if (!paused && this.isStale) {
            this.isStale = false;
            if (this.onStale) this.onStale(false);
        }
    }

    /** Whether telemetry is currently stale. */
    getIsStale(): boolean {
        return this.isStale;
    }

    /** Get current connection state. */
    getState(): ConnectionState {
        return this.state;
    }

    /** Get the active protocol (null if not identified). */
    getActiveProtocol(): IProtocol | null {
        return this.activeProtocol;
    }

    /**
     * Start the connection and identification flow.
     * Full sequence: connect → discover → probe → identify → authorize → active.
     */
    async connect(deviceId: string): Promise<void> {
        // Check Delightech cooldown
        if (
            this.lastDisconnectedProtocol === ProtocolType.DELIGHTECH &&
            Date.now() - this.lastDisconnectTime < DELIGHTECH_COOLDOWN_MS
        ) {
            const remaining = DELIGHTECH_COOLDOWN_MS - (Date.now() - this.lastDisconnectTime);
            console.warn(
                `[DeviceSession] Delightech cooldown active, waiting ${remaining}ms`
            );
            await this.delay(remaining);
        }

        this.deviceId = deviceId;
        this.setState(ConnectionState.CONNECTING);

        try {
            // Step 1: Connect and negotiate MTU
            this.connectedDevice = await this.ble.connect(deviceId);

            // Step 1.5: GATT settling delay (prevents Android Status 133)
            await this.delay(GATT_SETTLING_DELAY_MS);

            // Step 2: Start identification race
            this.setState(ConnectionState.IDENTIFYING);
            await this.runIdentificationRace(deviceId);
        } catch (error: any) {
            console.error('[DeviceSession] Connection failed:', error);
            if (error.message === 'Protocol identification timed out') {
                this.setState(ConnectionState.TIMEOUT);
            } else {
                this.setState(ConnectionState.DISCONNECTED);
            }
            throw error;
        }
    }

    /**
     * Send a command to the connected device.
     */
    async sendCommand(
        type: CommandType,
        params?: Record<string, number>
    ): Promise<void> {
        if (!this.activeProtocol || !this.deviceId) {
            throw new Error('No active protocol or device');
        }

        const packets = this.activeProtocol.getCommand(type, params);
        for (const packet of packets) {
            await this.ble.write(
                this.deviceId,
                this.activeProtocol.serviceUUIDs[0],
                this.activeProtocol.writeCharUUIDs[0],
                packet
            );
        }
    }

    /**
     * Disconnect and clean up.
     */
    async disconnect(): Promise<void> {
        this.setState(ConnectionState.TEARDOWN);

        // Clear all timers
        this.clearWatchdog();
        this.clearPingLoop();
        this.clearIdentificationTimer();

        // Explicitly stop scanning (prevents Ghost Connection leak)
        this.ble.stopScan();

        // Send teardown commands if needed
        if (this.activeProtocol && this.deviceId) {
            try {
                if (this.activeProtocol.type === ProtocolType.FTMS) {
                    await this.sendCommand(CommandType.RESET);
                }
            } catch (e) {
                console.warn('[DeviceSession] Teardown command failed:', e);
            }
        }

        // Track for cooldown
        if (this.activeProtocol) {
            this.lastDisconnectedProtocol = this.activeProtocol.type;
            this.lastDisconnectTime = Date.now();
        }

        // Disconnect BLE
        if (this.deviceId) {
            await this.ble.disconnect(this.deviceId);
        }

        this.activeProtocol = null;
        this.connectedDevice = null;
        this.deviceId = null;
        this.isPaused = false;
        this.isStale = false;
        this.setState(ConnectionState.DISCONNECTED);
    }

    // =======================
    // Identification Race
    // =======================

    private async runIdentificationRace(deviceId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let identified = false;

            // Set timeout for identification
            this.identificationTimer = setTimeout(() => {
                if (!identified) {
                    reject(new Error('Protocol identification timed out'));
                }
            }, IDENTIFICATION_TIMEOUT_MS);

            // Subscribe to all candidate notify characteristics
            const allNotifyChars = this.registry.getAllNotifyCharUUIDs();
            const allServices = this.registry.getAllServiceUUIDs();

            for (const serviceUUID of allServices) {
                for (const charUUID of allNotifyChars) {
                    try {
                        this.ble.subscribe(
                            deviceId,
                            serviceUUID,
                            charUUID,
                            (data, uuid) => {
                                if (identified) return;

                                const protocol = this.registry.identifyFromResponse(data, uuid);
                                if (protocol) {
                                    identified = true;
                                    this.clearIdentificationTimer();
                                    this.activeProtocol = protocol;
                                    console.log(
                                        `[DeviceSession] Protocol identified: ${protocol.name}`
                                    );
                                    this.onProtocolIdentified(deviceId, protocol)
                                        .then(resolve)
                                        .catch(reject);
                                }
                            }
                        );
                    } catch (e) {
                        // Some characteristic/service combos won't exist — that's expected
                    }
                }
            }

            // Send probe commands through the queue
            const probes = this.registry.getProbeCommands();
            for (const probe of probes) {
                this.ble
                    .write(deviceId, probe.serviceUUID, probe.charUUID, probe.data)
                    .catch(() => {
                        // Probe write failures are expected for non-matching protocols
                    });
            }
        });
    }

    // =======================
    // Post-Identification
    // =======================

    private async onProtocolIdentified(
        deviceId: string,
        protocol: IProtocol
    ): Promise<void> {
        // Step 3: Authorize (FTMS requires Request Control)
        this.setState(ConnectionState.AUTHORIZING);

        if (protocol.type === ProtocolType.FTMS) {
            await this.sendCommand(CommandType.REQUEST_CONTROL);
        }

        // Step 4: Go ACTIVE — re-subscribe with the active protocol's parser
        this.setState(ConnectionState.ACTIVE);
        this.ble.clearSubscriptions();

        for (const charUUID of protocol.notifyCharUUIDs) {
            this.ble.subscribe(
                deviceId,
                protocol.serviceUUIDs[0],
                charUUID,
                (data, uuid) => {
                    this.resetWatchdog();
                    const parsed = protocol.parse(data, uuid);
                    if (this.onData) {
                        this.onData(parsed);
                    }
                }
            );
        }

        // Start watchdog
        this.resetWatchdog();

        // Start ping loop for proprietary protocols
        if (
            protocol.type === ProtocolType.DELIGHTECH ||
            protocol.type === ProtocolType.FITSHOW
        ) {
            this.startPingLoop(deviceId, protocol);
        }
    }

    // =======================
    // Ping Loop
    // =======================

    private startPingLoop(deviceId: string, protocol: IProtocol): void {
        this.clearPingLoop();
        this.pingInterval = setInterval(async () => {
            try {
                const packets = protocol.getCommand(CommandType.GET_WORKOUT_DATA);
                for (const packet of packets) {
                    await this.ble.write(
                        deviceId,
                        protocol.serviceUUIDs[0],
                        protocol.writeCharUUIDs[0],
                        packet
                    );
                }
            } catch (e) {
                console.warn('[DeviceSession] Ping failed:', e);
            }
        }, PING_INTERVAL_MS);
    }

    private clearPingLoop(): void {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    // =======================
    // Watchdog
    // =======================

    private resetWatchdog(): void {
        this.clearWatchdog();

        // If we were stale, mark as fresh again
        if (this.isStale) {
            this.isStale = false;
            if (this.onStale) this.onStale(false);
        }

        this.watchdogTimer = setTimeout(() => {
            if (this.state !== ConnectionState.ACTIVE) return;

            // BMAD Silent Killer #4: Don't trigger reconnection during manual pause.
            // When paused, hardware intentionally stops sending data.
            if (this.isPaused) {
                console.log('[DeviceSession] Watchdog suppressed — workout is paused');
                return;
            }

            console.warn('[DeviceSession] Watchdog timeout — no data for 5s');

            // Step 1: Mark as stale (UI shows grayed-out values)
            this.isStale = true;
            if (this.onStale) this.onStale(true);

            // Step 2: Attempt light reset (re-subscribe), then heavy reset
            this.setState(ConnectionState.RECONNECTING);
            if (this.deviceId) {
                this.handleReconnection(this.deviceId);
            }
        }, WATCHDOG_TIMEOUT_MS);
    }

    private clearWatchdog(): void {
        if (this.watchdogTimer) {
            clearTimeout(this.watchdogTimer);
            this.watchdogTimer = null;
        }
    }

    private async handleReconnection(deviceId: string): Promise<void> {
        try {
            await this.ble.disconnect(deviceId);
            await this.connect(deviceId);
        } catch (e) {
            console.error('[DeviceSession] Reconnection failed:', e);
            this.setState(ConnectionState.DISCONNECTED);
        }
    }

    // =======================
    // State management
    // =======================

    private setState(state: ConnectionState): void {
        this.state = state;
        if (this.onStateChange) {
            this.onStateChange(state);
        }
    }

    // =======================
    // Helpers
    // =======================

    private clearIdentificationTimer(): void {
        if (this.identificationTimer) {
            clearTimeout(this.identificationTimer);
            this.identificationTimer = null;
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
