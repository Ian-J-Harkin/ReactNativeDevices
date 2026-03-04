import { create } from 'zustand';
import { StateStorage, createJSONStorage, persist } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

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

export interface UserProfile {
    id: string;
    name: string;
    avatarUri?: string;
    sex: 'Male' | 'Female' | 'Other';
    weightKg: number;
    heightCm: number;
    age: number;
}

interface UserState {
    profiles: UserProfile[];
    activeProfileId: string | null;
    addProfile: (profile: Omit<UserProfile, 'id'>) => void;
    setActiveProfile: (id: string) => void;
    updateProfile: (id: string, updates: Partial<UserProfile>) => void;
    logout: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            profiles: [],
            activeProfileId: null,

            addProfile: (profileData) => {
                const id = Math.random().toString(36).substring(2, 9);
                const newProfile: UserProfile = { ...profileData, id };
                set({
                    profiles: [...get().profiles, newProfile],
                    activeProfileId: id
                });
            },

            setActiveProfile: (id) => {
                set({ activeProfileId: id });
            },

            updateProfile: (id, updates) => {
                set({
                    profiles: get().profiles.map(p => p.id === id ? { ...p, ...updates } : p)
                });
            },

            logout: () => {
                set({ activeProfileId: null });
            }
        }),
        {
            name: 'sportplus-user-storage',
            storage: createJSONStorage(() => zustandStorage),
        }
    )
);
