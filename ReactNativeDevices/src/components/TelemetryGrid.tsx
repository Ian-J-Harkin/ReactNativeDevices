import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import { WorkoutState } from '../services/ble/types/protocol';
import { MetricCard } from './MetricCard';
import { Radii, Spacing } from '../theme/theme';

interface Props {
    data: WorkoutState | null;
    isStale: boolean;
}

export const TelemetryGrid: React.FC<Props> = ({ data, isStale }) => {
    const theme = useTheme();
    const displayData = data || { speed: 0, cadence: 0, distance: 0, heartRate: 0 };

    return (
        <View style={styles.container}>
            {isStale && (
                <View style={[styles.staleOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.staleWarningText, { color: theme.colors.primary }]}>Signal Lost - Reconnecting...</Text>
                </View>
            )}
            <View style={[styles.bentoGrid, isStale && styles.staleOpacity]}>
                <View style={styles.row}>
                    <MetricCard
                        label="SPEED"
                        value={displayData.speed?.toFixed(1) || '0.0'}
                        unit="km/h"
                        icon="clock"
                    />
                    <MetricCard
                        label="CADENCE"
                        value={displayData.cadence?.toFixed(0) || '0'}
                        unit="RPM"
                        icon="clock"
                    />
                </View>

                <View style={styles.row}>
                    <MetricCard
                        label="DISTANCE"
                        value={displayData.distance || 0}
                        unit="m"
                        icon="clock"
                    />
                    <MetricCard
                        label="HEART RATE"
                        value={displayData.heartRate || '--'}
                        unit="BPM"
                        icon="heart"
                        highlight
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        marginBottom: Spacing.xl,
    },
    staleOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: Radii.lg,
    },
    staleWarningText: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: Spacing.sm,
    },
    staleOpacity: {
        opacity: 0.5,
    },
    bentoGrid: {
        gap: Spacing.md,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
});
