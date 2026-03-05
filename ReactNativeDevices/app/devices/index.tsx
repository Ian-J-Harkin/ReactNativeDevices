import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated, Easing, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { GoldButton } from '../../src/components/ui/GoldButton';
import { Radii, Spacing } from '../../src/theme/theme';
import { useWorkout, ScannedDevice } from '../../src/services/ble/hooks/useWorkout';
import { WorkoutStatus } from '../../src/services/ble/types/protocol';

export default function MyDevicesScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { devices, scan, stopScan, connect, status, requestPermissions } = useWorkout();

    const [isScanning, setIsScanning] = useState(false);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

    // Radar Animation
    const scaleAnim = new Animated.Value(0);
    const opacityAnim = new Animated.Value(1);

    useEffect(() => {
        let isMounted = true;

        const startScanningProcess = async () => {
            const hasPermissions = await requestPermissions();
            if (hasPermissions && isMounted) {
                setIsScanning(true);
                // The scan() method in useWorkout.ts does not take arguments
                scan();
            }
        };

        startScanningProcess();

        return () => {
            isMounted = false;
            stopScan();
        };
    }, []);

    useEffect(() => {
        if (isScanning) {
            Animated.loop(
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 3,
                        duration: 2000,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0,
                        duration: 2000,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            scaleAnim.setValue(0);
            opacityAnim.setValue(1);
            scaleAnim.stopAnimation();
            opacityAnim.stopAnimation();
        }
    }, [isScanning, scaleAnim, opacityAnim]);

    const handleConnect = async () => {
        if (!selectedDeviceId) return;

        setIsScanning(false);
        stopScan();

        try {
            await connect(selectedDeviceId);
            // On successful connection, we could pop back or show a success message
            router.back();
        } catch (error) {
            console.error("Failed to connect:", error);
            // In a real app, show a toast or alert here
            setIsScanning(true);
            scan();
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <AppIcon name="close" size={24} color={theme.colors.onSurface} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>My devices</Text>
                <View style={{ width: 40 }} /> {/* Spacer */}
            </View>

            {/* Radar Area */}
            <View style={styles.radarContainer}>
                <Text style={[styles.radarTitle, { color: theme.colors.onSurface }]}>
                    Search of devices nearby
                </Text>
                <Text style={[styles.radarSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                    Turn on bluetooth on the device so that the app can connect it
                </Text>

                <View style={styles.radarVisual}>
                    <Animated.View
                        style={[
                            styles.radarCircle,
                            {
                                backgroundColor: theme.colors.primaryContainer,
                                transform: [{ scale: scaleAnim }],
                                opacity: opacityAnim,
                            }
                        ]}
                    />
                    <View style={[styles.radarCenter, { backgroundColor: theme.colors.primary }]}>
                        <AppIcon name="bluetooth" size={32} color={theme.colors.onPrimary} />
                    </View>
                </View>
            </View>

            {/* Device List Modal Area */}
            <View style={[styles.listContainer, { backgroundColor: theme.colors.surface }]}>
                {status === WorkoutStatus.CONNECTING && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={{ color: theme.colors.onSurface, marginTop: Spacing.md }}>Connecting...</Text>
                    </View>
                )}

                <FlatList
                    data={devices}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            {isScanning ? (
                                <Text style={{ color: theme.colors.onSurfaceVariant }}>Searching for devices...</Text>
                            ) : (
                                <Text style={{ color: theme.colors.onSurfaceVariant }}>No devices found. Tap to scan again.</Text>
                            )}
                        </View>
                    }
                    renderItem={({ item }) => {
                        const isSelected = selectedDeviceId === item.id;
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.deviceRow,
                                    isSelected && { backgroundColor: theme.colors.primaryContainer, borderColor: theme.colors.primary, borderWidth: 1 }
                                ]}
                                onPress={() => setSelectedDeviceId(item.id)}
                            >
                                <View style={[styles.deviceIconBg, { backgroundColor: theme.colors.surfaceVariant }]}>
                                    <AppIcon name="clock" size={24} color={theme.colors.primary} />
                                </View>
                                <View style={styles.deviceInfo}>
                                    <Text style={[styles.deviceName, { color: theme.colors.onSurface }]}>
                                        {item.name || 'Unknown Device'}
                                    </Text>
                                    <Text style={[styles.deviceId, { color: theme.colors.onSurfaceVariant }]}>
                                        {item.id} • RSSI: {item.rssi}
                                    </Text>
                                </View>
                                {isSelected && (
                                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.primary }} />
                                )}
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {/* Footer */}
            <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
                <GoldButton
                    title={status === WorkoutStatus.CONNECTING ? "Connecting..." : "Next"}
                    variant="primary"
                    fullWidth
                    onPress={handleConnect}
                    disabled={!selectedDeviceId || status === WorkoutStatus.CONNECTING}
                />
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
        justifyContent: 'space-between',
    },
    closeButton: {
        padding: Spacing.xs,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    radarContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: Spacing.xl,
        paddingHorizontal: Spacing.xl,
    },
    radarTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    radarSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: Spacing.xl * 2,
    },
    radarVisual: {
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginTop: Spacing.xl,
    },
    radarCircle: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        opacity: 0.5,
    },
    radarCenter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    listContainer: {
        flex: 1.5,
        borderTopLeftRadius: Radii.xl,
        borderTopRightRadius: Radii.xl,
        paddingTop: Spacing.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
        position: 'relative'
    },
    emptyContainer: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    deviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.sm,
        borderRadius: Radii.lg,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    deviceIconBg: {
        width: 48,
        height: 48,
        borderRadius: Radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    deviceInfo: {
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    deviceId: {
        fontSize: 12,
    },
    footer: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.8)',
        zIndex: 100,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: Radii.xl,
        borderTopRightRadius: Radii.xl,
    }
});
