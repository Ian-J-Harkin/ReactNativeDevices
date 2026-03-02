// ============================================================
// __tests__/BmadCalibration.test.ts — BMAD Architect test vectors
// ============================================================
//
// These are the exact calibration test cases provided by the
// BMAD Architect to verify the Pointer-Walker doesn't "drift"
// data across fields, and that checksum math is correct.
// ============================================================

import { FtmsStrategy } from '../protocols/FtmsStrategy';
import { FitshowStrategy } from '../protocols/FitshowStrategy';
import { DataAccumulator } from '../middleware/DataAccumulator';
import { ProtocolType } from '../types/protocol';
import { toUint8Array, appendChecksum } from '../utils/ByteParser';

const ROWER_UUID = '00002ad1-0000-1000-8000-00805f9b34fb';
const BIKE_UUID = '00002ad2-0000-1000-8000-00805f9b34fb';

describe('BMAD Architect Calibration', () => {
    const ftms = new FtmsStrategy();
    const fitshow = new FitshowStrategy();

    // ======================================================
    // Test 1: Rower "Pointer Drift" (Missing Stroke Rate)
    // ======================================================
    //
    // Scenario: Bit 1 (Stroke Rate) is OFF, Bit 2 (Stroke Count)
    // and Bit 4 (Distance) are ON.
    //
    // NOTE: The Architect stated flags 0x0004, but that only sets
    // Bit 2. For Bit 2 + Bit 4, the correct flags are 0x0014.
    // We test both: the corrected scenario AND the original hex.
    // ======================================================
    describe('Rower Pointer Drift', () => {
        it('parses Stroke Count at shifted offset when Stroke Rate is absent (corrected flags 0x0014)', () => {
            // Flags: 0x0014 = Bit 2 (Stroke Count) + Bit 4 (Distance)
            // Stroke Rate (Bit 1) is NOT set → pointer must skip it.
            //
            // Layout:
            //   [0]: flags lo = 0x14
            //   [1]: flags hi = 0x00
            //   [2-3]: Stroke Count uint16 LE = 0x0014 = 20
            //   [4-6]: Distance uint24 LE = 0x000020 = 32
            const packet = toUint8Array([0x14, 0x00, 0x14, 0x00, 0x20, 0x00, 0x00]);
            const result = ftms.parse(packet, ROWER_UUID);

            expect(result.strokeRate).toBeUndefined();
            expect(result.strokeCount).toBe(20);
            expect(result.distance).toBe(32);
        });

        it('parses with original Architect hex 0x0004 (Bit 2 only — no distance)', () => {
            // Flags: 0x0004 = only Bit 2 (Stroke Count)
            // Stroke Count at bytes 2-3 = 0x0014 = 20
            // Distance bit is NOT set, so bytes 4-6 are ignored.
            const packet = toUint8Array([0x04, 0x00, 0x14, 0x00, 0x20, 0x00, 0x00]);
            const result = ftms.parse(packet, ROWER_UUID);

            expect(result.strokeRate).toBeUndefined();
            expect(result.strokeCount).toBe(20);
            expect(result.distance).toBeUndefined();
        });
    });

    // ======================================================
    // Test 2: Bike "Maximum Density" (All Bits High)
    // ======================================================
    //
    // Flags: 0x03FE
    //   Bit 1 (Speed), Bit 2 (Avg Speed), Bit 3 (Cadence),
    //   Bit 4 (Avg Cadence), Bit 5 (Distance), Bit 6 (Resistance),
    //   Bit 7 (Power), Bit 8 (Avg Power), Bit 9 (Energy)
    //
    // NOTE: 0x03FE has bits 1-9 set. The Architect expects HR
    // at the end (Bit 10 = 0x0400), so the actual flags for the
    // full payload with HR must be 0x07FE.
    //
    // Byte-by-byte layout for 0x07FE:
    //   Flags: 2 bytes
    //   Speed: 2B (0x2710 = 10000 → 100.0 km/h)
    //   Avg Speed: 2B (skipped)
    //   Cadence: 2B (0x0032 = 50 → 25.0 RPM)
    //   Avg Cadence: 2B (skipped)
    //   Distance: 3B (0x00012C = 300m)
    //   Resistance: 2B (0x000A = 10)
    //   Power: 2B (0x004B = 75W)
    //   Avg Power: 2B (skipped)
    //   Energy: 5B (0x005A=90 total kcal, 0x001E=30 kcal/h, 0x0F=15 kcal/min)
    //   HR: 1B (0x46 = 70 BPM)
    // ======================================================
    describe('Bike Maximum Density', () => {
        it('parses all fields correctly with 0x07FE flags', () => {
            const packet = toUint8Array([
                // Flags: 0x07FE (bits 1-10 all set)
                0xfe, 0x07,
                // Bit 1: Speed (2B LE) = 10000 → 100.0 km/h
                0x10, 0x27,
                // Bit 2: Avg Speed (2B LE) — skipped in output
                0x00, 0x00,
                // Bit 3: Cadence (2B LE) = 50 → 25.0 RPM
                0x32, 0x00,
                // Bit 4: Avg Cadence (2B LE) — skipped in output
                0x00, 0x00,
                // Bit 5: Distance (3B LE) = 300m
                0x2c, 0x01, 0x00,
                // Bit 6: Resistance (2B LE, sint16) = 10
                0x0a, 0x00,
                // Bit 7: Power (2B LE, sint16) = 75W
                0x4b, 0x00,
                // Bit 8: Avg Power (2B LE) — skipped
                0x00, 0x00,
                // Bit 9: Energy (5B) = 90 kcal total, 30 kcal/h, 15 kcal/min
                0x5a, 0x00, 0x1e, 0x00, 0x0f,
                // Bit 10: HR (1B) = 70 BPM
                0x46,
            ]);

            const result = ftms.parse(packet, BIKE_UUID);

            expect(result.speed).toBeCloseTo(100.0, 1);
            expect(result.cadence).toBeCloseTo(25.0, 1);
            expect(result.distance).toBe(300);
            expect(result.resistance).toBe(10);
            expect(result.power).toBe(75);
            expect(result.calories).toBe(90);
            expect(result.heartRate).toBe(70);
        });

        it('verifies SINT16 power handles negative values in dense packet', () => {
            // Same as above but Power = -50 (0xFFCE in sint16 LE)
            const packet = toUint8Array([
                0xfe, 0x07,  // flags 0x07FE
                0x10, 0x27,  // speed = 10000
                0x00, 0x00,  // avg speed (skip)
                0x32, 0x00,  // cadence = 50
                0x00, 0x00,  // avg cadence (skip)
                0x2c, 0x01, 0x00, // distance = 300
                0x0a, 0x00,  // resistance = 10
                0xce, 0xff,  // power = -50 (sint16)
                0x00, 0x00,  // avg power (skip)
                0x5a, 0x00, 0x1e, 0x00, 0x0f, // energy
                0x46,        // HR = 70
            ]);

            const result = ftms.parse(packet, BIKE_UUID);
            expect(result.power).toBe(-50);
            expect(result.heartRate).toBe(70);
        });
    });

    // ======================================================
    // Test 3: Fitshow Checksum Integrity
    // ======================================================
    describe('Fitshow Checksum', () => {
        it('builds Set Resistance Level 5 with correct checksum', () => {
            const payload = [0x02, 0x40, 0x05, 0x00];
            const withChecksum = appendChecksum(payload);

            // Sum: 0x02 + 0x40 + 0x05 + 0x00 = 0x47
            expect(withChecksum).toEqual([0x02, 0x40, 0x05, 0x00, 0x47]);
        });

        it('Fitshow getCommand SET_RESISTANCE produces checksummed packet', () => {
            const cmds = fitshow.getCommand('SET_RESISTANCE' as any, { level: 5 });
            expect(cmds.length).toBe(1);
            expect(Array.from(cmds[0])).toEqual([0x02, 0x40, 0x05, 0x00, 0x47]);
        });
    });

    // ======================================================
    // Test 4: DataAccumulator Fallback Speed Estimation
    // ======================================================
    describe('Fallback Speed Estimation', () => {
        it('estimates speed from cadence when speed is 0 but cadence > 0', () => {
            const acc = new DataAccumulator();
            const result = acc.accumulate({
                speed: 0,
                cadence: 80,
                protocol: ProtocolType.FTMS,
                timestamp: Date.now(),
            });

            // Fallback: Speed = Cadence × 0.2 = 80 × 0.2 = 16
            expect(result.speed).toBeCloseTo(16.0, 1);
        });

        it('uses reported speed when speed > 0', () => {
            const acc = new DataAccumulator();
            const result = acc.accumulate({
                speed: 25,
                cadence: 80,
                protocol: ProtocolType.FTMS,
                timestamp: Date.now(),
            });

            expect(result.speed).toBe(25);
        });

        it('returns 0 when both speed and cadence are 0', () => {
            const acc = new DataAccumulator();
            const result = acc.accumulate({
                speed: 0,
                cadence: 0,
                protocol: ProtocolType.FTMS,
                timestamp: Date.now(),
            });

            expect(result.speed).toBe(0);
        });
    });
});
