// ============================================================
// hooks/useWorkout.ts — React hook for the UI layer
// ============================================================
//
// Clean interface between the BLE service layer and React.
// Exposes workout data, connection status, and control actions.
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import {
    WorkoutState,
    ConnectionState,
    WorkoutStatus,
    CommandType,
} from '../types/protocol';
import { BluetoothManager } from '../services/BluetoothManager';
import { ProtocolRegistry } from '../services/ProtocolRegistry';
import { DeviceSession } from '../services/DeviceSession';
import { DataAccumulator } from '../middleware/DataAccumulator';

/**
 * Scanned device info (subset of react-native-ble-plx Device).
 */
export interface ScannedDevice {
    id: string;
    name: string | null;
    rssi: number | null;
}

/**
 * Return type of the useWorkout hook.
 */
export interface UseWorkoutResult {
    /** Current merged workout data. */
    data: WorkoutState | null;
    /** Current workout status. */
    status: WorkoutStatus;
    /** List of discovered devices. */
    devices: ScannedDevice[];
    /** Active protocol name, if identified. */
    protocolName: string | null;
    /** Whether telemetry data is stale (no packets for 5s). UI should gray-out values. */
    isStale: boolean;

    // Actions
    /** Request BLE permissions (Android). */
    requestPermissions: () => Promise<boolean>;
    /** Start scanning for fitness devices. */
    scan: () => void;
    /** Stop scanning. */
    stopScan: () => void;
    /** Connect to a device by ID. */
    connect: (deviceId: string) => Promise<void>;
    /** Disconnect from the current device. */
    disconnect: () => Promise<void>;
    /** Start/resume workout. */
    start: () => Promise<void>;
    /** Pause workout. */
    pause: () => Promise<void>;
    /** Set resistance level. */
    setResistance: (level: number) => Promise<void>;
}

/**
 * React hook providing a clean API to the BLE fitness bridge.
 *
 * Usage:
 * ```tsx
 * const { data, status, scan, connect, start, pause, setResistance } = useWorkout();
 * ```
 */
export function useWorkout(): UseWorkoutResult {
    const [data, setData] = useState<WorkoutState | null>(null);
    const [status, setStatus] = useState<WorkoutStatus>(WorkoutStatus.IDLE);
    const [devices, setDevices] = useState<ScannedDevice[]>([]);
    const [protocolName, setProtocolName] = useState<string | null>(null);
    const [isStale, setIsStale] = useState(false);

    // Refs to persist across renders (BLE objects must not be recreated)
    const bleRef = useRef(BluetoothManager.getInstance());
    const registryRef = useRef(new ProtocolRegistry());
    const sessionRef = useRef(new DeviceSession(bleRef.current, registryRef.current));
    const accumulatorRef = useRef(new DataAccumulator());

    // Wire up session callbacks
    useEffect(() => {
        const session = sessionRef.current;
        const accumulator = accumulatorRef.current;

        session.setDataCallback((partial) => {
            const merged = accumulator.accumulate(partial);
            setData(merged);
        });

        session.setStateChangeCallback((state) => {
            switch (state) {
                case ConnectionState.DISCONNECTED:
                    setStatus(WorkoutStatus.IDLE);
                    setProtocolName(null);
                    break;
                case ConnectionState.CONNECTING:
                case ConnectionState.IDENTIFYING:
                case ConnectionState.AUTHORIZING:
                    setStatus(WorkoutStatus.CONNECTING);
                    break;
                case ConnectionState.ACTIVE:
                    setStatus(WorkoutStatus.READY);
                    setProtocolName(session.getActiveProtocol()?.name ?? null);
                    break;
                case ConnectionState.RECONNECTING:
                    setStatus(WorkoutStatus.CONNECTING);
                    break;
                case ConnectionState.TEARDOWN:
                    setStatus(WorkoutStatus.FINISHED);
                    break;
                case ConnectionState.TIMEOUT:
                    setStatus(WorkoutStatus.TIMEOUT);
                    break;
            }
        });

        session.setStaleCallback((stale) => {
            setIsStale(stale);
        });

        return () => {
            session.setDataCallback(null as any);
            session.setStateChangeCallback(null as any);
            session.setStaleCallback(null as any);
        };
    }, []);

    // Actions
    const requestPermissions = useCallback(async () => {
        return bleRef.current.requestPermissions();
    }, []);

    const scan = useCallback(() => {
        setDevices([]);
        const serviceUUIDs = registryRef.current.getAllServiceUUIDs();
        bleRef.current.scan(serviceUUIDs, (device) => {
            setDevices((prev) => {
                if (prev.some((d) => d.id === device.id)) return prev;
                return [
                    ...prev,
                    { id: device.id, name: device.name, rssi: device.rssi },
                ];
            });
        });
    }, []);

    const stopScan = useCallback(() => {
        bleRef.current.stopScan();
    }, []);

    const connect = useCallback(async (deviceId: string) => {
        bleRef.current.stopScan();
        accumulatorRef.current.reset();
        await sessionRef.current.connect(deviceId);
    }, []);

    const disconnect = useCallback(async () => {
        await sessionRef.current.disconnect();
        accumulatorRef.current.reset();
        setData(null);
    }, []);

    const start = useCallback(async () => {
        await sessionRef.current.sendCommand(CommandType.START);
        sessionRef.current.setPaused(false);
        accumulatorRef.current.setPaused(false);
        setIsStale(false);
        setStatus(WorkoutStatus.WORKING_OUT);
    }, []);

    const pause = useCallback(async () => {
        await sessionRef.current.sendCommand(CommandType.PAUSE);
        sessionRef.current.setPaused(true);
        accumulatorRef.current.setPaused(true);
        setStatus(WorkoutStatus.PAUSED);
    }, []);

    const setResistance = useCallback(async (level: number) => {
        await sessionRef.current.sendCommand(CommandType.SET_RESISTANCE, { level });
    }, []);

    return {
        data,
        status,
        devices,
        protocolName,
        isStale,
        requestPermissions,
        scan,
        stopScan,
        connect,
        disconnect,
        start,
        pause,
        setResistance,
    };
}
