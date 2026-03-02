// ============================================================
// types/schemas.ts — Zod validation for runtime type safety
// ============================================================

import { z } from 'zod';

/**
 * Validates workout status values at runtime.
 */
export const WorkoutStatusSchema = z.enum([
    'IDLE',
    'CONNECTING',
    'READY',
    'WORKING_OUT',
    'PAUSED',
    'FINISHED',
]);

/**
 * Validates the unified workout data emitted by the DataAccumulator.
 * This is the "Golden Schema" — regardless of protocol, the UI
 * receives data conforming to this shape.
 */
export const UnifiedWorkoutDataSchema = z.object({
    speed: z.number().min(0).describe('Instantaneous speed in km/h'),
    cadence: z.number().min(0).describe('Rotational speed in RPM'),
    distance: z.number().min(0).describe('Total session distance in meters'),
    heartRate: z.number().min(0).max(255).optional().describe('Heart rate in BPM'),
    power: z.number().optional().describe('Instantaneous power in Watts'),
    resistance: z.number().min(0).describe('Current resistance level'),
    calories: z.number().min(0).optional().describe('Expended energy in kcal'),
    strokeRate: z.number().min(0).optional().describe('Stroke rate (rower only)'),
    strokeCount: z.number().min(0).optional().describe('Stroke count (rower only)'),
    inclination: z.number().optional().describe('Incline % (treadmill only)'),
    elevationGain: z.number().min(0).optional().describe('Elevation in meters (treadmill)'),
    pace: z.number().min(0).optional().describe('Pace — s/500m for rower, km/h for treadmill'),
    timestamp: z.number().describe('Unix ms of packet arrival'),
    protocol: z.enum(['FTMS', 'DELIGHTECH', 'FITSHOW']),
});

export type UnifiedWorkoutData = z.infer<typeof UnifiedWorkoutDataSchema>;
