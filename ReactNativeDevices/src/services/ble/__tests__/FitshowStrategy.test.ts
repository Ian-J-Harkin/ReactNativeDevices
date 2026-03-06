import { FitshowStrategy } from '../protocols/FitshowStrategy';
import { ProtocolType, CommandType } from '../types/protocol';

describe('FitshowStrategy', () => {
    let strategy: FitshowStrategy;

    beforeEach(() => {
        strategy = new FitshowStrategy();
    });

    describe('identify()', () => {
        it('accepts characteristic FFF1 with [0x02, 0x42] prefix', () => {
            const data = new Uint8Array([0x02, 0x42, 0x00]);
            expect(strategy.identify(data, '0000fff1-0000-1000-8000-00805f9b34fb')).toBe(true);
        });

        it('rejects characteristic FFF1 with different prefix', () => {
            const data = new Uint8Array([0x02, 0x43, 0x00]);
            expect(strategy.identify(data, '0000fff1-0000-1000-8000-00805f9b34fb')).toBe(false);
        });

        it('rejects non-FFF1 characteristic', () => {
            const data = new Uint8Array([0x02, 0x42, 0x00]);
            expect(strategy.identify(data, '00002ad2-0000-1000-8000-00805f9b34fb')).toBe(false);
        });
    });

    describe('parse()', () => {
        it('parses valid Speed/Status packet (type 0x02)', () => {
            // [0x02, 0x42, 0x02, SPEED_HB, SPEED_LB, DIST_HB, DIST_LB, ..., CHECKSUM]
            const data = new Uint8Array([
                0x02, 0x42, 0x02,
                0x00, 0x96, // Speed (150)
                0x03, 0xE8, // Distance (1000)
                0xFF // Checksum (ignored here)
            ]);

            const result = strategy.parse(data, 'fff1');

            expect(result.protocol).toBe(ProtocolType.FITSHOW);
            expect(result.speed).toBe(150);
            expect(result.distance).toBe(1000);
            expect(result.calories).toBeUndefined();
        });

        it('parses valid Calories/Pulse packet (type 0x04)', () => {
            // [0x02, 0x42, 0x04, CAL_HB, CAL_LB, PULSE, ..., CHECKSUM]
            const data = new Uint8Array([
                0x02, 0x42, 0x04,
                0x01, 0x2C, // Calories (300)
                0x78,       // HR (120)
                0xFF        // Checksum
            ]);

            const result = strategy.parse(data, 'fff1');

            expect(result.protocol).toBe(ProtocolType.FITSHOW);
            expect(result.calories).toBe(300);
            expect(result.heartRate).toBe(120);
            expect(result.speed).toBeUndefined();
        });

        it('returns empty result for non-matching prefix', () => {
            const data = new Uint8Array([0x03, 0x42, 0x02, 0x00, 0x96, 0x03, 0xE8, 0xFF]);
            const result = strategy.parse(data, 'fff1');
            expect(result.speed).toBeUndefined();
        });
    });

    describe('getCommand()', () => {
        const verifyPacket = (packet: Uint8Array, expectedPayload: number[]) => {
            expect(packet.length).toBe(expectedPayload.length + 1);
            for (let i = 0; i < expectedPayload.length; i++) {
                expect(packet[i]).toBe(expectedPayload[i]);
            }
            // Checksum
            let sum = 0;
            for (let i = 0; i < expectedPayload.length; i++) {
                sum = (sum + packet[i]) & 0xFF;
            }
            expect(packet[expectedPayload.length]).toBe(sum);
        };

        it('generates START command', () => {
            const commands = strategy.getCommand(CommandType.START);
            expect(commands).toHaveLength(1);
            verifyPacket(commands[0], [0x02, 0x42, 0x01, 0x00]);
        });

        it('generates STOP command', () => {
            const commands = strategy.getCommand(CommandType.STOP);
            expect(commands).toHaveLength(1);
            verifyPacket(commands[0], [0x02, 0x42, 0x02, 0x00]);
        });

        it('generates SET_RESISTANCE command', () => {
            const commands = strategy.getCommand(CommandType.SET_RESISTANCE, { level: 14 });
            expect(commands).toHaveLength(1);
            verifyPacket(commands[0], [0x02, 0x40, 14, 0x00]);
        });

        it('generates GET_WORKOUT_DATA command (two packets)', () => {
            const commands = strategy.getCommand(CommandType.GET_WORKOUT_DATA);
            expect(commands).toHaveLength(2);
            verifyPacket(commands[0], [0x02, 0x42, 0x02, 0x00]);
            verifyPacket(commands[1], [0x02, 0x42, 0x04, 0x00]);
        });
    });
});
