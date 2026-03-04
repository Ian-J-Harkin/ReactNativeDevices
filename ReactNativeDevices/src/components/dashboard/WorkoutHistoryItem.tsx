import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppIcon } from '../ui/AppIcon';
import { Radii, Spacing } from '../../theme/theme';

export interface WorkoutHistoryData {
    id: string;
    deviceName: string;
    protocolType: string;
    dateStr: string;
    durationMinutes: number;
    distanceMeters: number;
}

interface Props {
    workout: WorkoutHistoryData;
    onPress: () => void;
}

export const WorkoutHistoryItem: React.FC<Props> = ({ workout, onPress }) => {
    const theme = useTheme();

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.colors.surface }]}
            onPress={onPress}
        >
            <View style={styles.imagePlaceholder}>
                <AppIcon name="dumbbell" size={24} color={theme.colors.onSurfaceVariant} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                    {workout.deviceName || 'Fitness Equipment'}
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                    {workout.dateStr} • {workout.durationMinutes} min • {(workout.distanceMeters / 1000).toFixed(2)} km
                </Text>
            </View>

            <View style={[styles.protocolBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.protocolText, { color: theme.colors.primary }]}>
                    {workout.protocolType}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: Radii.lg,
        marginBottom: Spacing.sm,
    },
    imagePlaceholder: {
        width: 48,
        height: 48,
        borderRadius: Radii.md,
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
    },
    protocolBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: Radii.sm,
        marginLeft: Spacing.sm,
    },
    protocolText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
});
