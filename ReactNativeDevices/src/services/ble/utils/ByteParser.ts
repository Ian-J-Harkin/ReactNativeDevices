// ============================================================
// utils/ByteParser.ts — Low-level byte manipulation for BLE
// ============================================================
//
// Handles endianness, signed integers, scaling, checksums,
// and the Base64 bridge required by react-native-ble-plx.
// ============================================================

import { Buffer } from 'buffer';

/**
 * Read an unsigned 16-bit integer (Little-Endian).
 * Used by FTMS (standard BLE byte order).
 */
export function readUint16LE(data: Uint8Array, offset: number): number {
    if (offset + 1 >= data.length) return 0;
    return (data[offset + 1] << 8) | data[offset];
}

/**
 * Read an unsigned 16-bit integer (Big-Endian).
 * Used by Fitshow/Yeekang.
 */
export function readUint16BE(data: Uint8Array, offset: number): number {
    if (offset + 1 >= data.length) return 0;
    return (data[offset] << 8) | data[offset + 1];
}

/**
 * Read an unsigned 24-bit integer (Little-Endian).
 * Used for FTMS Total Distance fields.
 */
export function readUint24LE(data: Uint8Array, offset: number): number {
    if (offset + 2 >= data.length) return 0;
    return (data[offset + 2] << 16) | (data[offset + 1] << 8) | data[offset];
}

/**
 * Read a signed 16-bit integer (Little-Endian) using Two's Complement.
 * 
 * Used for FTMS Power and Resistance which can be negative.
 * We use explicit bit-shifting `(val << 16) >> 16` to preserve
 * the sign bit, as recommended by the architect spec.
 */
export function readSint16LE(data: Uint8Array, offset: number): number {
    const raw = readUint16LE(data, offset);
    // Two's complement: shift left 16 bits then arithmetic-shift right
    // to sign-extend the 16-bit value to 32 bits.
    return (raw << 16) >> 16;
}

/**
 * Read a signed 16-bit integer (Big-Endian) using Two's Complement.
 */
export function readSint16BE(data: Uint8Array, offset: number): number {
    const raw = readUint16BE(data, offset);
    return (raw << 16) >> 16;
}

/**
 * Read an unsigned 8-bit integer.
 */
export function readUint8(data: Uint8Array, offset: number): number {
    if (offset >= data.length) return 0;
    return data[offset];
}

/**
 * Apply a decimal scale factor to a raw value.
 * Example: applyScale(1234, 0.01) → 12.34 km/h
 */
export function applyScale(value: number, scale: number): number {
    return value * scale;
}

/**
 * Calculate checksum: lower 8 bits of the sum of all preceding bytes.
 * Used by Delightech and Fitshow write packets.
 * 
 *   packet[last] = packet.slice(0, -1).reduce((a, b) => a + b, 0) & 0xFF;
 */
export function calculateChecksum(bytes: number[]): number {
    return bytes.reduce((sum, b) => sum + b, 0) & 0xff;
}

/**
 * Append a checksum byte to a packet.
 * Returns a new array with the checksum as the final byte.
 */
export function appendChecksum(bytes: number[]): number[] {
    return [...bytes, calculateChecksum(bytes)];
}

/**
 * Convert a Uint8Array to a Base64 string.
 * Required by react-native-ble-plx for all write operations.
 */
export function toBase64(data: Uint8Array): string {
    return Buffer.from(data).toString('base64');
}

/**
 * Convert a Base64 string to a Uint8Array.
 * Required to decode react-native-ble-plx notification payloads.
 */
export function fromBase64(base64: string): Uint8Array {
    return new Uint8Array(Buffer.from(base64, 'base64'));
}

/**
 * Convert a plain number[] to a Uint8Array.
 */
export function toUint8Array(bytes: number[]): Uint8Array {
    return new Uint8Array(bytes);
}
