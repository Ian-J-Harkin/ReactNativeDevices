import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useUserStore } from '../../src/services/storage/UserStore';
import { useWorkoutStore } from '../../src/services/storage/WorkoutStore';
import { WeeklyOverviewCard } from '../../src/components/dashboard/WeeklyOverviewCard';
import { WorkoutHistoryItem } from '../../src/components/dashboard/WorkoutHistoryItem';
import { GoldButton } from '../../src/components/ui/GoldButton';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { Radii, Spacing } from '../../src/theme/theme';

export default function DashboardScreen() {
    const theme = useTheme();
    const router = useRouter();

    const { profiles, activeProfileId } = useUserStore();
    const { getSessionsForUser, getWeeklySummary } = useWorkoutStore();

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

    const recentSessions = activeProfileId ? getSessionsForUser(activeProfileId).slice(0, 3) : [];
    const weeklyStats = activeProfileId
        ? getWeeklySummary(activeProfileId)
        : { workouts: 0, minutes: 0, calories: 0 };

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
                workoutsThisWeek={weeklyStats.workouts}
                minutesThisWeek={weeklyStats.minutes}
                caloriesThisWeek={weeklyStats.calories}
                onDetailsPress={() => router.push('/workout/history')}
            />

            <GoldButton
                title="Start new workout"
                variant="black"
                onPress={handleStartPrevious}
                fullWidth
                style={styles.startPreviousBtn}
            />

            <SectionHeader
                title="PREVIOUS WORKOUTS"
                actionTitle="History"
                onActionPress={() => router.push('/workout/history')}
            />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={recentSessions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const formattedWorkout = {
                        id: item.id,
                        deviceName: item.deviceName,
                        protocolType: item.protocolType,
                        dateStr: new Date(item.timestampStart).toLocaleDateString(),
                        durationMinutes: Math.floor(item.durationSeconds / 60),
                        distanceMeters: item.distanceMeters,
                    };

                    return (
                        <WorkoutHistoryItem
                            workout={formattedWorkout}
                            onPress={() => router.push('/workout/history')}
                        />
                    );
                }}
                ListEmptyComponent={
                    <View style={{ padding: Spacing.xl, alignItems: 'center', opacity: 0.5 }}>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>No workouts recorded yet.</Text>
                    </View>
                }
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
