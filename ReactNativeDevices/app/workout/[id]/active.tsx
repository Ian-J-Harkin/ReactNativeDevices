import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { AppIcon } from '../../../../src/components/ui/AppIcon';
import { Spacing, Radii } from '../../../../src/theme/theme';
import { useWorkout } from '../../../../src/services/ble/hooks/useWorkout';
import { WorkoutStatus } from '../../../../src/services/ble/types/protocol';

export default function ActiveWorkoutScreen() {
    const { id, duration, resistance } = useLocalSearchParams();
    const router = useRouter();
    const theme = useTheme();

    const {
        data,
        status,
        isStale,
        start,
        pause,
        disconnect,
        setResistance
    } = useWorkout();

    // Start workout on mount
    useEffect(() => {
        let mounted = true;
        const init = async () => {
            if (mounted) {
                // Set initial resistance if passed from setup
                if (resistance) {
                    await setResistance(Number(resistance));
                }
                await start();
            }
        };
        init();

        return () => {
            mounted = false;
        };
    }, []);

    const handlePlayPause = async () => {
        if (status === WorkoutStatus.WORKING_OUT) {
            await pause();
        } else {
            await start();
        }
    };

    const handleStop = () => {
        Alert.alert(
            "End Workout",
            "Are you sure you want to end this workout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "End",
                    style: "destructive",
                    onPress: async () => {
                        await pause();
                        await disconnect();
                        router.replace(`/workout/history`); // Or summary screen
                    }
                }
            ]
        );
    };

    const handleClose = async () => {
        await pause();
        router.back();
    };

    // Safe access to metrics
    const speed = data?.speed?.toFixed(1) || '0.0';
    const rpm = data?.cadence?.toFixed(0) || '0';
    const distance = data?.distance ? (data.distance / 1000).toFixed(2) : '0.00';
    const hr = data?.heartRate?.toFixed(0) || '--';
    const pwr = data?.power?.toFixed(0) || '--';
    const kcal = data?.calories?.toFixed(0) || '0'; // Assuming calories is mapped if available, otherwise just mock
    const currentRes = data?.resistance ?? resistance ?? 1;

    // Dark theme overrides
    const darkColors = {
        background: '#121212',
        surface: '#1E1E1E',
        textPrimary: '#FFFFFF',
        textSecondary: '#A0A0A0',
        gold: theme.colors.primary,
        staleText: '#666666'
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: darkColors.background }]}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleClose} style={styles.iconBtn}>
                    <AppIcon name="close" size={24} color={darkColors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: darkColors.textPrimary }]}>Active Workout</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>

                {/* Center Timer / Resistance Display */}
                <View style={[styles.centerPiece, { borderColor: darkColors.gold }]}>
                    <Text style={[styles.centerLabel, { color: darkColors.textSecondary }]}>RESISTANCE LEVEL</Text>
                    <Text style={[styles.centerValue, { color: darkColors.textPrimary }]}>{currentRes}</Text>

                    {isStale && (
                        <Text style={{ color: theme.colors.error, marginTop: Spacing.sm, fontWeight: 'bold' }}>Connection Lost</Text>
                    )}
                </View>

                {/* 2x3 Metric Grid */}
                <View style={styles.grid}>
                    {/* Time (Mocked for now since DataAccumulator doesn't track time natively yet) */}
                    <View style={[styles.gridItem, { backgroundColor: darkColors.surface }]}>
                        <AppIcon name="clock" size={20} color={darkColors.gold} />
                        <Text style={[styles.gridValue, { color: isStale ? darkColors.staleText : darkColors.textPrimary }]}>00:00</Text>
                        <Text style={[styles.gridLabel, { color: darkColors.textSecondary }]}>hh:mm</Text>
                    </View>

                    {/* Speed */}
                    <View style={[styles.gridItem, { backgroundColor: darkColors.surface }]}>
                        <AppIcon name="flame" size={20} color={darkColors.gold} />
                        <Text style={[styles.gridValue, { color: isStale ? darkColors.staleText : darkColors.textPrimary }]}>{speed}</Text>
                        <Text style={[styles.gridLabel, { color: darkColors.textSecondary }]}>km/h</Text>
                    </View>

                    {/* Distance */}
                    <View style={[styles.gridItem, { backgroundColor: darkColors.surface }]}>
                        <AppIcon name="dumbbell" size={20} color={darkColors.gold} />
                        <Text style={[styles.gridValue, { color: isStale ? darkColors.staleText : darkColors.textPrimary }]}>{distance}</Text>
                        <Text style={[styles.gridLabel, { color: darkColors.textSecondary }]}>km</Text>
                    </View>

                    {/* RPM */}
                    <View style={[styles.gridItem, { backgroundColor: darkColors.surface }]}>
                        <AppIcon name="settings" size={20} color={darkColors.gold} />
                        <Text style={[styles.gridValue, { color: isStale ? darkColors.staleText : darkColors.textPrimary }]}>{rpm}</Text>
                        <Text style={[styles.gridLabel, { color: darkColors.textSecondary }]}>rpm</Text>
                    </View>

                    {/* Power */}
                    <View style={[styles.gridItem, { backgroundColor: darkColors.surface }]}>
                        <AppIcon name="flame" size={20} color={darkColors.gold} />
                        <Text style={[styles.gridValue, { color: isStale ? darkColors.staleText : darkColors.textPrimary }]}>{pwr}</Text>
                        <Text style={[styles.gridLabel, { color: darkColors.textSecondary }]}>watt</Text>
                    </View>

                    {/* Heart Rate */}
                    <View style={[styles.gridItem, { backgroundColor: darkColors.surface }]}>
                        <AppIcon name="heart" size={20} color={darkColors.gold} />
                        <Text style={[styles.gridValue, { color: isStale ? darkColors.staleText : darkColors.textPrimary }]}>{hr}</Text>
                        <Text style={[styles.gridLabel, { color: darkColors.textSecondary }]}>bpm</Text>
                    </View>
                </View>

            </View>

            {/* Controls Fixed Footer */}
            <View style={[styles.controls, { backgroundColor: darkColors.background, borderTopColor: darkColors.surface }]}>
                <TouchableOpacity
                    style={[styles.stopBtn, { backgroundColor: theme.colors.error }]}
                    onPress={handleStop}
                >
                    <AppIcon name="stop" size={28} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.playPauseBtn, { backgroundColor: darkColors.gold }]}
                    onPress={handlePlayPause}
                >
                    <AppIcon
                        name={status === WorkoutStatus.WORKING_OUT ? "pause" : "play"}
                        size={40}
                        color="#000"
                    />
                </TouchableOpacity>
                <View style={{ width: 64 }} /> {/* Spacer to center play btn */}
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
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.md,
        justifyContent: 'space-between',
    },
    iconBtn: {
        padding: Spacing.xs,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        alignItems: 'center',
        paddingTop: Spacing.xl,
    },
    centerPiece: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl * 2,
    },
    centerLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: Spacing.sm,
    },
    centerValue: {
        fontSize: 64,
        fontWeight: '900',
        fontVariant: ['tabular-nums'],
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        gap: Spacing.md,
    },
    gridItem: {
        width: '47%', // roughly half minus gap
        borderRadius: Radii.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    gridValue: {
        fontSize: 28,
        fontWeight: '800',
        marginTop: Spacing.sm,
        marginBottom: 2,
        fontVariant: ['tabular-nums'],
    },
    gridLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    controls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl * 1.5,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.xl * 2,
        borderTopWidth: 1,
    },
    stopBtn: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playPauseBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    }
});
