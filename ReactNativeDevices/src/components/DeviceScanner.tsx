import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import { UseWorkoutResult, ScannedDevice } from '../services/ble';
import { WorkoutStatus } from '../services/ble/types/protocol';
import { GoldButton } from './ui/GoldButton';
import { SectionHeader } from './ui/SectionHeader';
import { AppIcon } from './ui/AppIcon';
import { Radii, Spacing } from '../theme/theme';

interface Props {
    workout: UseWorkoutResult;
}

export const DeviceScanner: React.FC<Props> = ({ workout }) => {
    const theme = useTheme();
    const { status, devices, scan, stopScan, connect, requestPermissions } = workout;

    const isConnecting = status === WorkoutStatus.CONNECTING;
    const isTimeout = status === WorkoutStatus.TIMEOUT;

    const handleConnect = (id: string) => {
        connect(id).catch((err) => console.log('Connect failed', err));
    };

    const renderItem = ({ item }: { item: ScannedDevice }) => (
        <TouchableOpacity
            style={[styles.deviceCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => handleConnect(item.id)}
            disabled={isConnecting}
        >
            <View style={styles.deviceInfo}>
                <View style={styles.deviceIconBg}>
                    <AppIcon name="bluetooth" isGold size={20} />
                </View>
                <View>
                    <Text style={[styles.deviceName, { color: theme.colors.onSurface }]}>
                        {item.name || 'Unknown Device'}
                    </Text>
                    <Text style={[styles.deviceId, { color: theme.colors.onSurfaceVariant }]}>
                        {item.id}
                    </Text>
                </View>
            </View>
            <View style={styles.connectState}>
                <Text style={[styles.rssi, { color: theme.colors.primary }]}>
                    {item.rssi ? `${item.rssi} dBm` : ''}
                </Text>
                <AppIcon name="chevron-right" color={theme.colors.onSurfaceVariant} size={20} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>My Devices</Text>
                <TouchableOpacity onPress={requestPermissions}>
                    <AppIcon name="settings" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.radarContainer}>
                <Text style={[styles.statusText, { color: theme.colors.onSurface }]}>
                    Search for devices nearby
                </Text>
                <Text style={[styles.statusSubtext, { color: theme.colors.onSurfaceVariant }]}>
                    Turn on bluetooth on the device so that the app can connect to it.
                </Text>

                <View style={[styles.radarOuter, { borderColor: theme.colors.primary }]}>
                    <View style={[styles.radarInner, { borderColor: theme.colors.primary }]}>
                        <View style={[styles.radarCore, { backgroundColor: theme.colors.primary }]}>
                            <AppIcon name="bluetooth" color="#000" size={32} />
                        </View>
                    </View>
                </View>
            </View>

            {isConnecting && (
                <View style={[styles.overlay, { backgroundColor: theme.colors.background }]}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.overlayText, { color: theme.colors.onSurface }]}>Discovering Protocol...</Text>
                </View>
            )}

            {isTimeout && (
                <View style={[styles.timeoutContainer, { backgroundColor: theme.colors.error + '20', borderColor: theme.colors.error }]}>
                    <Text style={[styles.timeoutText, { color: theme.colors.error }]}>Protocol Identification Failed</Text>
                    <Text style={[styles.timeoutSub, { color: theme.colors.error }]}>The device did not match any known protocols.</Text>
                </View>
            )}

            <SectionHeader title="Available Devices" />

            <FlatList
                data={devices}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                        No devices found. Press Scan.
                    </Text>
                }
            />

            <View style={styles.actions}>
                <GoldButton
                    title="Start Scan"
                    onPress={scan}
                    style={{ flex: 1 }}
                />
                <GoldButton
                    title="Stop"
                    variant="black"
                    onPress={stopScan}
                    style={{ flex: 1 }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.xl, // Safe area equivalent
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
    },
    radarContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    statusText: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    statusSubtext: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.xl * 2,
    },
    radarOuter: {
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 1,
        // Optional pulse opacity handled in via animated values
        alignItems: 'center',
        justifyContent: 'center',
    },
    radarInner: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radarCore: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actions: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.lg,
    },
    list: {
        gap: Spacing.sm,
        paddingBottom: Spacing.xl,
    },
    deviceCard: {
        padding: Spacing.md,
        borderRadius: Radii.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deviceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    deviceIconBg: {
        width: 40,
        height: 40,
        borderRadius: Radii.sm,
        backgroundColor: 'rgba(229, 184, 75, 0.15)', // Light gold bg
        alignItems: 'center',
        justifyContent: 'center',
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    deviceId: {
        fontSize: 12,
    },
    connectState: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    rssi: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: Spacing.xl,
        fontSize: 14,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.95,
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayText: {
        marginTop: Spacing.md,
        fontSize: 16,
        fontWeight: '600',
    },
    timeoutContainer: {
        padding: Spacing.md,
        borderRadius: Radii.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
    },
    timeoutText: {
        fontWeight: '700',
        fontSize: 14,
        marginBottom: 4,
    },
    timeoutSub: {
        fontSize: 12,
    }
});
