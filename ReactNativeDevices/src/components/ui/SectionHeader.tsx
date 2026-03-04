import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Spacing } from '../../theme/theme';

interface SectionHeaderProps {
    title: string;
    actionTitle?: string;
    onActionPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, actionTitle, onActionPress }) => {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>
                {title}
            </Text>

            {actionTitle && onActionPress && (
                <TouchableOpacity style={styles.actionPill} onPress={onActionPress}>
                    <Text style={[styles.actionText, { color: theme.colors.onSurface }]}>
                        {actionTitle}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        marginTop: Spacing.lg,
    },
    title: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    actionPill: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
    },
    actionText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
