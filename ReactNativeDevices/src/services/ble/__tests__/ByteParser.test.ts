// ============================================================
// __tests__/ByteParser.test.ts — ByteParser unit tests
// ============================================================

import {
    readUint16LE,
    readUint16BE,
    readUint24LE,
    readSint16LE,
    readSint16BE,
    readUint8,
    applyScale,
    calculateChecksum,
    appendChecksum,
    toBase64,
    fromBase64,
    toUint8Array,
} from '../utils/ByteParser';

describe('ByteParser', () => {
    describe('readUint16LE', () => {
        it('reads little-endian uint16 correctly', () => {
            const data = new Uint8Array([0xe8, 0x03]); // 1000 in LE
            expect(readUint16LE(data, 0)).toBe(1000);
        });

        it('reads zero', () => {
            const data = new Uint8Array([0x00, 0x00]);
            expect(readUint16LE(data, 0)).toBe(0);
        });

        it('reads max uint16', () => {
            const data = new Uint8Array([0xff, 0xff]);
            expect(readUint16LE(data, 0)).toBe(65535);
        });
    });

    describe('readUint16BE', () => {
        it('reads big-endian uint16 correctly', () => {
            const data = new Uint8Array([0x03, 0xe8]); // 1000 in BE
            expect(readUint16BE(data, 0)).toBe(1000);
        });
    });

    describe('readUint24LE', () => {
        it('reads 24-bit LE value for FTMS distance', () => {
            const data = new Uint8Array([0x64, 0x00, 0x00]); // 100 meters
            expect(readUint24LE(data, 0)).toBe(100);
        });

        it('reads larger 24-bit value', () => {
            // 50000 = 0x00C350 → LE: [0x50, 0xC3, 0x00]
            const data = new Uint8Array([0x50, 0xc3, 0x00]);
            expect(readUint24LE(data, 0)).toBe(50000);
        });
    });

    describe('readSint16LE (Two\'s Complement)', () => {
        it('reads positive sint16', () => {
            const data = new Uint8Array([0xe8, 0x03]); // +1000
            expect(readSint16LE(data, 0)).toBe(1000);
        });

        it('reads negative sint16 correctly (Two\'s Complement)', () => {
            // -1 = 0xFFFF in uint16
            const data = new Uint8Array([0xff, 0xff]);
            expect(readSint16LE(data, 0)).toBe(-1);
        });

        it('reads -100 correctly', () => {
            // -100 = 0xFF9C in uint16
            const data = new Uint8Array([0x9c, 0xff]);
            expect(readSint16LE(data, 0)).toBe(-100);
        });

        it('reads zero', () => {
            const data = new Uint8Array([0x00, 0x00]);
            expect(readSint16LE(data, 0)).toBe(0);
        });

        it('reads max positive sint16 (32767)', () => {
            const data = new Uint8Array([0xff, 0x7f]);
            expect(readSint16LE(data, 0)).toBe(32767);
        });

        it('reads min negative sint16 (-32768)', () => {
            const data = new Uint8Array([0x00, 0x80]);
            expect(readSint16LE(data, 0)).toBe(-32768);
        });
    });

    describe('readSint16BE', () => {
        it('reads negative sint16 in big-endian', () => {
            const data = new Uint8Array([0xff, 0x9c]); // -100 in BE
            expect(readSint16BE(data, 0)).toBe(-100);
        });
    });

    describe('applyScale', () => {
        it('scales speed by 0.01', () => {
            expect(applyScale(1000, 0.01)).toBeCloseTo(10.0);
        });

        it('scales cadence by 0.5', () => {
            expect(applyScale(160, 0.5)).toBe(80);
        });
    });

    describe('calculateChecksum', () => {
        it('calculates lower 8 bits of sum', () => {
            expect(calculateChecksum([0x02, 0x42, 0x01, 0x00])).toBe(0x45);
        });

        it('wraps around at 256', () => {
            expect(calculateChecksum([0x80, 0x80, 0x80])).toBe((0x80 * 3) & 0xff);
        });
    });

    describe('appendChecksum', () => {
        it('appends correct checksum byte', () => {
            const result = appendChecksum([0x02, 0x42, 0x01, 0x00]);
            expect(result).toEqual([0x02, 0x42, 0x01, 0x00, 0x45]);
        });
    });

    describe('Base64 roundtrip', () => {
        it('converts Uint8Array → Base64 → Uint8Array', () => {
            const original = new Uint8Array([0x02, 0x42, 0xff, 0x00, 0x80]);
            const base64 = toBase64(original);
            const restored = fromBase64(base64);
            expect(Array.from(restored)).toEqual(Array.from(original));
        });

        it('handles empty array', () => {
            const original = new Uint8Array([]);
            const base64 = toBase64(original);
            const restored = fromBase64(base64);
            expect(restored.length).toBe(0);
        });
    });
});
