import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppIcon, IconName } from './ui/AppIcon';
import { Radii, Spacing } from '../theme/theme';

interface Props {
    label: string;
    value: string | number;
    unit: string;
    icon?: IconName;
    highlight?: boolean;
}

export const MetricCard: React.FC<Props> = ({ label, value, unit, icon, highlight = false }) => {
    const theme = useTheme();

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.header}>
                {icon && (
                    <AppIcon
                        name={icon}
                        size={16}
                        color={highlight ? theme.colors.error : theme.colors.primary}
                    />
                )}
                <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
            </View>
            <View style={styles.valueContainer}>
                <Text style={[styles.value, { color: theme.colors.onSurface }]}>{value}</Text>
                <Text style={[styles.unit, { color: theme.colors.onSurfaceVariant }]}>{unit}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: Radii.lg,
        minHeight: 90,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    value: {
        fontSize: 28,
        fontWeight: '700',
    },
    unit: {
        fontSize: 12,
        fontWeight: '600',
    },
});
