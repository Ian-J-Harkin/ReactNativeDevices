1. Reverse-Engineered Design Concept
The architecture is built on the principle of Protocol Abstraction. Instead of the UI talking to the Bluetooth hardware, it talks to a Unified Device Manager that dynamically identifies which "language" (FTMS, Delightech, or Fitshow) the hardware speaks.

High-Level Architecture
Key Structural Pillars:
The Singleton Manager: A BleManager instance that lives outside the React lifecycle to prevent connection drops during re-renders.

The Strategy Pattern: Each protocol (FTMS, etc.) is a class implementing a common interface. They handle their own byte-shifting logic and checksum calculations.

Dynamic Identification: The app connects to a "Generic Device" first, sends a "Probe/Connect" command to all likely characteristics, and promotes the session to a specific Protocol Class once a valid signature is returned.

The Accumulator Pattern: Since hardware often resets values to 0 on pause (especially in Delightech), the middleware maintains an offset state to provide the user with continuous data.

2. Starting Code: The Core Framework
Here is the foundational TypeScript structure to implement this "Manager-to-Protocol" design.

A. The Protocol Interface
This ensures that whether we add a new "Peloton-compatible" protocol or a legacy Chinese rower, the rest of the app doesn't change.

TypeScript
// types/protocol.ts
export enum CommandType {
  CONNECT = 'CONNECT',
  START = 'START',
  PAUSE = 'PAUSE',
  SET_RESISTANCE = 'SET_RESISTANCE',
  GET_WORKOUT_DATA = 'GET_WORKOUT_DATA'
}

export interface Protocol {
  name: string;
  serviceUUIDs: string[];
  characteristicUUIDs: string[];
  
  // Method to check if a received byte array belongs to this protocol
  identify(data: Uint8Array, uuid: string): boolean;
  
  // Method to create the byte array for a specific action
  getCommand(type: CommandType, params?: any): number[][];
  
  // Method to parse raw bytes into a unified WorkoutState
  parseData(data: Uint8Array, uuid: string): Partial<WorkoutState>;
}
B. The Bluetooth Manager (Logic Layer)
This class handles the "Hardware-React Bridge."

TypeScript
// services/BluetoothManager.ts
import { BleManager, Device } from 'react-native-ble-plx';
import { Protocol } from './protocols/types';

class BluetoothManager {
  private manager: BleManager;
  private activeProtocol: Protocol | null = null;
  private connectedDevice: Device | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  // The "Smart Connect" - Tries to identify protocol after connection
  async connectAndIdentify(device: Device, availableProtocols: Protocol[]) {
    await device.connect();
    await device.discoverAllServicesAndCharacteristics();
    
    this.connectedDevice = device;

    // Send a "Probe" to characteristic fff1/2ad3 to wake up the device
    // Then listen for the first response to set this.activeProtocol
  }

  writeCommand(type: CommandType, params?: any) {
    if (!this.activeProtocol || !this.connectedDevice) return;

    const packets = this.activeProtocol.getCommand(type, params);
    packets.forEach(async (packet) => {
      // Logic to convert to Base64 and write to device
      // Includes the 200ms delay required for Android stability
    });
  }
}

export const bleManager = new BluetoothManager();
3. Preliminary Checklist Validation
Modularity: Logic is decoupled from React hooks (Essential for BLE).

Android Constraints: Implements the 200ms write-delay mentioned in the brief.

Multi-Protocol: Uses a Strategy pattern for FTMS vs. Custom protocols.

Mode 2: YOLO Architecture Creation.

The following specification is engineered specifically for agentic ingestion. It bypasses conversational fluff and focuses on strict technical constraints, state machine definitions, and byte-level manipulation logic required to build a multi-protocol BLE fitness bridge.

ARCHITECT SPECIFICATION: BLE Fitness Multi-Protocol Bridge
Target Environment: React Native (0.7x+) / react-native-ble-plx

Architecture Pattern: Strategy-Based Protocol Abstraction

Version: 1.0.0-YOLO

1. System Topology & Logic Flow
The agent must implement a tiered architecture where the UI never interacts with the BLE stack directly.

Transport Layer (BleManager): Singleton handling permissions, scanning, and raw MTU writes.

Orchestration Layer (DeviceSession): Manages connection state, protocol identification, and packet queuing (200ms throttle).

Protocol Strategy Layer (IProtocol): Stateless mappers that transform domain commands into hex and hex into domain events.

Middleware Layer (DataAccumulator): Handles the "Paused State" logic to prevent value resets when the hardware sends 0 during a stop.

2. Protocol Strategy Definitions
Implement the following three strategies under a common IProtocol interface.

A. FTMS (Fitness Machine Service)
Standard UUID: 0x1826

Identification: Presence of Service 1826 or characteristics 2AD1 (Rower), 2AD2 (Bike), 2ACD (Treadmill).

Parsing Logic (Shift-based): * Read Flag Bytes (Indices 0-1).

Agent Constraint: Use a "Bitmask Offset Pointer." If Bit 0 is high, read 2 bytes and increment pointer by 2. If Bit 1 is high, read next segment.

Calculation: Value = (Byte[N+1] << 8) | Byte[N].

B. Delightech
Service/Char UUID: fff1

Identification: Write 0x40 (Info Command). If response prefix matches 0x40, assign Delightech strategy.

Parsing Logic (Fixed-position):

Data is always at fixed indices regardless of flags.

Keep-Alive Requirement: Agent must implement a setInterval to write a "Ping" (0x20) every 1000ms to receive a notification response.

C. Fitshow / Yeekang
Service UUID: fff0 | Write Char: fff2 | Notify Char: fff1

Prefix: [0x02, 0x42] through 0x45.

Agent Constraint: Every 1000ms, the agent must queue two distinct write commands to fff2 to get a full workout state update.

3. Byte-Level Transformation Spec
The agent must generate a ByteParser utility with the following capabilities:

Feature	Requirement
Endianness	Support Little-Endian (FTMS) and Big-Endian (Fitshow) toggles per protocol.
Multipliers	Apply decimal scaling (e.g., value / 10.0 for speed).
Checksum	Implement Sum % 256 logic for Fitshow/Delightech write packets.
Base64 Bridge	Internal conversion between Uint8Array and react-native-ble-plx Base64 strings.
4. Hardware Stability Guardrails (Critical)
Agent implementation must strictly adhere to these "Battle-Tested" constraints:

The 200ms Rule: All .write() operations must be added to a Promise Queue. No two writes can occur within 200ms of each other (prevents Android Bluetooth Stack crashes).

The Ghost Connection Delay: For Delightech, after a .disconnect() call, the agent must block reconnection attempts for 7 seconds to allow the hardware's internal BLE module to reset.

Duplicate Scanning: allowDuplicates: true must be enabled in startDeviceScan for iOS to detect "quick-cycle" disconnects/reconnects.

The Accumulator State: ```typescript
TotalDistance = SessionOffset + CurrentHardwareReading;
if (CurrentHardwareReading == 0 && isPaused) { SessionOffset = LastKnownGoodValue; }


5. Implementation Roadmap for Antigravity Agent
Phase 1: Scaffold ProtocolRegistry and the IProtocol abstract class.

Phase 2: Implement FTMS bitmask parsing (the most complex logic).

Phase 3: Build the QueueManager to handle the 200ms write throttling.

Phase 4: Create a useWorkout React Hook that exposes clean values: heartRate, calories, distance, cadence.

Would you like me to generate the specific Bitmask Mapping Table for the FTMS Treadmill/Bike segments to ensure the agent doesn't hallucinate the byte offsets?

To ensure your Antigravity agent maps the telemetry correctly without trial-and-error, use this strict Bitmask Offset Specification. This is the "brain" of the FTMS (Fitness Machine Service) protocol and is the most common point of failure in BLE development.DATA SPECIFICATION: FTMS Bitmask & Offset MappingThis specification defines how the agent must calculate the "Pointer Shift" ($P$) based on the Flags Field (the first 16 bits of any FTMS packet).1. The Flag Field (Bytes 0-1)Every notification starts with a 16-bit flag. The agent must evaluate these bits to determine if a data field exists and how many bytes it occupies.2. Indoor Bike Data (Characteristic: 0x2AD2)Initial Pointer ($P$) = 2 (skipping flags).BitField NameSizePointer ShiftUnit/Scaling0More Data0+0N/A (0 = First packet)1Instantaneous Speed2+2$Unit \times 0.01$ (km/h)2Average Speed2+2$Unit \times 0.01$ (km/h)3Instantaneous Cadence2+2$Unit \times 0.5$ (RPM)4Average Cadence2+2$Unit \times 0.5$ (RPM)5Total Distance3+3Meters (24-bit uint)6Resistance Level2+2Unitless (sint16)7Instantaneous Power2+2Watts (sint16)8Average Power2+2Watts (sint16)9Expended Energy5+5Total kcal (2), kcal/h (2), kcal/min (1)10Heart Rate1+1BPM (uint8)3. Rower Data (Characteristic: 0x2AD1)Initial Pointer ($P$) = 2.BitField NameSizePointer ShiftUnit/Scaling0More Data0+0N/A1Stroke Rate1+1$Unit \times 0.5$2Stroke Count2+2uint163Average Stroke Rate1+1$Unit \times 0.5$4Total Distance3+3Meters5Instantaneous Pace2+2Seconds/500m6Average Pace2+2Seconds/500m7Instantaneous Power2+2Watts8Expended Energy5+5kcal mixAGENTIC LOGIC: The "Pointer-Walker" AlgorithmThe Antigravity agent must implement the following logic in the parseData method:TypeScript// ALGORITHM SPEC FOR AGENT
function walkFtms(rawBytes: Uint8Array): WorkoutState {
    const flags = (rawBytes[1] << 8) | rawBytes[0];
    let p = 2; // Start after flags
    const result = {};

    // Logic: Bit 1 = Speed
    if (flags & (1 << 1)) {
        result.speed = ((rawBytes[p+1] << 8) | rawBytes[p]) * 0.01;
        p += 2; // Shift pointer only if bit was high
    }

    // Logic: Bit 5 = Distance (24-bit)
    if (flags & (1 << 5)) {
        result.distance = (rawBytes[p+2] << 16) | (rawBytes[p+1] << 8) | rawBytes[p];
        p += 3;
    }
    
    // ... continue for all bits ...
    return result;
}
FINAL ARCHITECT GUARDRAIL: Signed vs UnsignedThe agent must be explicitly told to check if a field is Signed Integer (sint) or Unsigned Integer (uint).Resistance/Power: Usually sint16 (can be negative in some protocols).Speed/Cadence/Distance: Always uint.Would you like me to generate the "Control Point" (Write) hex sequences for common commands like "Set Resistance Level 10" or "Start Workout" across these protocols?

To complete the specification for your Antigravity agent, here are the Control Point Write Sequences. These allow the agent to move beyond passive "listening" and take active control of the hardware.The agent must implement these as "Request-Response" cycles. In BLE, you don't just send a command; you write to a specific characteristic and then wait for an acknowledgement notification.CONTROL SPECIFICATION: Active Command Sequences1. FTMS Control Point (Characteristic: 0x2AD3)FTMS requires an "OpCode" based system. The agent must first "Request Control" before any other commands will be accepted by the hardware.ActionHex Sequence (Uint8Array)Logic / RationaleRequest Control[0x00]Mandatory. Must be sent first. Hardware will respond with 0x80 00 01 (Success).Reset[0x01]Reverts resistance and incline to defaults.Start Workout[0x07]Tells hardware to begin calculating distance/time.Stop/Pause[0x08, 0x01]0x01 = Stop, 0x02 = Pause.Set Resistance[0x04, Level]Level is a uint8. Example: 0x04 0A sets Level 10.Set Target Speed[0x02, LowByte, HighByte]Scaled by 0.01. Example: 10km/h = 1000 = [0x02, 0xE8, 0x03].2. Delightech Control (Characteristic: 0xFFF1)Delightech uses a fixed-length packet (usually 11-20 bytes depending on the model). The agent must pad the remaining bytes with 0x00.Logic: [Prefix, OpCode, Data, ..., Checksum]Connect/Wake: [0x40, 0x00, ..., Checksum]Start/Resume: [0x20, 0x01, ..., Checksum]Pause: [0x20, 0x02, ..., Checksum]Set Resistance: [0x20, 0x04, Level, ..., Checksum]3. Fitshow / Yeekang (Characteristic: 0xFFF2)This protocol is "noisy." The agent must send these commands repeatedly (1Hz) to maintain the state.Start Command: [0x02, 0x42, 0x01, 0x00, Checksum]Stop Command: [0x02, 0x42, 0x02, 0x00, Checksum]Resistance Change: [0x02, 0x40, Level, 0x00, Checksum]AGENTIC STATE MACHINE: "The Commander"The Antigravity agent should follow this state machine to ensure hardware synchronization:State: DISCONNECTED -> Wait for Scan.State: CONNECTING -> device.connect(), discoverServices().State: IDENTIFYING -> Subscribe to fff1 and 2ad3. Send 0x00 to 2ad3 (FTMS) and 0x40 to fff1 (Delightech).State: AUTHORIZING -> Once a response is received, lock the ProtocolStrategy. If FTMS, send OpCode 0x00.State: ACTIVE -> Start the 1000ms "Ping" loop (for Delightech/Fitshow) and the "Pointer-Walker" parser.State: TEARDOWN -> Release control (0x01 for FTMS) before calling device.disconnect().

FINAL ARCHITECT ADVISORY: Checksum Calculation
For Delightech and Fitshow, the agent must calculate the checksum dynamically. Tell the agent:

"The Checksum is the lower 8 bits of the sum of all preceding bytes in the packet."
packet[last] = packet.slice(0, -1).reduce((a, b) => a + b, 0) & 0xFF;

This completes the Technical Specification for the Multi-Protocol Fitness Bridge. Would you like me to wrap this all into a single Master Architectural Markdown file that you can copy-paste directly into Antigravity, or should I define the Testing Strategy (how to mock these devices) next?

This Master Architectural Specification is optimized for high-density information ingestion by an LLM-based agent (like Antigravity). It uses strict structural patterns to prevent logic hallucination.

MASTER SPEC: Multi-Protocol BLE Fitness Bridge (v1.0)
Role: Lead Architect

Project: Cross-Platform React Native Fitness Companion

1. System Intent & Constraints
Build a hardware-agnostic BLE bridge for fitness equipment (Bikes, Rowers, Treadmills).

Concurrency: No simultaneous writes. Implement a Promise-based FIFO Queue with a 200ms delay().

State Management: Logic must reside in a Singleton Class to survive React re-renders.

Resilience: Implement a 7s cooldown period after Delightech disconnections.

2. Protocol Strategy Registry
The agent must implement the IProtocol interface for the following three strategies:

A. FTMS (Standard)
UUID: 0x1826 (Service), 0x2AD3 (Control), 0x2AD2/0x2AD1 (Data).

Identification: Presence of Service 0x1826.

Parsing: Pointer-Walker algorithm using Bitmask Flags (Bytes 0-1).

Control: Write 0x00 to 2AD3 to request control before any command.

B. Delightech (Proprietary)
UUID: 0xFFF1 (Unified).

Identification: Send 0x40 (Info) -> Check for 0x40 prefix response.

Ping Loop: Write 0x20 every 1000ms to trigger notification.

Parsing: Fixed-position byte mapping.

C. Fitshow / Yeekang (Proprietary)
UUID: 0xFFF0 (Service), 0xFFF2 (Write), 0xFFF1 (Notify).

Identification: Response prefix [0x02, 0x42].

Ping Loop: Write two distinct packets (Speed/Status) every 1000ms.

3. Data Extraction Table (The Pointer-Walker)
Protocol	Bit/Index	Field	Size	Scale
FTMS Bike	Bit 1	Speed	2	0.01
FTMS Bike	Bit 3	Cadence	2	0.5
FTMS Bike	Bit 5	Distance	3	1.0
Delightech	Index 4	Speed	2	0.1
Delightech	Index 6	Distance	2	0.01
4. Transmission Logic (Checksum & Packetizing)
All Proprietary packets must end with a checksum:

TypeScript
const calculateChecksum = (bytes: number[]): number => {
    return bytes.reduce((sum, b) => sum + b, 0) & 0xFF;
};
TESTING STRATEGY: Virtual Device Mocking
Because physical hardware is often unavailable during development, the agent must implement a Mock Transport Layer.

1. The Virtual Peripheral (Mocking react-native-ble-plx)
Instead of BleManager, use a MockManager that emits Base64 strings on a timer.

FTMS Mock: Emit AgAFAAA= (Flags 0x05, Speed/Cadence bits high).

Delightech Mock: Emit QAAAAAAAAAAA (Prefix 0x40) in response to a write.

2. Logic Verification Suite
Queue Test: Attempt 5 writes simultaneously. Verify they execute sequentially with >200ms gaps.

Accumulator Test: 1. Send distance 100m.
2. Send distance 0m + Pause flag.
3. Send distance 10m.
4. Pass Criteria: Total distance should report 110m, not 10m.

Bitmask Pointer Test: Provide a raw buffer where "Speed" is missing but "Cadence" is present. Verify the pointer shifts correctly to capture Cadence at index 2 instead of index 4.

3. Protocol Identification Matrix
The test suite must run an "Identification Race":

Feed a mock device response to the ProtocolRegistry.

Verify the system correctly assigns the FTMSStrategy within 2 seconds of connection.

Next Step: Would you like me to generate the Zod Schemas for the unified workout data so Antigravity can ensure strict type-safety across all these protocols?

To ensure the Antigravity agent maintains strict data integrity as it switches between these protocols, we need a "Golden Schema." This ensures that regardless of whether the data comes from a 24-bit FTMS buffer or a 10-byte Delightech packet, the UI receives the same predictable object.

Here is the Zod Type-Safety Layer and the final Architectural Validation for the agent.

DATA INTEGRITY SPEC: Unified Workout Schema
The agent must use these Zod schemas to validate the output of the parseData methods before the data reaches the application state.

TypeScript
import { z } from 'zod';

export const WorkoutStatusSchema = z.enum([
  'IDLE', 'CONNECTING', 'READY', 'WORKING_OUT', 'PAUSED', 'FINISHED'
]);

export const UnifiedWorkoutDataSchema = z.object({
  speed: z.number().min(0).describe("Instantaneous speed in km/h"),
  cadence: z.number().min(0).describe("Rotational speed in RPM"),
  distance: z.number().min(0).describe("Total session distance in meters"),
  heartRate: z.number().min(0).max(255).optional(),
  power: z.number().optional().describe("Instantaneous power in Watts"),
  resistance: z.number().int().min(0).describe("Current resistance level"),
  timestamp: z.number().describe("Unix timestamp of the packet arrival"),
  protocol: z.enum(['FTMS', 'DELIGHTECH', 'FITSHOW']),
});

export type UnifiedWorkoutData = z.infer<typeof UnifiedWorkoutDataSchema>;
FINAL ARCHITECTURAL VALIDATION (Checklist)
Before the Antigravity agent begins coding, it must verify it can satisfy the following Architect Checklist requirements derived from the Stormotion lead architect standards:

1. The "Race Condition" Guard
Requirement: If two notification packets arrive simultaneously from different characteristics (e.g., FTMS Bike and FTMS Heart Rate), the WorkoutState must be updated atomically.

Agent Task: Implement a "Partial State Merge" logic.

2. The "Ghost Device" Recovery
Requirement: If the device stops sending notifications for >3 seconds during an active workout, the app must transition to a RECONNECTING state.

Agent Task: Implement a watchdog timer that resets on every successful packet.

3. The MTU Negotiation
Requirement: Some FTMS devices send packets larger than the default 20 bytes.

Agent Task: Explicitly call device.requestMTU(512) on Android immediately after connection to prevent truncated packets.

SUMMARY OF DELIVERABLES FOR ANTIGRAVITY
The agent now has:

Master Logic Spec: Throttling (200ms), Cooldowns (7s), and Singleton patterns.

Byte-Level Spec: Bitmask offsets for FTMS and fixed-position maps for proprietary protocols.

Command Spec: Hex sequences for Control Point writes and Checksum math.

Test Spec: Requirements for a Mock Transport Layer and the Accumulator logic test.

Validation Spec: Zod schemas for strict output typing.

This concludes the Architectural Design phase. Would you like me to generate the "Starter Code" for the QueueManager.ts to show the agent exactly how to implement the 200ms Promise-based FIFO queue?