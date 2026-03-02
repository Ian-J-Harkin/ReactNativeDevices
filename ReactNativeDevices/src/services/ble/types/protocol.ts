// ============================================================
// types/protocol.ts — Core type definitions for the BLE bridge
// ============================================================

/**
 * Commands the app can send to fitness equipment.
 */
export enum CommandType {
    CONNECT = 'CONNECT',
    START = 'START',
    PAUSE = 'PAUSE',
    STOP = 'STOP',
    SET_RESISTANCE = 'SET_RESISTANCE',
    SET_TARGET_SPEED = 'SET_TARGET_SPEED',
    RESET = 'RESET',
    REQUEST_CONTROL = 'REQUEST_CONTROL',
    GET_WORKOUT_DATA = 'GET_WORKOUT_DATA',
}

/**
 * Connection lifecycle states (DeviceSession state machine).
 */
export enum ConnectionState {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    IDENTIFYING = 'IDENTIFYING',
    AUTHORIZING = 'AUTHORIZING',
    ACTIVE = 'ACTIVE',
    RECONNECTING = 'RECONNECTING',
    TEARDOWN = 'TEARDOWN',
    TIMEOUT = 'TIMEOUT',
}

/**
 * Workout lifecycle states.
 */
export enum WorkoutStatus {
    IDLE = 'IDLE',
    CONNECTING = 'CONNECTING',
    READY = 'READY',
    WORKING_OUT = 'WORKING_OUT',
    PAUSED = 'PAUSED',
    FINISHED = 'FINISHED',
    TIMEOUT = 'TIMEOUT',
}

/**
 * Supported protocol identifiers.
 */
export enum ProtocolType {
    FTMS = 'FTMS',
    DELIGHTECH = 'DELIGHTECH',
    FITSHOW = 'FITSHOW',
}

/**
 * FTMS device sub-type (determines which bitmask table to use).
 */
export enum FtmsDeviceType {
    INDOOR_BIKE = 'INDOOR_BIKE',     // 0x2AD2
    ROWER = 'ROWER',                 // 0x2AD1
    TREADMILL = 'TREADMILL',         // 0x2ACD
}

/**
 * Unified workout data emitted to the UI layer.
 * Every field is optional because protocols send partial updates.
 */
export interface WorkoutState {
    speed?: number;          // km/h
    cadence?: number;        // RPM
    distance?: number;       // meters (total, accumulated)
    heartRate?: number;      // BPM
    power?: number;          // watts (sint16 — can be negative in theory)
    resistance?: number;     // level (sint16 for FTMS, uint8 for proprietary)
    calories?: number;       // kcal
    strokeRate?: number;     // strokes/min (rower only)
    strokeCount?: number;    // total strokes (rower only)
    inclination?: number;    // % (treadmill only)
    elevationGain?: number;  // meters (treadmill only)
    pace?: number;           // seconds/500m (rower) or km/h (treadmill)
    timestamp: number;       // unix ms when packet arrived
    protocol: ProtocolType;
}

/**
 * Strategy interface — each protocol implements this.
 * Strategies are stateless: they only translate bytes ↔ domain objects.
 */
export interface IProtocol {
    /** Human-readable name */
    readonly name: string;
    /** Protocol identifier */
    readonly type: ProtocolType;
    /** BLE service UUIDs this protocol uses */
    readonly serviceUUIDs: string[];
    /** BLE characteristic UUIDs to subscribe to */
    readonly notifyCharUUIDs: string[];
    /** BLE characteristic UUIDs to write to */
    readonly writeCharUUIDs: string[];

    /**
     * Check if a BLE response belongs to this protocol.
     * Used during the "Identification Race."
     */
    identify(data: Uint8Array, characteristicUUID: string): boolean;

    /**
     * Parse raw BLE notification bytes into a partial WorkoutState.
     * Partial because protocols may send fragmented data.
     */
    parse(data: Uint8Array, characteristicUUID: string): Partial<WorkoutState>;

    /**
     * Generate the byte packets for a given command.
     * Returns an array of packets (some commands require multi-write).
     */
    getCommand(type: CommandType, params?: Record<string, number>): Uint8Array[];
}

/**
 * Per-field metadata tracked by the DataAccumulator for deep merge.
 */
export interface FieldTimestamp {
    value: number;
    lastSeen: number; // unix ms
}
