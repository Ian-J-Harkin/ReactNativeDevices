import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { AppIcon } from '../../../../src/components/ui/AppIcon';
import { GoldButton } from '../../../../src/components/ui/GoldButton';
import { Radii, Spacing } from '../../../../src/theme/theme';

const DURATIONS = [15, 30, 45, 'Custom'];

export default function WorkoutSetupScreen() {
    const { id } = useLocalSearchParams();
    const theme = useTheme();
    const router = useRouter();

    const [activeDuration, setActiveDuration] = useState<number | string>(30);
    const [resistance, setResistance] = useState(1);

    const handleStart = () => {
        // Navigate to active workout overlay, pass parameters if needed
        router.replace('/workout/active');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <AppIcon name="chevron-left" size={28} color={theme.colors.onSurface} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>Setup Workout</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.content}>

                {/* Device Confirmation */}
                <View style={[styles.devicePill, { backgroundColor: theme.colors.surface }]}>
                    <AppIcon name="bluetooth" size={16} color={theme.colors.primary} />
                    <Text style={[styles.devicePillText, { color: theme.colors.onSurface }]}>
                        SportPlus Crosstrainer
                    </Text>
                </View>

                <View style={styles.spacer} />

                {/* Duration Selector */}
                <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                    DURATION (MIN)
                </Text>
                <View style={[styles.segmentedControl, { backgroundColor: theme.colors.surface }]}>
                    {DURATIONS.map((dur) => {
                        const isActive = activeDuration === dur;
                        return (
                            <TouchableOpacity
                                key={dur.toString()}
                                style={[
                                    styles.segment,
                                    isActive && { backgroundColor: theme.colors.primary }
                                ]}
                                onPress={() => setActiveDuration(dur)}
                            >
                                <Text style={[
                                    styles.segmentText,
                                    { color: isActive ? '#000' : theme.colors.onSurfaceVariant },
                                    isActive && { fontWeight: '700' }
                                ]}>
                                    {dur}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.spacer} />

                {/* Resistance Selector */}
                <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                    STARTING RESISTANCE (1-32)
                </Text>

                <View style={styles.resistanceControl}>
                    <TouchableOpacity
                        style={[styles.resBtn, { backgroundColor: theme.colors.surface }]}
                        onPress={() => setResistance(Math.max(1, resistance - 1))}
                    >
                        <AppIcon name="minus" size={32} color={theme.colors.primary} />
                    </TouchableOpacity>

                    <Text style={[styles.resValue, { color: theme.colors.onSurface }]}>
                        {resistance}
                    </Text>

                    <TouchableOpacity
                        style={[styles.resBtn, { backgroundColor: theme.colors.surface }]}
                        onPress={() => setResistance(Math.min(32, resistance + 1))}
                    >
                        <AppIcon name="plus" size={32} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

            </View>

            {/* Fixed Footer */}
            <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
                <GoldButton
                    title="Start now"
                    fullWidth
                    onPress={handleStart}
                />
            </View>

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
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    content: {
        paddingHorizontal: Spacing.lg,
        alignItems: 'center',
    },
    devicePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: Spacing.md,
        paddingVertical: 8,
        borderRadius: Radii.pill,
    },
    devicePillText: {
        fontSize: 14,
        fontWeight: '600',
    },
    spacer: {
        height: Spacing.xl * 1.5,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: Spacing.md,
        alignSelf: 'flex-start',
    },
    segmentedControl: {
        flexDirection: 'row',
        width: '100%',
        padding: 4,
        borderRadius: Radii.lg,
    },
    segment: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Radii.md,
    },
    segmentText: {
        fontSize: 16,
        fontWeight: '600',
    },
    resistanceControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: Spacing.xl,
    },
    resBtn: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resValue: {
        fontSize: 72,
        fontWeight: '900',
        fontVariant: ['tabular-nums'],
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
});
