// ============================================================
// __tests__/DataAccumulator.test.ts — Accumulator logic tests
// ============================================================

import { DataAccumulator } from '../middleware/DataAccumulator';
import { ProtocolType } from '../types/protocol';

describe('DataAccumulator', () => {
    let accumulator: DataAccumulator;

    beforeEach(() => {
        accumulator = new DataAccumulator();
    });

    describe('Distance offset accumulation', () => {
        it('accumulates distance across pause/resume cycles', () => {
            // Step 1: Send 100m
            const r1 = accumulator.accumulate({
                distance: 100,
                protocol: ProtocolType.FTMS,
                timestamp: Date.now(),
            });
            expect(r1.distance).toBe(100);

            // Step 2: Pause + hardware resets to 0m
            accumulator.setPaused(true);
            const r2 = accumulator.accumulate({
                distance: 0,
                protocol: ProtocolType.FTMS,
                timestamp: Date.now(),
            });
            // Should freeze at last known value (100m)
            expect(r2.distance).toBe(100);

            // Step 3: Resume + hardware sends 10m (new segment)
            accumulator.setPaused(false);
            const r3 = accumulator.accumulate({
                distance: 10,
                protocol: ProtocolType.FTMS,
                timestamp: Date.now(),
            });
            // Should be 100 (offset) + 10 = 110m
            expect(r3.distance).toBe(110);
        });
    });

    describe('Deep merge (fragmented data)', () => {
        it('preserves speed from previous packet when only calories arrive', () => {
            // Packet 1: speed only
            accumulator.accumulate({
                speed: 15.5,
                protocol: ProtocolType.FITSHOW,
                timestamp: Date.now(),
            });

            // Packet 2: calories only (no speed)
            const result = accumulator.accumulate({
                calories: 42,
                protocol: ProtocolType.FITSHOW,
                timestamp: Date.now(),
            });

            // Speed should be preserved from packet 1
            expect(result.speed).toBe(15.5);
            expect(result.calories).toBe(42);
        });

        it('overwrites a field when a newer value arrives', () => {
            accumulator.accumulate({
                speed: 10,
                protocol: ProtocolType.FTMS,
                timestamp: Date.now(),
            });

            const result = accumulator.accumulate({
                speed: 20,
                protocol: ProtocolType.FTMS,
                timestamp: Date.now(),
            });

            expect(result.speed).toBe(20);
        });
    });

    describe('HR priority', () => {
        it('uses equipment HR when available', () => {
            accumulator.setExternalHR(72);

            const result = accumulator.accumulate({
                heartRate: 145,
                protocol: ProtocolType.FTMS,
                timestamp: Date.now(),
            });

            // Equipment HR (145) takes priority over external (72)
            expect(result.heartRate).toBe(145);
        });

        it('falls back to external HR when equipment HR is 0', () => {
            accumulator.setExternalHR(72);

            const result = accumulator.accumulate({
                heartRate: 0,
                protocol: ProtocolType.FTMS,
                timestamp: Date.now(),
            });

            expect(result.heartRate).toBe(72);
        });

        it('returns undefined HR when neither source has data', () => {
            const result = accumulator.accumulate({
                speed: 10,
                protocol: ProtocolType.FTMS,
                timestamp: Date.now(),
            });

            expect(result.heartRate).toBeUndefined();
        });
    });

    describe('reset', () => {
        it('clears all accumulated state', () => {
            accumulator.accumulate({
                speed: 25,
                distance: 500,
                protocol: ProtocolType.FTMS,
                timestamp: Date.now(),
            });

            accumulator.reset();

            const result = accumulator.accumulate({
                speed: 5,
                protocol: ProtocolType.FTMS,
                timestamp: Date.now(),
            });

            expect(result.speed).toBe(5);
            expect(result.distance).toBe(0); // offset should be cleared
        });
    });
});
