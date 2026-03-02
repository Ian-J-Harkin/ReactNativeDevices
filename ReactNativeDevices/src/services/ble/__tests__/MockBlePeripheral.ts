// ============================================================
// __tests__/MockBlePeripheral.ts — Virtual BLE device simulator
// ============================================================
//
// Replaces react-native-ble-plx in tests (via Jest moduleNameMapper).
// Generates known binary packets for all three protocols so we can
// verify parsing logic without physical hardware.
// ============================================================

import { toUint8Array, appendChecksum } from '../utils/ByteParser';

// ---- Mock packet generators ----

/**
 * Generate an FTMS Indoor Bike notification packet.
 * Flags: Bit 1 (speed) + Bit 3 (cadence) + Bit 5 (distance) = 0b00101010 = 0x2A
 */
export function mockFtmsBikePacket(opts: {
    speed?: number;    // km/h (will be / 0.01 for raw)
    cadence?: number;  // RPM (will be / 0.5 for raw)
    distance?: number; // meters (uint24)
}): Uint8Array {
    const flags = 0x002a; // bits 1, 3, 5
    const bytes: number[] = [
        flags & 0xff,
        (flags >> 8) & 0xff,
    ];

    // Speed (2 bytes LE, scale 0.01)
    const rawSpeed = Math.round((opts.speed ?? 0) / 0.01);
    bytes.push(rawSpeed & 0xff, (rawSpeed >> 8) & 0xff);

    // Cadence (2 bytes LE, scale 0.5)
    const rawCadence = Math.round((opts.cadence ?? 0) / 0.5);
    bytes.push(rawCadence & 0xff, (rawCadence >> 8) & 0xff);

    // Distance (3 bytes LE, uint24)
    const dist = opts.distance ?? 0;
    bytes.push(dist & 0xff, (dist >> 8) & 0xff, (dist >> 16) & 0xff);

    return toUint8Array(bytes);
}

/**
 * Generate an FTMS Treadmill notification packet.
 * Flags: Bit 1 (speed) + Bit 3 (distance) + Bit 9 (HR) = 0b1000001010 = 0x020A
 */
export function mockFtmsTreadmillPacket(opts: {
    speed?: number;      // km/h
    distance?: number;   // meters
    heartRate?: number;  // BPM
}): Uint8Array {
    const flags = 0x020a; // bits 1, 3, 9
    const bytes: number[] = [
        flags & 0xff,
        (flags >> 8) & 0xff,
    ];

    // Speed (2 bytes LE, scale 0.01)
    const rawSpeed = Math.round((opts.speed ?? 0) / 0.01);
    bytes.push(rawSpeed & 0xff, (rawSpeed >> 8) & 0xff);

    // Distance (3 bytes LE)
    const dist = opts.distance ?? 0;
    bytes.push(dist & 0xff, (dist >> 8) & 0xff, (dist >> 16) & 0xff);

    // Heart Rate (1 byte)
    bytes.push(opts.heartRate ?? 0);

    return toUint8Array(bytes);
}

/**
 * Generate an FTMS Bike packet with cadence but NO speed.
 * Used to test pointer-walker shift correctness.
 * Flags: Bit 3 (cadence) only = 0x08
 */
export function mockFtmsBikeCadenceOnly(cadence: number): Uint8Array {
    const flags = 0x0008; // only bit 3
    const rawCadence = Math.round(cadence / 0.5);
    return toUint8Array([
        flags & 0xff,
        (flags >> 8) & 0xff,
        rawCadence & 0xff,
        (rawCadence >> 8) & 0xff,
    ]);
}

/**
 * Generate a Delightech workout data packet (0x44 prefix).
 */
export function mockDelightechPacket(opts: {
    resistance?: number;
    cadence?: number;
    speed?: number;     // km/h (will be / 0.1 for raw)
    distance?: number;  // meters (will be / 10 for raw, stored as 0.01 km)
    calories?: number;
    heartRate?: number;
}): Uint8Array {
    const bytes: number[] = new Array(11).fill(0);
    bytes[0] = 0x44; // workout data prefix
    bytes[1] = 0x00; // padding
    bytes[2] = opts.resistance ?? 0;
    bytes[3] = opts.cadence ?? 0;

    // Speed (uint16 BE, scale 0.1)
    const rawSpeed = Math.round((opts.speed ?? 0) / 0.1);
    bytes[4] = (rawSpeed >> 8) & 0xff;
    bytes[5] = rawSpeed & 0xff;

    // Distance (uint16 BE, value * 10 = meters → raw = meters / 10)
    const rawDist = Math.round((opts.distance ?? 0) / 10);
    bytes[6] = (rawDist >> 8) & 0xff;
    bytes[7] = rawDist & 0xff;

    // Calories (uint16 BE)
    const cal = opts.calories ?? 0;
    bytes[8] = (cal >> 8) & 0xff;
    bytes[9] = cal & 0xff;

    // Heart Rate
    bytes[10] = opts.heartRate ?? 0;

    return toUint8Array(bytes);
}

/**
 * Generate a Delightech identification response (0x40 prefix).
 */
export function mockDelightechIdentifyResponse(): Uint8Array {
    const bytes = new Array(11).fill(0);
    bytes[0] = 0x40;
    return toUint8Array(bytes);
}

/**
 * Generate a Fitshow Speed/Status packet.
 * [0x02, 0x42, 0x02, SPEED_HB, SPEED_LB, DIST_HB, DIST_LB, 0x00, CHECKSUM]
 */
export function mockFitshowSpeedPacket(opts: {
    speed?: number;
    distance?: number;
}): Uint8Array {
    const speed = opts.speed ?? 0;
    const dist = opts.distance ?? 0;
    const payload = [
        0x02,
        0x42,
        0x02,
        (speed >> 8) & 0xff,
        speed & 0xff,
        (dist >> 8) & 0xff,
        dist & 0xff,
        0x00,
    ];
    return toUint8Array(appendChecksum(payload));
}

/**
 * Generate a Fitshow Calories/Pulse packet.
 * [0x02, 0x42, 0x04, CAL_HB, CAL_LB, PULSE, 0x00, CHECKSUM]
 */
export function mockFitshowCaloriesPacket(opts: {
    calories?: number;
    heartRate?: number;
}): Uint8Array {
    const cal = opts.calories ?? 0;
    const payload = [
        0x02,
        0x42,
        0x04,
        (cal >> 8) & 0xff,
        cal & 0xff,
        opts.heartRate ?? 0,
        0x00,
    ];
    return toUint8Array(appendChecksum(payload));
}

// ---- Mock BleManager class (replaces react-native-ble-plx) ----

export class BleManager {
    startDeviceScan() { }
    stopDeviceScan() { }
    connectToDevice() {
        return Promise.resolve({
            id: 'mock-device',
            name: 'Mock Fitness Device',
            discoverAllServicesAndCharacteristics: () => Promise.resolve(),
            requestMTU: () => Promise.resolve(),
        });
    }
    monitorCharacteristicForDevice() {
        return { remove: () => { } };
    }
    writeCharacteristicWithResponseForDevice() {
        return Promise.resolve();
    }
    cancelDeviceConnection() {
        return Promise.resolve();
    }
    destroy() { }
}

// Re-export types that would come from react-native-ble-plx
export type Device = any;
export type Subscription = { remove: () => void };

describe('MockBlePeripheral', () => {
    it('exports mock generators correctly', () => {
        expect(typeof mockFtmsBikePacket).toBe('function');
    });
});
