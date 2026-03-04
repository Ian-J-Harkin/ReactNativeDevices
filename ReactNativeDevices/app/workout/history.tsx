import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, LayoutAnimation } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { PerformanceChart } from '../../src/components/charts/PerformanceChart';
import { MetricCard } from '../../src/components/MetricCard';
import { useUserStore } from '../../src/services/storage/UserStore';
import { useWorkoutStore, CompletedSession } from '../../src/services/storage/WorkoutStore';
import { Radii, Spacing } from '../../src/theme/theme';

export default function WorkoutHistoryScreen() {
    const theme = useTheme();
    const router = useRouter();

    const { activeProfileId } = useUserStore();
    const { getSessionsForUser } = useWorkoutStore();

    const sessions = activeProfileId ? getSessionsForUser(activeProfileId) : [];

    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(expandedId === id ? null : id);
    };

    const renderItem = ({ item }: { item: CompletedSession }) => {
        const isExpanded = expandedId === item.id;
        const dateStr = new Date(item.timestampStart).toLocaleDateString([], {
            weekday: 'short', month: 'short', day: 'numeric'
        });

        return (
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <TouchableOpacity style={styles.cardHeader} onPress={() => toggleExpand(item.id)}>
                    <View style={styles.cardTitleRow}>
                        <Text style={[styles.dateText, { color: theme.colors.onSurface }]}>{dateStr}</Text>
                        <View style={[styles.protocolBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Text style={[styles.protocolText, { color: theme.colors.primary }]}>{item.protocolType}</Text>
                        </View>
                    </View>
                    <Text style={[styles.deviceName, { color: theme.colors.onSurfaceVariant }]}>{item.deviceName}</Text>

                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryMetric, { color: theme.colors.onSurface }]}>
                            {Math.floor(item.durationSeconds / 60)} min
                        </Text>
                        <Text style={[styles.summaryMetric, { color: theme.colors.onSurface }]}>
                            {(item.distanceMeters / 1000).toFixed(2)} km
                        </Text>
                        <AppIcon
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={24}
                            color={theme.colors.onSurfaceVariant}
                        />
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.expandedContent}>

                        <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                            PERFORMANCE
                        </Text>
                        {item.chartData && item.chartData.length > 0 ? (
                            <PerformanceChart data={item.chartData} height={80} />
                        ) : (
                            <View style={[styles.emptyChart, { backgroundColor: theme.colors.background }]}>
                                <Text style={{ color: theme.colors.onSurfaceVariant }}>No chart data available</Text>
                            </View>
                        )}

                        <View style={{ height: Spacing.md }} />

                        <View style={styles.grid}>
                            <MetricCard title="Calories" value={item.caloriesBurned} unit="KCAL" iconName="flame" />
                            <MetricCard title="Avg Watts" value={item.avgWatts} unit="W" iconName="play" />
                            <MetricCard title="Avg HR" value={item.avgHeartRate} unit="BPM" iconName="heart" />
                        </View>

                        <TouchableOpacity style={styles.shareBtn}>
                            <Text style={[styles.shareText, { color: theme.colors.primary }]}>Share Workout</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <AppIcon name="chevron-left" size={28} color={theme.colors.onSurface} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>History</Text>
                <View style={{ width: 48 }} /> {/* Balancer */}
            </View>

            {sessions.length === 0 ? (
                <View style={styles.emptyState}>
                    <AppIcon name="dumbbell" size={64} color={theme.colors.onSurfaceVariant} />
                    <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>No workouts yet</Text>
                    <Text style={[styles.emptySub, { color: theme.colors.onSurfaceVariant }]}>
                        Your completed sessions will appear here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={sessions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    iconBtn: {
        width: 48,
        height: 48,
        justifyContent: 'center',
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl * 2,
    },
    card: {
        borderRadius: Radii.lg,
        marginBottom: Spacing.md,
        overflow: 'hidden',
    },
    cardHeader: {
        padding: Spacing.md,
    },
    cardTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '700',
    },
    protocolBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: Radii.sm,
    },
    protocolText: {
        fontSize: 10,
        fontWeight: '700',
    },
    deviceName: {
        fontSize: 14,
        marginBottom: Spacing.sm,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    summaryMetric: {
        fontSize: 14,
        fontWeight: '600',
    },
    expandedContent: {
        padding: Spacing.md,
        paddingTop: 0,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
    },
    emptyChart: {
        height: 80,
        borderRadius: Radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(255,255,255,0.2)'
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        justifyContent: 'space-between',
    },
    shareBtn: {
        marginTop: Spacing.lg,
        paddingVertical: Spacing.sm,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(229, 184, 75, 0.5)',
        borderRadius: Radii.md,
    },
    shareText: {
        fontSize: 14,
        fontWeight: '700',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    emptySub: {
        fontSize: 14,
        textAlign: 'center',
    },
});
