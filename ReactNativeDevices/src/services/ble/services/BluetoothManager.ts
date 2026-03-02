// ============================================================
// services/BluetoothManager.ts — Singleton BLE transport layer
// ============================================================
//
// Wraps react-native-ble-plx BleManager in a singleton that
// survives React re-renders. All writes go through the
// QueueManager to enforce the 200ms delay rule.
// ============================================================

import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import { QueueManager } from '../utils/QueueManager';
import { toBase64, fromBase64 } from '../utils/ByteParser';

export type NotificationCallback = (data: Uint8Array, charUUID: string) => void;

export class BluetoothManager {
    private static instance: BluetoothManager;
    private manager: BleManager;
    private queue: QueueManager;
    private subscriptions: Subscription[] = [];

    private constructor() {
        this.manager = new BleManager();
        this.queue = new QueueManager(200);
    }

    /** Get the singleton instance. */
    static getInstance(): BluetoothManager {
        if (!BluetoothManager.instance) {
            BluetoothManager.instance = new BluetoothManager();
        }
        return BluetoothManager.instance;
    }

    // =======================
    // Permissions (Android 12+)
    // =======================

    /**
     * Request runtime BLE permissions for Android 12+ (API 31+).
     * Must be called before scanning.
     */
    async requestPermissions(): Promise<boolean> {
        if (Platform.OS !== 'android') return true;

        const apiLevel = Platform.Version;

        if (typeof apiLevel === 'number' && apiLevel >= 31) {
            // Android 12+ requires BLUETOOTH_SCAN, BLUETOOTH_CONNECT, and FINE_LOCATION
            const results = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);

            return Object.values(results).every(
                (r) => r === PermissionsAndroid.RESULTS.GRANTED
            );
        } else {
            // Android < 12 only needs FINE_LOCATION
            const result = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            return result === PermissionsAndroid.RESULTS.GRANTED;
        }
    }

    // =======================
    // Scanning
    // =======================

    /**
     * Start scanning for BLE devices.
     * Uses allowDuplicates: true for iOS quick-cycle reconnect detection.
     */
    scan(
        serviceUUIDs: string[] | null,
        onDeviceFound: (device: Device) => void
    ): void {
        this.manager.startDeviceScan(
            serviceUUIDs,
            { allowDuplicates: true },
            (error, device) => {
                if (error) {
                    console.error('[BluetoothManager] Scan error:', error.message);
                    return;
                }
                if (device) {
                    onDeviceFound(device);
                }
            }
        );
    }

    /** Stop scanning. */
    stopScan(): void {
        this.manager.stopDeviceScan();
    }

    // =======================
    // Connection
    // =======================

    /**
     * Connect to a device, discover services, and negotiate MTU.
     */
    async connect(deviceId: string): Promise<Device> {
        const device = await this.manager.connectToDevice(deviceId);
        await device.discoverAllServicesAndCharacteristics();

        // MTU negotiation: request 512 on Android to prevent truncated FTMS packets
        if (Platform.OS === 'android') {
            try {
                await device.requestMTU(512);
            } catch (e) {
                console.warn('[BluetoothManager] MTU negotiation failed:', e);
                // Non-fatal — continue with default MTU
            }
        }

        return device;
    }

    /**
     * Disconnect from a device and clean up subscriptions.
     */
    async disconnect(deviceId: string): Promise<void> {
        // Flush the write queue to send any pending teardown commands
        await this.queue.flush();

        // Remove all notification subscriptions
        this.clearSubscriptions();

        try {
            await this.manager.cancelDeviceConnection(deviceId);
        } catch (e) {
            console.warn('[BluetoothManager] Disconnect error:', e);
        }
    }

    // =======================
    // Write (queued)
    // =======================

    /**
     * Write data to a characteristic, routed through the QueueManager.
     * Enforces the 200ms minimum delay between writes.
     */
    async write(
        deviceId: string,
        serviceUUID: string,
        charUUID: string,
        data: Uint8Array
    ): Promise<void> {
        const base64 = toBase64(data);
        await this.queue.enqueue(async () => {
            await this.manager.writeCharacteristicWithResponseForDevice(
                deviceId,
                serviceUUID,
                charUUID,
                base64
            );
        });
    }

    // =======================
    // Notifications
    // =======================

    /**
     * Subscribe to notifications from a characteristic.
     */
    subscribe(
        deviceId: string,
        serviceUUID: string,
        charUUID: string,
        onData: NotificationCallback
    ): void {
        const sub = this.manager.monitorCharacteristicForDevice(
            deviceId,
            serviceUUID,
            charUUID,
            (error, characteristic) => {
                if (error) {
                    console.error('[BluetoothManager] Notification error:', error.message);
                    return;
                }
                if (characteristic?.value) {
                    const bytes = fromBase64(characteristic.value);
                    onData(bytes, charUUID);
                }
            }
        );
        this.subscriptions.push(sub);
    }

    /** Remove all active notification subscriptions. */
    clearSubscriptions(): void {
        for (const sub of this.subscriptions) {
            sub.remove();
        }
        this.subscriptions = [];
    }

    /** Access the write queue (for testing or advanced use). */
    getQueue(): QueueManager {
        return this.queue;
    }

    /** Destroy the BleManager instance (for cleanup). */
    destroy(): void {
        this.clearSubscriptions();
        this.queue.clear();
        this.manager.destroy();
    }
}
