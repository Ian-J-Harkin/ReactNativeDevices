// ============================================================
// middleware/DataAccumulator.ts — Deep merge & accumulation
// ============================================================
//
// Sits between the protocol parsers and the UI layer.
// Handles three critical concerns:
//
// 1. Deep Merge: Protocols send fragmented data (e.g., Fitshow
//    sends Speed in one packet, Calories in another). The
//    accumulator preserves previous field values with per-field
//    timestamps until a newer value overwrites them.
//
// 2. Offset Accumulation: Some hardware resets distance to 0
//    on pause. The accumulator maintains a SessionOffset to
//    provide continuous values to the UI.
//
// 3. HR Priority: Equipment HR > 0 takes priority over
//    external HR monitor data.
// ============================================================

import { WorkoutState, ProtocolType } from '../types/protocol';
import { UnifiedWorkoutDataSchema } from '../types/schemas';

/**
 * Per-field tracking: the last known good value and when it was seen.
 */
interface FieldEntry {
    value: number;
    lastSeen: number;
}

export class DataAccumulator {
    /** Per-field deep merge state. */
    private fields: Map<string, FieldEntry> = new Map();

    /** Distance accumulation offset. */
    private distanceOffset = 0;
    private lastKnownDistance = 0;
    private isPaused = false;

    /** External HR monitor value (from service 0x180D). */
    private externalHR = 0;

    /**
     * Process a partial workout update from a protocol parser.
     * Returns the fully-merged WorkoutState for the UI.
     */
    accumulate(partial: Partial<WorkoutState>): WorkoutState {
        const now = Date.now();

        // Deep merge: update only the fields present in this partial update
        for (const [key, value] of Object.entries(partial)) {
            if (key === 'timestamp' || key === 'protocol') continue;
            if (value !== undefined && value !== null && typeof value === 'number') {
                this.fields.set(key, { value, lastSeen: now });
            }
        }

        // Distance accumulation logic
        const rawDistance = this.getField('distance');
        if (rawDistance !== undefined) {
            if (rawDistance === 0 && this.isPaused) {
                // Hardware reset to 0 during pause — freeze offset
                this.distanceOffset = this.lastKnownDistance;
            } else {
                this.lastKnownDistance = this.distanceOffset + rawDistance;
            }
        }

        // HR priority: equipment HR > external HR
        const equipmentHR = this.getField('heartRate');
        const finalHR =
            equipmentHR !== undefined && equipmentHR > 0
                ? equipmentHR
                : this.externalHR > 0
                    ? this.externalHR
                    : undefined;

        // Fallback Speed Estimation (BMAD Architect directive):
        // If speed == 0 but cadence > 0, estimate speed using a standard
        // gear ratio for older machines that don't report speed over BLE.
        const rawSpeed = this.getField('speed') ?? 0;
        const rawCadence = this.getField('cadence') ?? 0;
        const finalSpeed = rawSpeed === 0 && rawCadence > 0
            ? rawCadence * 0.2
            : rawSpeed;

        // Build the full merged state
        const result: WorkoutState = {
            speed: finalSpeed,
            cadence: rawCadence,
            distance: this.lastKnownDistance,
            heartRate: finalHR,
            power: this.getField('power'),
            resistance: this.getField('resistance') ?? 0,
            calories: this.getField('calories'),
            strokeRate: this.getField('strokeRate'),
            strokeCount: this.getField('strokeCount'),
            inclination: this.getField('inclination'),
            elevationGain: this.getField('elevationGain'),
            pace: this.getField('pace'),
            timestamp: now,
            protocol: partial.protocol ?? ProtocolType.FTMS,
        };

        // Non-blocking runtime validation
        const validation = UnifiedWorkoutDataSchema.safeParse(result);
        if (!validation.success) {
            console.warn(
                '[DataAccumulator] Validation Failed:',
                validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
            );
        }

        return result;
    }

    /**
     * Set the paused state. When paused, distance resets from
     * hardware are handled by the offset logic.
     */
    setPaused(paused: boolean): void {
        this.isPaused = paused;
    }

    /**
     * Set the external HR monitor value (from a separate BLE service 0x180D).
     */
    setExternalHR(bpm: number): void {
        this.externalHR = bpm;
    }

    /**
     * Reset all accumulated state (e.g., when starting a new workout).
     */
    reset(): void {
        this.fields.clear();
        this.distanceOffset = 0;
        this.lastKnownDistance = 0;
        this.isPaused = false;
        this.externalHR = 0;
    }

    /**
     * Get the last known value of a field, or undefined if never received.
     */
    private getField(key: string): number | undefined {
        const entry = this.fields.get(key);
        return entry?.value;
    }

    /**
     * Get the lastSeen timestamp for a field (useful for staleness checks).
     */
    getFieldTimestamp(key: string): number | undefined {
        return this.fields.get(key)?.lastSeen;
    }
}
