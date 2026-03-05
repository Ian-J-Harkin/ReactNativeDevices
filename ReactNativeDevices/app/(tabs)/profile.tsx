import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useUserStore } from '../../src/services/storage/UserStore';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { GoldButton } from '../../src/components/ui/GoldButton';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { Radii, Spacing } from '../../src/theme/theme';

export default function ProfileScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { profiles, activeProfileId, setActiveProfile, addProfile, logout } = useUserStore();

    const [showAccountModal, setShowAccountModal] = useState(false);

    const activeProfile = profiles.find(p => p.id === activeProfileId);

    if (!activeProfile) {
        return null;
    }

    const handleCreateNewAccount = () => {
        setShowAccountModal(false);
        // Hardcoded mock for demo purposes
        addProfile({
            name: `User ${profiles.length + 1}`,
            age: 25,
            heightCm: 170,
            weightKg: 65,
            sex: 'Female',
        });
    };

    const handleLogoutClick = () => {
        logout();
        router.replace('/welcome');
    };

    const renderMetric = (label: string, value: string | number, unit?: string) => (
        <View style={[styles.metricSquare, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.metricLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
            <View style={styles.metricValueContainer}>
                <Text style={[styles.metricValue, { color: theme.colors.primary }]}>{value}</Text>
                {unit && <Text style={[styles.metricUnit, { color: theme.colors.onSurfaceVariant }]}>{unit}</Text>}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header Region */}
                <View style={styles.header}>
                    <View style={[styles.avatarLarge, { borderColor: theme.colors.primary }]}>
                        <Text style={styles.avatarTextLarge}>{activeProfile.name.charAt(0)}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.nameSelector}
                        onPress={() => setShowAccountModal(true)}
                    >
                        <Text style={[styles.userName, { color: theme.colors.onSurface }]}>
                            {activeProfile.name}
                        </Text>
                        <AppIcon name="menu-down" size={24} color={theme.colors.onSurfaceVariant} />
                    </TouchableOpacity>
                </View>

                {/* Metrics Grid */}
                <View style={styles.metricsGrid}>
                    {renderMetric('SEX', activeProfile.sex)}
                    {renderMetric('WEIGHT', activeProfile.weightKg, 'kg')}
                    {renderMetric('HEIGHT', activeProfile.heightCm, 'cm')}
                    {renderMetric('AGE', activeProfile.age, 'yrs')}
                </View>

                {/* Preferences / Settings Menu */}
                <SectionHeader title="PREFERENCES" />

                <TouchableOpacity
                    style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
                    onPress={() => router.push('/devices')}
                >
                    <AppIcon name="bluetooth" size={24} color={theme.colors.onSurfaceVariant} />
                    <Text style={[styles.menuText, { color: theme.colors.onSurface }]}>Manage Devices</Text>
                    <AppIcon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}>
                    <AppIcon name="settings" size={24} color={theme.colors.onSurfaceVariant} />
                    <Text style={[styles.menuText, { color: theme.colors.onSurface }]}>App Settings</Text>
                    <AppIcon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity
                    style={[styles.logoutBtn, { borderColor: theme.colors.error }]}
                    onPress={handleLogoutClick}
                >
                    <Text style={[styles.logoutText, { color: theme.colors.error }]}>Log Out</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Account Switcher Modal */}
            <Modal
                visible={showAccountModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAccountModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Switch Account</Text>
                            <TouchableOpacity onPress={() => setShowAccountModal(false)}>
                                <AppIcon name="close" size={24} color={theme.colors.onSurfaceVariant} />
                            </TouchableOpacity>
                        </View>

                        {profiles.map(p => (
                            <TouchableOpacity
                                key={p.id}
                                style={[
                                    styles.accountRow,
                                    { backgroundColor: theme.colors.surface },
                                    p.id === activeProfileId && { borderColor: theme.colors.primary, borderWidth: 1 }
                                ]}
                                onPress={() => {
                                    setActiveProfile(p.id);
                                    setShowAccountModal(false);
                                }}
                            >
                                <View style={[styles.avatarSmall, { backgroundColor: theme.colors.primary }]}>
                                    <Text style={styles.avatarTextSmall}>{p.name.charAt(0)}</Text>
                                </View>
                                <Text style={[styles.accountName, { color: theme.colors.onSurface }]}>{p.name}</Text>
                                {p.id === activeProfileId && (
                                    <View style={styles.activePill}>
                                        <Text style={[styles.activePillText, { color: theme.colors.primary }]}>Active</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}

                        <GoldButton
                            title="Add New Account"
                            variant="secondary"
                            onPress={handleCreateNewAccount}
                            style={{ marginTop: Spacing.lg }}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.xl * 2,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
        marginTop: Spacing.md,
    },
    avatarLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    avatarTextLarge: {
        fontSize: 40,
        fontWeight: '800',
        color: '#E5B84B', // Gold
    },
    nameSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    metricSquare: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: Radii.lg,
        padding: Spacing.md,
        justifyContent: 'center',
    },
    metricLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
    },
    metricValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    metricValue: {
        fontSize: 28,
        fontWeight: '800',
    },
    metricUnit: {
        fontSize: 12,
        fontWeight: '600',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: Radii.lg,
        marginBottom: Spacing.sm,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: Spacing.md,
    },
    logoutBtn: {
        marginTop: Spacing.xl,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        borderRadius: Radii.lg,
        borderWidth: 1,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: Radii.xl,
        borderTopRightRadius: Radii.xl,
        padding: Spacing.xl,
        minHeight: '50%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    accountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: Radii.lg,
        marginBottom: Spacing.sm,
    },
    avatarSmall: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    avatarTextSmall: {
        fontSize: 14,
        fontWeight: '800',
        color: '#000',
    },
    accountName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    activePill: {
        backgroundColor: 'rgba(229, 184, 75, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: Radii.pill,
    },
    activePillText: {
        fontSize: 12,
        fontWeight: '700',
    },
});
