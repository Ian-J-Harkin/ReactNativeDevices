import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useUserStore } from '../src/services/storage/UserStore';
import { WeeklyOverviewCard } from '../src/components/dashboard/WeeklyOverviewCard';
import { WorkoutHistoryItem, WorkoutHistoryData } from '../src/components/dashboard/WorkoutHistoryItem';
import { GoldButton } from '../src/components/ui/GoldButton';
import { SectionHeader } from '../src/components/ui/SectionHeader';
import { Radii, Spacing } from '../src/theme/theme';

// Mock data until Phase 4 WorkoutStore is built
const MOCK_HISTORY: WorkoutHistoryData[] = [
    { id: '1', deviceName: 'SportPlus Crosstrainer', protocolType: 'FTMS', dateStr: 'Today', durationMinutes: 45, distanceMeters: 8500 },
    { id: '2', deviceName: 'SportPlus X-Bike', protocolType: 'FitShow', dateStr: 'Yesterday', durationMinutes: 30, distanceMeters: 12000 },
    { id: '3', deviceName: 'SportPlus Rudergerät', protocolType: 'DelighTech', dateStr: '22 April', durationMinutes: 20, distanceMeters: 4000 },
];

export default function DashboardScreen() {
    const theme = useTheme();
    const router = useRouter();

    const { profiles, activeProfileId } = useUserStore();
    const activeProfile = profiles.find(p => p.id === activeProfileId);

    // Redirect to welcome if no active profile exists (Onboarding check)
    useEffect(() => {
        if (!activeProfileId && profiles.length === 0) {
            router.replace('/welcome');
        }
    }, [activeProfileId, profiles.length]);

    if (!activeProfile) {
        return null; // Will redirect shortly
    }

    const handleStartPrevious = () => {
        router.push('/workout'); // Navigate to workout flow
    };

    const renderHeader = () => (
        <View>
            <View style={styles.header}>
                <Text style={[styles.greeting, { color: theme.colors.onSurface }]}>
                    Hello, {activeProfile.name.split(' ')[0]}
                </Text>
                <TouchableOpacity onPress={() => router.push('/profile')}>
                    <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.avatarText}>{activeProfile.name.charAt(0)}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <WeeklyOverviewCard
                workoutsThisWeek={3}
                minutesThisWeek={95}
                caloriesThisWeek={840}
                onDetailsPress={() => { }} // Placeholder for History phase
            />

            <GoldButton
                title="Start previous workout"
                variant="black"
                onPress={handleStartPrevious}
                fullWidth
                style={styles.startPreviousBtn}
            />

            <SectionHeader
                title="PREVIOUS WORKOUTS"
                actionTitle="History"
                onActionPress={() => { }} // Placeholder
            />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={MOCK_HISTORY}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <WorkoutHistoryItem
                        workout={item}
                        onPress={() => { }}
                    />
                )}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: Spacing.lg,
        paddingTop: Spacing.xl, // StatusBar clearance
        paddingBottom: Spacing.xl * 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    greeting: {
        fontSize: 32,
        fontWeight: '800',
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#000',
    },
    startPreviousBtn: {
        marginBottom: Spacing.md,
    },
});
