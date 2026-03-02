// ============================================================
// protocols/DelightechStrategy.ts — Delightech (Proprietary)
// ============================================================
//
// Proprietary protocol using characteristic 0xFFF1 for both
// reads and writes. Uses fixed-position byte parsing and
// requires a 1Hz keep-alive ping (0x20).
// ============================================================

import {
    IProtocol,
    CommandType,
    ProtocolType,
    WorkoutState,
} from '../types/protocol';
import {
    readUint16BE,
    readUint8,
    applyScale,
    appendChecksum,
    toUint8Array,
} from '../utils/ByteParser';

// Delightech uses a single characteristic for everything
const CHAR_UUID = '0000fff1-0000-1000-8000-00805f9b34fb';
const SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';

// Delightech command prefixes
const CMD_INFO = 0x40;        // Probe / identification
const CMD_WORKOUT_DATA = 0x44; // Workout data notification prefix
const CMD_PING = 0x20;        // Keep-alive / data request
const CMD_START = 0x01;
const CMD_PAUSE = 0x02;
const CMD_SET_RESISTANCE = 0x04;

/** Standard Delightech packet length (padded with 0x00) */
const PACKET_LENGTH = 11;

export class DelightechStrategy implements IProtocol {
    readonly name = 'Delightech';
    readonly type = ProtocolType.DELIGHTECH;
    readonly serviceUUIDs = [SERVICE_UUID];
    readonly notifyCharUUIDs = [CHAR_UUID];
    readonly writeCharUUIDs = [CHAR_UUID];

    /**
     * Identify Delightech by checking if the response prefix is 0x40 (Info).
     * This is sent in response to the probe command.
     */
    identify(data: Uint8Array, characteristicUUID: string): boolean {
        const lower = characteristicUUID.toLowerCase();
        if (!lower.includes('fff1')) return false;
        return data.length > 0 && data[0] === CMD_INFO;
    }

    /**
     * Parse workout data from a Delightech notification.
     * Only parses 0x44-prefixed packets (workout data).
     *
     * Fixed-position map (0x44 prefix):
     *   Index 2:   Resistance (1 byte)
     *   Index 3:   Cadence RPM (1 byte)
     *   Index 4-5: Speed (uint16 BE, scale 0.1 km/h)
     *   Index 6-7: Distance (uint16 BE, scale 0.01 km → multiply by 10 for meters)
     *   Index 8-9: Calories (uint16 BE, kcal)
     *   Index 10:  Heart Rate (uint8, BPM)
     */
    parse(data: Uint8Array, _characteristicUUID: string): Partial<WorkoutState> {
        const result: Partial<WorkoutState> = {
            protocol: ProtocolType.DELIGHTECH,
            timestamp: Date.now(),
        };

        // Only parse 0x44-prefixed workout data packets
        if (data.length < 11 || data[0] !== CMD_WORKOUT_DATA) {
            return result;
        }

        result.resistance = readUint8(data, 2);
        result.cadence = readUint8(data, 3);
        result.speed = applyScale(readUint16BE(data, 4), 0.1);
        // Distance comes as 0.01 km — convert to meters: value * 0.01 * 1000 = value * 10
        result.distance = applyScale(readUint16BE(data, 6), 10);
        result.calories = readUint16BE(data, 8);
        result.heartRate = readUint8(data, 10);

        return result;
    }

    /**
     * Generate Delightech command packets.
     * All packets are padded to PACKET_LENGTH and checksummed.
     */
    getCommand(type: CommandType, params?: Record<string, number>): Uint8Array[] {
        switch (type) {
            case CommandType.CONNECT:
                return [this.buildPacket([CMD_INFO, 0x00])];

            case CommandType.GET_WORKOUT_DATA:
                return [this.buildPacket([CMD_PING])];

            case CommandType.START:
                return [this.buildPacket([CMD_PING, CMD_START])];

            case CommandType.PAUSE:
                return [this.buildPacket([CMD_PING, CMD_PAUSE])];

            case CommandType.SET_RESISTANCE: {
                const level = params?.level ?? 0;
                return [this.buildPacket([CMD_PING, CMD_SET_RESISTANCE, level & 0xff])];
            }

            default:
                return [];
        }
    }

    // ------- Internal -------

    /**
     * Build a padded, checksummed Delightech packet.
     * [data..., 0x00 padding..., checksum]
     */
    private buildPacket(payload: number[]): Uint8Array {
        // Pad payload to (PACKET_LENGTH - 1) bytes, then append checksum
        const padded = [...payload];
        while (padded.length < PACKET_LENGTH - 1) {
            padded.push(0x00);
        }
        return toUint8Array(appendChecksum(padded));
    }
}
