// ============================================================
// __tests__/FtmsStrategy.test.ts — FTMS pointer-walker tests
// ============================================================

import { FtmsStrategy } from '../protocols/FtmsStrategy';
import {
    mockFtmsBikePacket,
    mockFtmsTreadmillPacket,
    mockFtmsBikeCadenceOnly,
} from './MockBlePeripheral';

describe('FtmsStrategy', () => {
    const ftms = new FtmsStrategy();
    const BIKE_UUID = '00002ad2-0000-1000-8000-00805f9b34fb';
    const TREADMILL_UUID = '00002acd-0000-1000-8000-00805f9b34fb';

    describe('identify', () => {
        it('identifies FTMS by characteristic UUID', () => {
            const data = new Uint8Array([0x00]);
            expect(ftms.identify(data, BIKE_UUID)).toBe(true);
            expect(ftms.identify(data, TREADMILL_UUID)).toBe(true);
        });

        it('rejects non-FTMS UUID', () => {
            const data = new Uint8Array([0x00]);
            expect(ftms.identify(data, '0000fff1-0000-1000-8000-00805f9b34fb')).toBe(false);
        });
    });

    describe('parseBike', () => {
        it('parses speed, cadence, and distance from a complete packet', () => {
            const packet = mockFtmsBikePacket({
                speed: 25.0,   // 25 km/h
                cadence: 80,   // 80 RPM
                distance: 1500, // 1500 meters
            });

            const result = ftms.parse(packet, BIKE_UUID);

            expect(result.speed).toBeCloseTo(25.0, 1);
            expect(result.cadence).toBeCloseTo(80, 0);
            expect(result.distance).toBe(1500);
            expect(result.protocol).toBe('FTMS');
        });
    });

    describe('parseTreadmill', () => {
        it('parses speed, distance, and heart rate', () => {
            const packet = mockFtmsTreadmillPacket({
                speed: 10.0,
                distance: 5000,
                heartRate: 145,
            });

            const result = ftms.parse(packet, TREADMILL_UUID);

            expect(result.speed).toBeCloseTo(10.0, 1);
            expect(result.distance).toBe(5000);
            expect(result.heartRate).toBe(145);
        });
    });

    describe('Pointer-Walker shift correctness', () => {
        it('correctly reads cadence when speed bit is NOT set', () => {
            // This is the critical test: with speed missing, cadence should
            // be at pointer offset 2 (right after flags), NOT offset 4.
            const packet = mockFtmsBikeCadenceOnly(90); // 90 RPM

            const result = ftms.parse(packet, BIKE_UUID);

            expect(result.speed).toBeUndefined();
            expect(result.cadence).toBeCloseTo(90, 0);
        });
    });

    describe('getCommand', () => {
        it('generates Request Control command', () => {
            const cmds = ftms.getCommand('REQUEST_CONTROL' as any);
            expect(cmds.length).toBe(1);
            expect(Array.from(cmds[0])).toEqual([0x00]);
        });

        it('generates Start command', () => {
            const cmds = ftms.getCommand('START' as any);
            expect(cmds.length).toBe(1);
            expect(Array.from(cmds[0])).toEqual([0x07]);
        });

        it('generates Set Resistance command', () => {
            const cmds = ftms.getCommand('SET_RESISTANCE' as any, { level: 10 });
            expect(cmds.length).toBe(1);
            expect(Array.from(cmds[0])).toEqual([0x04, 0x0a]);
        });

        it('generates Stop command', () => {
            const cmds = ftms.getCommand('STOP' as any);
            expect(cmds.length).toBe(1);
            expect(Array.from(cmds[0])).toEqual([0x08, 0x01]);
        });
    });
});
