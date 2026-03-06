// ============================================================
// protocols/FtmsStrategy.ts — FTMS (Fitness Machine Service)
// ============================================================
//
// Standard BLE Fitness Machine Service (0x1826).
// Uses the "Pointer-Walker" algorithm to parse bitmask-flagged
// notification packets for Indoor Bike, Rower, and Treadmill.
// ============================================================

import {
    IProtocol,
    CommandType,
    ProtocolType,
    FtmsDeviceType,
    WorkoutState,
} from '../types/protocol';
import {
    readUint16LE,
    readUint24LE,
    readSint16LE,
    readUint8,
    applyScale,
    toUint8Array,
} from '../utils/ByteParser';

// FTMS UUIDs (lowercase, no 0x prefix, for react-native-ble-plx)
const SERVICE_UUID = '00001826-0000-1000-8000-00805f9b34fb';
const CONTROL_POINT_UUID = '00002ad3-0000-1000-8000-00805f9b34fb';
const INDOOR_BIKE_UUID = '00002ad2-0000-1000-8000-00805f9b34fb';
const ROWER_UUID = '00002ad1-0000-1000-8000-00805f9b34fb';
const TREADMILL_UUID = '00002acd-0000-1000-8000-00805f9b34fb';

// Short UUIDs for matching (some BLE stacks report short form)
const SHORT_SERVICE = '1826';
const SHORT_UUIDS = ['2ad2', '2ad1', '2acd', '2ad3'];

export class FtmsStrategy implements IProtocol {
    readonly name = 'FTMS';
    readonly type = ProtocolType.FTMS;
    readonly serviceUUIDs = [SERVICE_UUID];
    readonly notifyCharUUIDs = [INDOOR_BIKE_UUID, ROWER_UUID, TREADMILL_UUID];
    readonly writeCharUUIDs = [CONTROL_POINT_UUID];

    /**
     * Identify FTMS by the presence of service 0x1826.
     * Also accepts any data arriving on a known FTMS characteristic.
     */
    identify(_data: Uint8Array, characteristicUUID: string): boolean {
        const lower = characteristicUUID.toLowerCase();
        return (
            lower.includes(SHORT_SERVICE) ||
            SHORT_UUIDS.some((u) => lower.includes(u))
        );
    }

    /**
     * Parse raw notification bytes using the Pointer-Walker algorithm.
     * Dispatches to the correct sub-parser based on characteristic UUID.
     */
    parse(data: Uint8Array, characteristicUUID: string): Partial<WorkoutState> {
        const lower = characteristicUUID.toLowerCase();

        if (lower.includes('2ad2')) return this.parseBike(data);
        if (lower.includes('2ad1')) return this.parseRower(data);
        if (lower.includes('2acd')) return this.parseTreadmill(data);

        return { protocol: ProtocolType.FTMS, timestamp: Date.now() };
    }

    /**
     * Generate FTMS Control Point command packets.
     *
     * TODO(FTMS-SPEC-REVIEW): The opcodes below come from the original architect spec
     * (gem_architect_plan.md), which targets Control Point 0x2AD3. The official Bluetooth
     * SIG "Fitness Machine Service" spec (v1.0 / v1.0.1) defines the Control Point as
     * 0x2AD9 with different opcodes:
     *
     *   0x06 = Stop            (current code: 0x08, 0x01)
     *   0x07 = Start/Resume    (matches)
     *   0x10 = Request Control (current code: 0x00)
     *
     * The current opcodes work with the devices tested during initial development.
     * Validate against the Bluetooth SIG assigned numbers (GASS) if targeting
     * fully-compliant FTMS machines. This should be a separate remediation item.
     */
    getCommand(type: CommandType, params?: Record<string, number>): Uint8Array[] {
        switch (type) {
            case CommandType.REQUEST_CONTROL:
                return [toUint8Array([0x00])];

            case CommandType.RESET:
                return [toUint8Array([0x01])];

            case CommandType.SET_TARGET_SPEED: {
                // Speed scaled by 0.01, so 10 km/h = 1000
                const speed = params?.speed ?? 0;
                const scaled = Math.round(speed / 0.01);
                return [toUint8Array([0x02, scaled & 0xff, (scaled >> 8) & 0xff])];
            }

            case CommandType.SET_RESISTANCE: {
                const level = params?.level ?? 0;
                return [toUint8Array([0x04, level & 0xff])];
            }

            case CommandType.START:
                return [toUint8Array([0x07])];

            case CommandType.STOP:
                return [toUint8Array([0x08, 0x01])]; // 0x01 = Stop

            case CommandType.PAUSE:
                return [toUint8Array([0x08, 0x02])]; // 0x02 = Pause

            default:
                return [];
        }
    }

    // =======================
    // Indoor Bike (0x2AD2)
    // =======================
    private parseBike(raw: Uint8Array): Partial<WorkoutState> {
        const flags = readUint16LE(raw, 0);
        let p = 2; // pointer starts after the 2-byte flags
        const result: Partial<WorkoutState> = {
            protocol: ProtocolType.FTMS,
            timestamp: Date.now(),
        };

        // Bit 0: More Data — always 0 for first packet, no data, no shift

        // Bit 1: Instantaneous Speed (2 bytes, scale 0.01)
        if (flags & (1 << 1)) {
            result.speed = applyScale(readUint16LE(raw, p), 0.01);
            p += 2;
        }

        // Bit 2: Average Speed (2 bytes, scale 0.01) — skip
        if (flags & (1 << 2)) {
            p += 2;
        }

        // Bit 3: Instantaneous Cadence (2 bytes, scale 0.5)
        if (flags & (1 << 3)) {
            result.cadence = applyScale(readUint16LE(raw, p), 0.5);
            p += 2;
        }

        // Bit 4: Average Cadence (2 bytes, scale 0.5) — skip
        if (flags & (1 << 4)) {
            p += 2;
        }

        // Bit 5: Total Distance (3 bytes, uint24, meters)
        if (flags & (1 << 5)) {
            result.distance = readUint24LE(raw, p);
            p += 3;
        }

        // Bit 6: Resistance Level (2 bytes, sint16)
        if (flags & (1 << 6)) {
            result.resistance = readSint16LE(raw, p);
            p += 2;
        }

        // Bit 7: Instantaneous Power (2 bytes, sint16, watts)
        if (flags & (1 << 7)) {
            result.power = readSint16LE(raw, p);
            p += 2;
        }

        // Bit 8: Average Power (2 bytes, sint16) — skip
        if (flags & (1 << 8)) {
            p += 2;
        }

        // Bit 9: Expended Energy (5 bytes: total kcal 2, kcal/h 2, kcal/min 1)
        if (flags & (1 << 9)) {
            result.calories = readUint16LE(raw, p);
            p += 5;
        }

        // Bit 10: Heart Rate (1 byte, uint8, BPM)
        if (flags & (1 << 10)) {
            result.heartRate = readUint8(raw, p);
            p += 1;
        }

        return result;
    }

    // =======================
    // Rower (0x2AD1)
    // =======================
    private parseRower(raw: Uint8Array): Partial<WorkoutState> {
        const flags = readUint16LE(raw, 0);
        let p = 2;
        const result: Partial<WorkoutState> = {
            protocol: ProtocolType.FTMS,
            timestamp: Date.now(),
        };

        // Bit 0: More Data — no shift

        // Bit 1: Stroke Rate (1 byte, scale 0.5)
        if (flags & (1 << 1)) {
            result.strokeRate = applyScale(readUint8(raw, p), 0.5);
            p += 1;
        }

        // Bit 2: Stroke Count (2 bytes, uint16)
        if (flags & (1 << 2)) {
            result.strokeCount = readUint16LE(raw, p);
            p += 2;
        }

        // Bit 3: Average Stroke Rate (1 byte, scale 0.5) — skip
        if (flags & (1 << 3)) {
            p += 1;
        }

        // Bit 4: Total Distance (3 bytes, meters)
        if (flags & (1 << 4)) {
            result.distance = readUint24LE(raw, p);
            p += 3;
        }

        // Bit 5: Instantaneous Pace (2 bytes, seconds/500m)
        if (flags & (1 << 5)) {
            result.pace = readUint16LE(raw, p);
            p += 2;
        }

        // Bit 6: Average Pace (2 bytes) — skip
        if (flags & (1 << 6)) {
            p += 2;
        }

        // Bit 7: Instantaneous Power (2 bytes, sint16, watts)
        if (flags & (1 << 7)) {
            result.power = readSint16LE(raw, p);
            p += 2;
        }

        // Bit 8: Expended Energy (5 bytes: total kcal 2, kcal/h 2, kcal/min 1)
        if (flags & (1 << 8)) {
            result.calories = readUint16LE(raw, p);
            p += 5;
        }

        return result;
    }

    // =======================
    // Treadmill (0x2ACD)
    // =======================
    private parseTreadmill(raw: Uint8Array): Partial<WorkoutState> {
        const flags = readUint16LE(raw, 0);
        let p = 2;
        const result: Partial<WorkoutState> = {
            protocol: ProtocolType.FTMS,
            timestamp: Date.now(),
        };

        // Bit 0: More Data — no shift

        // Bit 1: Instantaneous Speed (2 bytes, scale 0.01 km/h)
        if (flags & (1 << 1)) {
            result.speed = applyScale(readUint16LE(raw, p), 0.01);
            p += 2;
        }

        // Bit 2: Average Speed (2 bytes, scale 0.01 km/h) — skip
        if (flags & (1 << 2)) {
            p += 2;
        }

        // Bit 3: Total Distance (3 bytes, meters)
        if (flags & (1 << 3)) {
            result.distance = readUint24LE(raw, p);
            p += 3;
        }

        // Bit 4: Inclination (2 bytes, scale 0.1%) + Ramp Angle (2 bytes, scale 0.1)
        if (flags & (1 << 4)) {
            result.inclination = applyScale(readSint16LE(raw, p), 0.1);
            p += 4; // inclination (2) + ramp angle (2)
        }

        // Bit 5: Positive Elevation Gain (2 bytes, 0.1m) + Negative (2 bytes, 0.1m)
        if (flags & (1 << 5)) {
            result.elevationGain = applyScale(readUint16LE(raw, p), 0.1);
            p += 4; // positive (2) + negative (2)
        }

        // Bit 6: Instantaneous Pace (1 byte, scale 0.1 km/h)
        if (flags & (1 << 6)) {
            result.pace = applyScale(readUint8(raw, p), 0.1);
            p += 1;
        }

        // Bit 7: Average Pace (1 byte, scale 0.1 km/h) — skip
        if (flags & (1 << 7)) {
            p += 1;
        }

        // Bit 8: Expended Energy (5 bytes: total kcal 2, kcal/h 2, kcal/min 1)
        if (flags & (1 << 8)) {
            result.calories = readUint16LE(raw, p);
            p += 5;
        }

        // Bit 9: Heart Rate (1 byte, BPM)
        if (flags & (1 << 9)) {
            result.heartRate = readUint8(raw, p);
            p += 1;
        }

        // Bit 10: Metabolic Equivalent (1 byte, scale 0.1) — skip
        if (flags & (1 << 10)) {
            p += 1;
        }

        return result;
    }
}
