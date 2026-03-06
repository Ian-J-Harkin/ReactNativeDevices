import { DelightechStrategy } from '../protocols/DelightechStrategy';
import { ProtocolType, CommandType } from '../types/protocol';

describe('DelightechStrategy', () => {
    let strategy: DelightechStrategy;

    beforeEach(() => {
        strategy = new DelightechStrategy();
    });

    describe('identify()', () => {
        it('accepts characteristic FFF1 with 0x40 prefix', () => {
            const data = new Uint8Array([0x40, 0x00]);
            expect(strategy.identify(data, '0000fff1-0000-1000-8000-00805f9b34fb')).toBe(true);
        });

        it('rejects characteristic FFF1 with non-0x40 prefix', () => {
            const data = new Uint8Array([0x44, 0x00]);
            expect(strategy.identify(data, '0000fff1-0000-1000-8000-00805f9b34fb')).toBe(false);
        });

        it('rejects non-FFF1 characteristic', () => {
            const data = new Uint8Array([0x40, 0x00]);
            expect(strategy.identify(data, '00002ad2-0000-1000-8000-00805f9b34fb')).toBe(false);
        });
    });

    describe('parse()', () => {
        it('parses valid 0x44 workout data packet', () => {
            // Index 2:   Resistance (1 byte) -> 0x05 (5)
            // Index 3:   Cadence RPM (1 byte) -> 0x50 (80)
            // Index 4-5: Speed (uint16 BE, scale 0.1 km/h) -> 0x00 0x96 (150 -> 15.0 km/h)
            // Index 6-7: Distance (uint16 BE, scale 0.01 km -> 10m) -> 0x00 0x64 (100 -> 1000m)
            // Index 8-9: Calories (uint16 BE, kcal) -> 0x01 0x2C (300 kcal)
            // Index 10:  Heart Rate (uint8, BPM) -> 0x78 (120)

            const data = new Uint8Array([
                0x44, 0x00, // Prefix
                0x05,       // Resistance
                0x50,       // Cadence
                0x00, 0x96, // Speed
                0x00, 0x64, // Distance
                0x01, 0x2C, // Calories
                0x78        // Heart Rate
            ]);

            const result = strategy.parse(data, 'fff1');

            expect(result.protocol).toBe(ProtocolType.DELIGHTECH);
            expect(result.resistance).toBe(5);
            expect(result.cadence).toBe(80);
            expect(result.speed).toBeCloseTo(15.0);
            expect(result.distance).toBe(1000); // 100 * 10
            expect(result.calories).toBe(300);
            expect(result.heartRate).toBe(120);
        });

        it('returns empty result for non-0x44 prefix', () => {
            const data = new Uint8Array([0x40, 0x00, 0x05, 0x50, 0x00, 0x96, 0x00, 0x64, 0x01, 0x2C, 0x78]);
            const result = strategy.parse(data, 'fff1');
            expect(result.cadence).toBeUndefined();
            expect(result.speed).toBeUndefined();
        });

        it('returns empty result for packet shorter than 11 bytes', () => {
            const data = new Uint8Array([0x44, 0x00, 0x05]);
            const result = strategy.parse(data, 'fff1');
            expect(result.cadence).toBeUndefined();
        });
    });

    describe('getCommand()', () => {
        // A delightech packet is 11 bytes. [data... padded with 0x00... checksum]
        // Checksum is the sum of previous bytes modulo 256.

        const verifyPacket = (commands: Uint8Array[], expectedPrefix: number[]) => {
            expect(commands).toHaveLength(1);
            const packet = commands[0];
            expect(packet).toHaveLength(11);

            // Verify prefix
            for (let i = 0; i < expectedPrefix.length; i++) {
                expect(packet[i]).toBe(expectedPrefix[i]);
            }

            // Verify padding
            for (let i = expectedPrefix.length; i < 10; i++) {
                expect(packet[i]).toBe(0x00);
            }

            // Verify checksum
            let sum = 0;
            for (let i = 0; i < 10; i++) {
                sum = (sum + packet[i]) & 0xFF;
            }
            expect(packet[10]).toBe(sum);
        };

        it('generates CONNECT command', () => {
            const commands = strategy.getCommand(CommandType.CONNECT);
            verifyPacket(commands, [0x40, 0x00]);
        });

        it('generates GET_WORKOUT_DATA (ping) command', () => {
            const commands = strategy.getCommand(CommandType.GET_WORKOUT_DATA);
            verifyPacket(commands, [0x20]);
        });

        it('generates START command', () => {
            const commands = strategy.getCommand(CommandType.START);
            verifyPacket(commands, [0x20, 0x01]);
        });

        it('generates PAUSE command', () => {
            const commands = strategy.getCommand(CommandType.PAUSE);
            verifyPacket(commands, [0x20, 0x02]);
        });

        it('generates STOP command', () => {
            const commands = strategy.getCommand(CommandType.STOP);
            verifyPacket(commands, [0x20, 0x03]);
        });

        it('generates SET_RESISTANCE command', () => {
            const commands = strategy.getCommand(CommandType.SET_RESISTANCE, { level: 14 });
            verifyPacket(commands, [0x20, 0x04, 14]);
        });
    });
});
