import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppIcon } from '../ui/AppIcon';
import { Radii, Spacing } from '../../theme/theme';

export interface WorkoutData {
    id: string;
    title: string;
    level: string;
    durationMin: number;
    type: string;
    isFavorite?: boolean;
}

interface Props {
    workout: WorkoutData;
    onPress: () => void;
}

export const WorkoutCard: React.FC<Props> = ({ workout, onPress }) => {
    const theme = useTheme();

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.pill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <Text style={styles.pillText}>{workout.type}</Text>
                </View>
                <TouchableOpacity style={styles.favoriteBtn}>
                    <AppIcon
                        name="heart"
                        size={20}
                        color={workout.isFavorite ? theme.colors.error : '#fff'}
                    />
                </TouchableOpacity>
                <AppIcon name="dumbbell" size={40} color={theme.colors.onSurfaceVariant} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>{workout.title}</Text>
                <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                    {workout.level} • {workout.durationMin} min
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: Radii.lg,
        overflow: 'hidden',
        marginBottom: Spacing.md,
    },
    imagePlaceholder: {
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    pill: {
        position: 'absolute',
        top: Spacing.sm,
        left: Spacing.sm,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: Radii.pill,
    },
    pillText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    favoriteBtn: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: Spacing.md,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
    },
});
