import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WorkoutStatus } from '../services/ble/types/protocol';

interface Props {
    status: WorkoutStatus;
    protocolName: string | null;
    onDisconnect: () => void;
}

export const ConnectionHeader: React.FC<Props> = ({ status, protocolName, onDisconnect }) => {
    return (
        <View style={styles.header}>
            <View>
                <Text style={styles.title}>Live Telemetry</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{protocolName || 'Unknown Protocol'}</Text>
                </View>
                <Text style={styles.statusText}>{status.replace('_', ' ')}</Text>
            </View>
            <TouchableOpacity style={styles.disconnectBtn} onPress={onDisconnect}>
                <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
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
        marginBottom: 6,
    },
    badgeText: {
        color: '#0a84ff',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    statusText: {
        color: '#636366',
        fontSize: 14,
        fontWeight: '500',
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
});
