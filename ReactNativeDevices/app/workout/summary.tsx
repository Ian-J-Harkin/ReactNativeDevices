import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MetricCard } from '../../src/components/MetricCard';
import { GoldButton } from '../../src/components/ui/GoldButton';
import { Radii, Spacing } from '../../src/theme/theme';

export default function WorkoutSummaryScreen() {
    const theme = useTheme();
    const router = useRouter();

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
                    <MetricCard title="Duration" value="30:00" unit="MIN" iconName="clock" />
                    <MetricCard title="Distance" value="6.5" unit="KM" iconName="play" />
                    <MetricCard title="Calories" value="320" unit="KCAL" iconName="flame" />
                    <MetricCard title="Avg Power" value="145" unit="WATT" iconName="dumbbell" />
                    <MetricCard title="Avg HR" value="132" unit="BPM" iconName="heart" />
                    <MetricCard title="Avg Speed" value="13.0" unit="KM/H" iconName="search" />
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
