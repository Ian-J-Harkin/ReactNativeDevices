import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppIcon } from '../ui/AppIcon';
import { SectionHeader } from '../ui/SectionHeader';
import { Radii, Spacing } from '../../theme/theme';

interface Props {
    workoutsThisWeek: number;
    minutesThisWeek: number;
    caloriesThisWeek: number;
    onDetailsPress?: () => void;
}

export const WeeklyOverviewCard: React.FC<Props> = ({
    workoutsThisWeek,
    minutesThisWeek,
    caloriesThisWeek,
    onDetailsPress
}) => {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <SectionHeader
                title="WEEKLY OVERVIEW"
                actionTitle="Details"
                onActionPress={onDetailsPress}
            />

            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.metricColumn}>
                    <AppIcon name="dumbbell" size={24} color={theme.colors.primary} />
                    <Text style={[styles.value, { color: theme.colors.onSurface }]}>{workoutsThisWeek}</Text>
                    <Text style={[styles.unit, { color: theme.colors.onSurfaceVariant }]}>Workouts</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

                <View style={styles.metricColumn}>
                    <AppIcon name="clock" size={24} color={theme.colors.primary} />
                    <Text style={[styles.value, { color: theme.colors.onSurface }]}>{minutesThisWeek}</Text>
                    <Text style={[styles.unit, { color: theme.colors.onSurfaceVariant }]}>Minutes</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

                <View style={styles.metricColumn}>
                    <AppIcon name="flame" size={24} color={theme.colors.primary} />
                    <Text style={[styles.value, { color: theme.colors.onSurface }]}>{caloriesThisWeek}</Text>
                    <Text style={[styles.unit, { color: theme.colors.onSurfaceVariant }]}>Kcal</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.xl,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.lg,
        borderRadius: Radii.lg,
    },
    metricColumn: {
        flex: 1,
        alignItems: 'center',
        gap: Spacing.xs,
    },
    divider: {
        width: 1,
        height: 40,
        opacity: 0.5,
    },
    value: {
        fontSize: 24,
        fontWeight: '800',
        marginTop: 4,
    },
    unit: {
        fontSize: 12,
        fontWeight: '600',
    },
});
