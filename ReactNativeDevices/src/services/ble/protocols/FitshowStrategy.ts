// ============================================================
// protocols/FitshowStrategy.ts — Fitshow / Yeekang (Proprietary)
// ============================================================
//
// Proprietary protocol using service 0xFFF0 with separate
// write (0xFFF2) and notify (0xFFF1) characteristics.
// Sends fragmented data via two distinct packet types that
// must be merged into a single WorkoutState.
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
    appendChecksum,
    toUint8Array,
} from '../utils/ByteParser';

// Fitshow UUIDs
const SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const WRITE_CHAR_UUID = '0000fff2-0000-1000-8000-00805f9b34fb';
const NOTIFY_CHAR_UUID = '0000fff1-0000-1000-8000-00805f9b34fb';

// Fitshow packet structure
const PREFIX = 0x02;
const CMD_ID = 0x42;
const SPEED_STATUS_TYPE = 0x02; // Speed/Status packet sub-type
const CALORIES_PULSE_TYPE = 0x04; // Calories/Pulse packet sub-type

export class FitshowStrategy implements IProtocol {
    readonly name = 'Fitshow';
    readonly type = ProtocolType.FITSHOW;
    readonly serviceUUIDs = [SERVICE_UUID];
    readonly notifyCharUUIDs = [NOTIFY_CHAR_UUID];
    readonly writeCharUUIDs = [WRITE_CHAR_UUID];

    /**
     * Identify Fitshow by checking for the [0x02, 0x42] prefix
     * on a notification from the FFF1 characteristic.
     */
    identify(data: Uint8Array, characteristicUUID: string): boolean {
        const lower = characteristicUUID.toLowerCase();
        if (!lower.includes('fff1')) return false;
        return data.length >= 2 && data[0] === PREFIX && data[1] === CMD_ID;
    }

    /**
     * Parse Fitshow notification packets.
     * 
     * Two packet types (partial updates that must be merged by DataAccumulator):
     * 
     * Speed/Status [0x02, 0x42, 0x02, SPEED_HB, SPEED_LB, DIST_HB, DIST_LB, ..., CHECKSUM]
     *   - Byte 3-4: Speed (uint16 BE, raw value — scale TBD by device)
     *   - Byte 5-6: Distance (uint16 BE, meters)
     * 
     * Calories/Pulse [0x02, 0x42, 0x04, CAL_HB, CAL_LB, PULSE, ..., CHECKSUM]
     *   - Byte 3-4: Calories (uint16 BE, kcal)
     *   - Byte 5:   Heart Rate (uint8, BPM)
     */
    parse(data: Uint8Array, _characteristicUUID: string): Partial<WorkoutState> {
        const result: Partial<WorkoutState> = {
            protocol: ProtocolType.FITSHOW,
            timestamp: Date.now(),
        };

        if (data.length < 6 || data[0] !== PREFIX || data[1] !== CMD_ID) {
            return result;
        }

        const packetType = data[2];

        if (packetType === SPEED_STATUS_TYPE) {
            // Speed/Status packet
            result.speed = readUint16BE(data, 3); // raw speed — may need scaling per device
            result.distance = readUint16BE(data, 5); // meters
        } else if (packetType === CALORIES_PULSE_TYPE) {
            // Calories/Pulse packet
            result.calories = readUint16BE(data, 3);
            result.heartRate = readUint8(data, 5);
        }

        return result;
    }

    /**
     * Generate Fitshow command packets.
     * All packets follow: [PREFIX, CMD_ID, OpCode, Data, 0x00 padding, Checksum]
     */
    getCommand(type: CommandType, params?: Record<string, number>): Uint8Array[] {
        switch (type) {
            case CommandType.START:
                return [this.buildPacket([PREFIX, CMD_ID, 0x01, 0x00])];

            case CommandType.STOP:
                return [this.buildPacket([PREFIX, CMD_ID, 0x02, 0x00])];

            case CommandType.SET_RESISTANCE: {
                const level = params?.level ?? 0;
                return [this.buildPacket([PREFIX, 0x40, level & 0xff, 0x00])];
            }

            case CommandType.GET_WORKOUT_DATA:
                // Fitshow requires two distinct writes per poll cycle to get full state
                return [
                    this.buildPacket([PREFIX, CMD_ID, SPEED_STATUS_TYPE, 0x00]),
                    this.buildPacket([PREFIX, CMD_ID, CALORIES_PULSE_TYPE, 0x00]),
                ];

            default:
                return [];
        }
    }

    // ------- Internal -------

    /**
     * Build a checksummed Fitshow packet.
     */
    private buildPacket(payload: number[]): Uint8Array {
        return toUint8Array(appendChecksum(payload));
    }
}
