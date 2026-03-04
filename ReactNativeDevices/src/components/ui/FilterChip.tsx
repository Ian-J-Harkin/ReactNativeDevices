import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppIcon, IconName } from './AppIcon';
import { Radii, Spacing } from '../../theme/theme';

interface Props {
    label: string;
    icon?: IconName;
    isActive: boolean;
    onPress: () => void;
}

export const FilterChip: React.FC<Props> = ({ label, icon, isActive, onPress }) => {
    const theme = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.chip,
                {
                    backgroundColor: isActive ? theme.colors.primary : 'transparent',
                    borderColor: isActive ? theme.colors.primary : theme.colors.outline,
                }
            ]}
            onPress={onPress}
        >
            {icon && (
                <AppIcon
                    name={icon}
                    size={14}
                    color={isActive ? '#000' : theme.colors.onSurfaceVariant}
                />
            )}
            <Text style={[
                styles.label,
                { color: isActive ? '#000' : theme.colors.onSurfaceVariant }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radii.pill,
        borderWidth: 1,
        marginRight: Spacing.sm,
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
    },
});
