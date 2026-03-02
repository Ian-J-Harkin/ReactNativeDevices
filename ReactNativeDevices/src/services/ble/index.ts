// ============================================================
// index.ts — Barrel export for the BLE service module
// ============================================================

// Types
export {
    CommandType,
    ConnectionState,
    WorkoutStatus,
    ProtocolType,
    FtmsDeviceType,
} from './types/protocol';
export type {
    IProtocol,
    WorkoutState,
    FieldTimestamp,
} from './types/protocol';
export { UnifiedWorkoutDataSchema, WorkoutStatusSchema } from './types/schemas';
export type { UnifiedWorkoutData } from './types/schemas';

// Utilities
export { QueueManager, writeQueue } from './utils/QueueManager';
export * as ByteParser from './utils/ByteParser';

// Protocol Strategies
export { FtmsStrategy } from './protocols/FtmsStrategy';
export { DelightechStrategy } from './protocols/DelightechStrategy';
export { FitshowStrategy } from './protocols/FitshowStrategy';

// Core Services
export { BluetoothManager } from './services/BluetoothManager';
export { ProtocolRegistry } from './services/ProtocolRegistry';
export { DeviceSession } from './services/DeviceSession';

// Middleware
export { DataAccumulator } from './middleware/DataAccumulator';

// React Hook
export { useWorkout } from './hooks/useWorkout';
export type { UseWorkoutResult, ScannedDevice } from './hooks/useWorkout';
