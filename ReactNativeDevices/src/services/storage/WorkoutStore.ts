import { create } from 'zustand';
import { StateStorage, createJSONStorage, persist } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { useUserStore } from './UserStore';

const storage = new MMKV();

const zustandStorage: StateStorage = {
    setItem: (name, value) => {
        return storage.set(name, value);
    },
    getItem: (name) => {
        const value = storage.getString(name);
        return value ?? null;
    },
    removeItem: (name) => {
        return storage.delete(name);
    },
};

export interface CompletedSession {
    id: string;
    userId: string;
    workoutId: string;
    title: string;
    deviceName: string;
    protocolType: string;
    timestampStart: number;
    durationSeconds: number;
    distanceMeters: number;
    caloriesBurned: number;
    avgWatts: number;
    avgHeartRate: number;
    avgSpeedKmph: number;
    // Arrays of values (e.g. per minute) could be stored here for the chart
    chartData: number[];
}

interface WorkoutStoreState {
    sessions: CompletedSession[];
    saveSession: (session: Omit<CompletedSession, 'id'>) => void;
    getSessionsForUser: (userId: string) => CompletedSession[];
    getWeeklySummary: (userId: string) => { workouts: number, minutes: number, calories: number };
}

export const useWorkoutStore = create<WorkoutStoreState>()(
    persist(
        (set, get) => ({
            sessions: [],

            saveSession: (sessionData) => {
                const id = Math.random().toString(36).substring(2, 9);
                const newSession: CompletedSession = { ...sessionData, id };
                set({ sessions: [newSession, ...get().sessions] });
            },

            getSessionsForUser: (userId) => {
                return get().sessions.filter(s => s.userId === userId);
            },

            getWeeklySummary: (userId) => {
                // Simplified mock logic: just aggregates all history for the user
                // In a real app, this would filter by the last 7 days using timestampStart
                const userSessions = get().sessions.filter(s => s.userId === userId);

                return userSessions.reduce(
                    (acc, session) => {
                        acc.workouts += 1;
                        acc.minutes += Math.floor(session.durationSeconds / 60);
                        acc.calories += session.caloriesBurned;
                        return acc;
                    },
                    { workouts: 0, minutes: 0, calories: 0 }
                );
            }
        }),
        {
            name: 'sportplus-workout-storage',
            storage: createJSONStorage(() => zustandStorage),
        }
    )
);
