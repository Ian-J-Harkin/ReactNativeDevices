import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from 'react-native-paper';
import { WorkoutStatus } from '../services/ble/types/protocol';
import { GoldButton } from './ui/GoldButton';
import { AppIcon } from './ui/AppIcon';
import { Radii, Spacing } from '../theme/theme';

interface Props {
    status: WorkoutStatus;
    resistance: number;
    onStart: () => void;
    onPause: () => void;
    onResistanceChange: (val: number) => void;
}

export const ControlBar: React.FC<Props> = ({ status, resistance, onStart, onPause, onResistanceChange }) => {
    const theme = useTheme();
    const [sliderValue, setSliderValue] = useState(resistance);

    useEffect(() => {
        setSliderValue(resistance);
    }, [resistance]);

    const isPaused = status === WorkoutStatus.PAUSED;
    const isWorkingOut = status === WorkoutStatus.WORKING_OUT;

    return (
        <View style={styles.controls}>
            <View style={[styles.resistanceControl, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.resistanceHeader}>
                    <AppIcon name="dumbbell" size={16} color={theme.colors.onSurfaceVariant} />
                    <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                        RESISTANCE LEVEL: <Text style={{ color: theme.colors.onSurface }}>{sliderValue}</Text>
                    </Text>
                </View>
                <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={32}
                    step={1}
                    value={resistance}
                    onValueChange={(val) => setSliderValue(val)}
                    onSlidingComplete={onResistanceChange}
                    minimumTrackTintColor={theme.colors.primary}
                    maximumTrackTintColor={theme.colors.surfaceDisabled}
                    thumbTintColor={theme.colors.primary}
                />
            </View>

            <View style={styles.stateControls}>
                {!isWorkingOut ? (
                    <GoldButton
                        title={isPaused ? "Resume" : "Start Workout"}
                        onPress={onStart}
                        fullWidth
                        style={{ flex: 1 }}
                    />
                ) : (
                    <GoldButton
                        title="Pause Workout"
                        variant="secondary"
                        onPress={onPause}
                        fullWidth
                        style={{ flex: 1 }}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    controls: {
        marginTop: 'auto',
        gap: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    resistanceControl: {
        padding: Spacing.lg,
        borderRadius: Radii.lg,
    },
    resistanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    slider: {
        width: '100%',
        height: 40,
        marginTop: Spacing.sm,
    },
    stateControls: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
});
