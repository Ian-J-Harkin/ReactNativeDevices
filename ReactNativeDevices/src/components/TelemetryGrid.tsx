import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WorkoutState } from '../services/ble/types/protocol';
import { MetricCard } from './MetricCard';

interface Props {
    data: WorkoutState | null;
    isStale: boolean;
}

export const TelemetryGrid: React.FC<Props> = ({ data, isStale }) => {
    const displayData = data || { speed: 0, cadence: 0, distance: 0, heartRate: 0 };

    return (
        <View style={styles.container}>
            {isStale && (
                <View style={styles.staleOverlay}>
                    <ActivityIndicator size="large" color="#ff9f0a" />
                    <Text style={styles.staleWarningText}>Signal Lost - Reconnecting...</Text>
                </View>
            )}
            <View style={[styles.bentoGrid, isStale && styles.staleOpacity]}>
                <View style={styles.row}>
                    <MetricCard label="SPEED" value={displayData.speed?.toFixed(1) || '0.0'} unit="km/h" primary />
                    <MetricCard label="CADENCE" value={displayData.cadence?.toFixed(0) || '0'} unit="RPM" primary />
                </View>

                <View style={styles.row}>
                    <MetricCard label="DISTANCE" value={displayData.distance || 0} unit="m" />
                    <MetricCard label="HEART RATE" value={displayData.heartRate || '--'} unit="BPM" color="#ff453a" />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        marginBottom: 30,
    },
    staleOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 24,
    },
    staleWarningText: {
        color: '#ff9f0a',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    staleOpacity: {
        opacity: 0.5,
    },
    bentoGrid: {
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
});
