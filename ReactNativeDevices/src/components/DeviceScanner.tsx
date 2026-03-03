import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { UseWorkoutResult, ScannedDevice } from '../services/ble';
import { WorkoutStatus } from '../services/ble/types/protocol';

interface Props {
    workout: UseWorkoutResult;
}

export const DeviceScanner: React.FC<Props> = ({ workout }) => {
    const { status, devices, scan, stopScan, connect, requestPermissions } = workout;

    const isConnecting = status === WorkoutStatus.CONNECTING;
    const isTimeout = status === WorkoutStatus.TIMEOUT;

    const handleConnect = (id: string) => {
        connect(id).catch((err) => console.log('Connect failed', err));
    };

    const renderItem = ({ item }: { item: ScannedDevice }) => (
        <TouchableOpacity
            style={styles.deviceCard}
            onPress={() => handleConnect(item.id)}
            disabled={isConnecting}
        >
            <View>
                <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
                <Text style={styles.deviceId}>{item.id}</Text>
            </View>
            <Text style={styles.rssi}>{item.rssi ? `${item.rssi} dBm` : ''}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Fitness Equipment</Text>
                <TouchableOpacity style={styles.permissionBtn} onPress={requestPermissions}>
                    <Text style={styles.permissionText}>Grant Permissions</Text>
                </TouchableOpacity>
            </View>

            {isConnecting && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.overlayText}>Discovering Protocol...</Text>
                </View>
            )}

            {isTimeout && (
                <View style={styles.timeoutContainer}>
                    <Text style={styles.timeoutText}>Protocol Identification Failed</Text>
                    <Text style={styles.timeoutSub}>The device did not match any known protocols.</Text>
                </View>
            )}

            <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.scanBtn]} onPress={scan}>
                    <Text style={styles.btnText}>Start Scan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.stopBtn]} onPress={stopScan}>
                    <Text style={styles.btnText}>Stop</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={devices}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No devices found. Press Scan.</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f7',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1c1c1e',
    },
    permissionBtn: {
        backgroundColor: '#e5e5ea',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    permissionText: {
        color: '#007AFF',
        fontWeight: '600',
        fontSize: 12,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    btn: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    scanBtn: {
        backgroundColor: '#007AFF',
    },
    stopBtn: {
        backgroundColor: '#FF3B30',
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    list: {
        gap: 12,
        paddingBottom: 40,
    },
    deviceCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1c1c1e',
        marginBottom: 4,
    },
    deviceId: {
        fontSize: 12,
        color: '#8e8e93',
    },
    rssi: {
        fontSize: 14,
        color: '#8e8e93',
        fontWeight: '500',
    },
    emptyText: {
        textAlign: 'center',
        color: '#8e8e93',
        marginTop: 40,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayText: {
        marginTop: 16,
        fontSize: 16,
        color: '#1c1c1e',
        fontWeight: '600',
    },
    timeoutContainer: {
        backgroundColor: '#FFE5E5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    timeoutText: {
        color: '#FF3B30',
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
    },
    timeoutSub: {
        color: '#FF3B30',
        fontSize: 12,
    }
});
