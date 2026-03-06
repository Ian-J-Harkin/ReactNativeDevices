import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MetricCard } from '../../src/components/MetricCard';
import { GoldButton } from '../../src/components/ui/GoldButton';
import { Radii, Spacing } from '../../src/theme/theme';

export default function WorkoutSummaryScreen() {
    const theme = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();

    // Format duration from seconds to MM:SS
    const durationSec = Number(params.duration) || 0;
    const m = Math.floor(durationSec / 60);
    const s = durationSec % 60;
    const durationStr = durationSec > 0 ? `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : '--';

    const distStr = params.distance ? (Number(params.distance) / 1000).toFixed(2) : '--';
    const kcalStr = params.calories ? Number(params.calories).toFixed(0) : '--';
    const pwrStr = params.avgPower ? Number(params.avgPower).toFixed(0) : '--';
    const hrStr = params.avgHR ? Number(params.avgHR).toFixed(0) : '--';
    const speedStr = params.avgSpeed ? Number(params.avgSpeed).toFixed(1) : '--';

    const handleReturn = () => {
        router.dismissAll(); // Clear stack
        router.replace('/(tabs)'); // Return to dashboard
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header Ribbon */}
                <View style={styles.header}>
                    <Text style={[styles.logo, { color: theme.colors.primary }]}>SPORTPLUS</Text>
                </View>

                <View style={styles.celebration}>
                    <Text style={[styles.title, { color: theme.colors.onSurface }]}>Congratulations!</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                        You crushed your workout today. Keep up the great momentum!
                    </Text>
                </View>

                {/* Final Stats Grid */}
                <View style={styles.grid}>
                    <MetricCard label="Duration" value={durationStr} unit="MIN" icon="clock" />
                    <MetricCard label="Distance" value={distStr} unit="KM" icon="play" />
                    <MetricCard label="Calories" value={kcalStr} unit="KCAL" icon="flame" />
                    <MetricCard label="Avg Power" value={pwrStr} unit="WATT" icon="dumbbell" />
                    <MetricCard label="Avg HR" value={hrStr} unit="BPM" icon="heart" />
                    <MetricCard label="Avg Speed" value={speedStr} unit="KM/H" icon="search" />
                </View>

                <View style={styles.spacer} />

                <GoldButton
                    title="Share stats"
                    fullWidth
                    variant="secondary"
                    onPress={() => { }} // Mock share action
                />

                <View style={{ height: Spacing.md }} />

                <GoldButton
                    title="Return to Dashboard"
                    fullWidth
                    onPress={handleReturn}
                />

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.xl * 2,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl * 2,
    },
    logo: {
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 2,
    },
    celebration: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: Spacing.xl,
        lineHeight: 24,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        justifyContent: 'space-between',
    },
    spacer: {
        height: Spacing.xl * 1.5,
    },
});
