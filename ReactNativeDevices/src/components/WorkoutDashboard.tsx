import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { UseWorkoutResult } from '../services/ble';
import { WorkoutStatus } from '../services/ble/types/protocol';

interface Props {
    workout: UseWorkoutResult;
}

export const WorkoutDashboard: React.FC<Props> = ({ workout }) => {
    const { data, status, protocolName, isStale, start, pause, disconnect, setResistance } = workout;
    const [sliderValue, setSliderValue] = useState(0);

    // Provide defaults so the UI doesn't crash if data is null
    const displayData = data || { speed: 0, cadence: 0, distance: 0, heartRate: 0, resistance: 0 };

    const isPaused = status === WorkoutStatus.PAUSED;
    const isWorkingOut = status === WorkoutStatus.WORKING_OUT;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Live Telemetry</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{protocolName || 'Unknown Protocol'}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.disconnectBtn} onPress={disconnect}>
                    <Text style={styles.disconnectText}>Disconnect</Text>
                </TouchableOpacity>
            </View>

            {/* Stale Data Warning */}
            {isStale && (
                <View style={styles.staleWarning}>
                    <Text style={styles.staleWarningText}>Telemetry Stalled — Attempting Reconnection...</Text>
                </View>
            )}

            {/* Bento Grid */}
            <View style={[styles.bentoGrid, isStale && styles.staleOpacity]}>
                {/* Large Central Display */}
                <View style={styles.row}>
                    <View style={[styles.bentoBox, styles.bentoLarge]}>
                        <Text style={styles.label}>SPEED</Text>
                        <Text style={styles.valueLarge}>{displayData.speed?.toFixed(1) || '0.0'}</Text>
                        <Text style={styles.unit}>km/h</Text>
                    </View>
                    <View style={[styles.bentoBox, styles.bentoLarge]}>
                        <Text style={styles.label}>CADENCE</Text>
                        <Text style={styles.valueLarge}>{displayData.cadence?.toFixed(0) || '0'}</Text>
                        <Text style={styles.unit}>RPM</Text>
                    </View>
                </View>

                {/* Secondary Displays */}
                <View style={styles.row}>
                    <View style={[styles.bentoBox, styles.bentoSmall]}>
                        <Text style={styles.label}>DISTANCE</Text>
                        <Text style={styles.valueSmall}>{displayData.distance || 0}</Text>
                        <Text style={styles.unit}>m</Text>
                    </View>
                    <View style={[styles.bentoBox, styles.bentoSmall]}>
                        <Text style={styles.label}>HEART RATE</Text>
                        <Text style={styles.valueSmall}>{displayData.heartRate || '--'}</Text>
                        <Text style={styles.unit}>BPM</Text>
                    </View>
                </View>
            </View>

            {/* Control Interface */}
            <View style={styles.controls}>
                <View style={styles.resistanceControl}>
                    <Text style={styles.label}>RESISTANCE LEVEL: {sliderValue}</Text>
                    <Slider
                        style={{ width: '100%', height: 40, marginTop: 8 }}
                        minimumValue={1}
                        maximumValue={32}
                        step={1}
                        value={displayData.resistance || 1}
                        onValueChange={(val) => setSliderValue(val)}
                        onSlidingComplete={(val) => setResistance(val)}
                        minimumTrackTintColor="#007AFF"
                        maximumTrackTintColor="#d1d1d6"
                        thumbTintColor="#007AFF"
                    />
                </View>

                <View style={styles.stateControls}>
                    {!isWorkingOut ? (
                        <TouchableOpacity style={[styles.controlBtn, styles.startBtn]} onPress={start}>
                            <Text style={styles.controlBtnText}>{isPaused ? 'Resume' : 'Start Workout'}</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={[styles.controlBtn, styles.pauseBtn]} onPress={pause}>
                            <Text style={styles.controlBtnText}>Pause Workout</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Premium dark mode
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
        marginTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
    },
    badge: {
        backgroundColor: '#1c1c1e',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#333',
    },
    badgeText: {
        color: '#0a84ff',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    disconnectBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#333',
        borderRadius: 20,
    },
    disconnectText: {
        color: '#ff453a',
        fontWeight: '600',
        fontSize: 14,
    },
    staleWarning: {
        backgroundColor: '#3a2b0b',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ff9f0a',
    },
    staleWarningText: {
        color: '#ffd60a',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    staleOpacity: {
        opacity: 0.4,
    },
    bentoGrid: {
        gap: 16,
        marginBottom: 30,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    bentoBox: {
        backgroundColor: '#1c1c1e',
        borderRadius: 24,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2c2c2e',
    },
    bentoLarge: {
        flex: 1,
        aspectRatio: 1,
    },
    bentoSmall: {
        flex: 1,
        aspectRatio: 1.5,
    },
    label: {
        fontSize: 12,
        color: '#8e8e93',
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
    },
    valueLarge: {
        fontSize: 48,
        fontWeight: '900',
        color: '#fff',
        fontVariant: ['tabular-nums'],
    },
    valueSmall: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        fontVariant: ['tabular-nums'],
    },
    unit: {
        fontSize: 14,
        color: '#636366',
        fontWeight: '600',
        marginTop: 4,
    },
    controls: {
        marginTop: 'auto',
        gap: 24,
    },
    resistanceControl: {
        backgroundColor: '#1c1c1e',
        padding: 20,
        borderRadius: 20,
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
