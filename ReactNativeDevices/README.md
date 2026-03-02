# BLE Fitness Bridge

A multi-protocol BLE fitness bridge for React Native. Connects to gym equipment (bikes, rowers, treadmills) using **FTMS**, **Delightech**, and **Fitshow/Yeekang** protocols via a unified Strategy pattern.

## Architecture

```
src/services/ble/
├── types/           # IProtocol interface, WorkoutState, Zod schemas
├── utils/           # ByteParser (LE/BE, sint16), QueueManager (200ms FIFO)
├── protocols/       # FtmsStrategy, DelightechStrategy, FitshowStrategy
├── services/        # BluetoothManager, DeviceSession, ProtocolRegistry
├── middleware/      # DataAccumulator (deep merge, HR priority, fallback speed)
├── hooks/           # useWorkout React hook
└── __tests__/       # Jest tests with MockBlePeripheral
```

## Quick Start

```bash
npm install
npm test
```

## Key Features

- **Pointer-Walker FTMS parser** — handles variable-length bitmask packets for Bike, Rower, and Treadmill
- **Deep merge accumulator** — preserves fields across fragmented protocol updates with per-field timestamps
- **Fallback speed estimation** — `Speed = Cadence × 0.2` for legacy machines
- **Android 12+ BLE permissions** — runtime permission requests for `BLUETOOTH_SCAN` / `BLUETOOTH_CONNECT`
- **200ms write queue** — prevents Android Bluetooth stack crashes
- **7s Delightech reconnection cooldown** — respects proprietary BLE timing requirements

## Usage

```tsx
import { useWorkout } from './services/ble';

function WorkoutScreen() {
  const { data, status, scan, connect, start, pause, setResistance } = useWorkout();

  // data.speed, data.cadence, data.distance, data.heartRate, ...
}
```

## Testing

53 unit tests across 6 suites, using a `MockBlePeripheral` that generates known binary packets for all three protocols. No physical hardware required.

```bash
npx jest --verbose
```
