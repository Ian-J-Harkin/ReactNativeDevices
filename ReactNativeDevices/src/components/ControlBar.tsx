import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { WorkoutStatus } from '../services/ble/types/protocol';

interface Props {
    status: WorkoutStatus;
    resistance: number;
    onStart: () => void;
    onPause: () => void;
    onResistanceChange: (val: number) => void;
}

export const ControlBar: React.FC<Props> = ({ status, resistance, onStart, onPause, onResistanceChange }) => {
    const [sliderValue, setSliderValue] = useState(resistance);

    useEffect(() => {
        setSliderValue(resistance);
    }, [resistance]);

    const isPaused = status === WorkoutStatus.PAUSED;
    const isWorkingOut = status === WorkoutStatus.WORKING_OUT;

    return (
        <View style={styles.controls}>
            <View style={styles.resistanceControl}>
                <Text style={styles.label}>RESISTANCE LEVEL: {sliderValue}</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={32}
                    step={1}
                    value={resistance}
                    onValueChange={(val) => setSliderValue(val)}
                    onSlidingComplete={onResistanceChange}
                    minimumTrackTintColor="#007AFF"
                    maximumTrackTintColor="#d1d1d6"
                    thumbTintColor="#007AFF"
                />
            </View>

            <View style={styles.stateControls}>
                {!isWorkingOut ? (
                    <TouchableOpacity style={[styles.controlBtn, styles.startBtn]} onPress={onStart}>
                        <Text style={styles.controlBtnText}>{isPaused ? 'Resume' : 'Start Workout'}</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={[styles.controlBtn, styles.pauseBtn]} onPress={onPause}>
                        <Text style={styles.controlBtnText}>Pause Workout</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    controls: {
        marginTop: 'auto',
        gap: 24,
    },
    resistanceControl: {
        backgroundColor: '#1c1c1e',
        padding: 20,
        borderRadius: 20,
    },
    label: {
        fontSize: 12,
        color: '#8e8e93',
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
    },
    slider: {
        width: '100%',
        height: 40,
        marginTop: 8,
    },
    stateControls: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 30,
    },
    controlBtn: {
        flex: 1,
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    startBtn: {
        backgroundColor: '#30d158',
    },
    pauseBtn: {
        backgroundColor: '#ff9f0a',
    },
    controlBtnText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    }
});
