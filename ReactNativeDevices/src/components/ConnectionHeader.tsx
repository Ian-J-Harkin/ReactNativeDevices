import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { WorkoutStatus } from '../services/ble/types/protocol';
import { AppIcon } from './ui/AppIcon';
import { Radii, Spacing } from '../theme/theme';

interface Props {
    status: WorkoutStatus;
    protocolName: string | null;
    onDisconnect: () => void;
}

export const ConnectionHeader: React.FC<Props> = ({ status, protocolName, onDisconnect }) => {
    const theme = useTheme();

    return (
        <View style={styles.header}>
            <View>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>Live Telemetry</Text>
                <View style={[styles.badgeContainer, { borderColor: theme.colors.outline }]}>
                    <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
                        <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                            {protocolName || 'Unknown Protocol'}
                        </Text>
                    </View>
                    <Text style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
                        {status.replace('_', ' ')}
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                style={[styles.disconnectBtn, { backgroundColor: theme.colors.surface }]}
                onPress={onDisconnect}
            >
                <AppIcon name="stop" size={20} color={theme.colors.error} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: Spacing.sm,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: Radii.sm,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    disconnectBtn: {
        width: 44,
        height: 44,
        borderRadius: Radii.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
