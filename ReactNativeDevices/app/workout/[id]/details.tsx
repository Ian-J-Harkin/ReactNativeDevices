import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { AppIcon } from '../../../../src/components/ui/AppIcon';
import { GoldButton } from '../../../../src/components/ui/GoldButton';
import { Radii, Spacing } from '../../../../src/theme/theme';

export default function WorkoutDetailsScreen() {
    const { id } = useLocalSearchParams();
    const theme = useTheme();
    const router = useRouter();

    const handleStartWorkout = () => {
        router.push(`/workout/${id}/setup`);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>

                {/* Mock Hero Image */}
                <View style={[styles.hero, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.topActions}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
                            <AppIcon name="chevron-left" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconCircle}>
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>?</Text>
                        </TouchableOpacity>
                    </View>
                    <AppIcon name="dumbbell" size={60} color={theme.colors.onSurfaceVariant} style={styles.centerIcon} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={[styles.title, { color: theme.colors.onSurface }]}>Mountain Climb</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                        Level 3 • 30 min • Crosstrainer
                    </Text>

                    <View style={styles.spacer} />

                    <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
                        NECESSARY DEVICE
                    </Text>

                    <View style={[styles.deviceCard, { backgroundColor: theme.colors.surface }]}>
                        <AppIcon name="bluetooth" size={24} color={theme.colors.primary} />
                        <Text style={[styles.deviceName, { color: theme.colors.onSurface }]}>
                            SportPlus Crosstrainer
                        </Text>
                        <View style={[styles.badge, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}>
                            <Text style={[styles.badgeText, { color: '#4CAF50' }]}>CONNECTED</Text>
                        </View>
                    </View>

                    <View style={styles.spacer} />

                    <Text style={[styles.description, { color: theme.colors.onSurface }]}>
                        A challenging virtual trail that takes you through steep inclines and steady flats to build total body endurance. Great for intermediate users.
                        <Text style={{ color: theme.colors.primary }}> more</Text>
                    </Text>

                    <View style={styles.spacer} />

                    {/* Performance Chart Mock */}
                    <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
                        INTENSITY PROFILE
                    </Text>
                    <View style={[styles.chartMock, { backgroundColor: theme.colors.surface }]}>
                        <View style={[styles.chartBar, { height: '30%', backgroundColor: theme.colors.primary }]} />
                        <View style={[styles.chartBar, { height: '50%', backgroundColor: theme.colors.primary }]} />
                        <View style={[styles.chartBar, { height: '80%', backgroundColor: theme.colors.primary }]} />
                        <View style={[styles.chartBar, { height: '60%', backgroundColor: theme.colors.primary }]} />
                        <View style={[styles.chartBar, { height: '90%', backgroundColor: theme.colors.primary }]} />
                        <View style={[styles.chartBar, { height: '40%', backgroundColor: theme.colors.primary }]} />
                        <View style={[styles.chartBar, { height: '20%', backgroundColor: theme.colors.primary }]} />
                    </View>

                </View>
            </ScrollView>

            {/* Fixed Footer */}
            <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
                <GoldButton
                    title="Start workout"
                    variant="black"
                    fullWidth
                    onPress={handleStartWorkout}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 120, // space for footer
    },
    hero: {
        height: 300,
        width: '100%',
        position: 'relative',
        borderBottomLeftRadius: Radii.lg,
        borderBottomRightRadius: Radii.lg,
    },
    topActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xl, // safe area approximation
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerIcon: {
        alignSelf: 'center',
        marginTop: 40,
    },
    content: {
        padding: Spacing.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    spacer: {
        height: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: Spacing.sm,
    },
    deviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: Radii.lg,
        gap: Spacing.sm,
    },
    deviceName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: Radii.sm,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    chartMock: {
        height: 120,
        borderRadius: Radii.lg,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        padding: Spacing.md,
    },
    chartBar: {
        width: '10%',
        borderRadius: Radii.sm,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
});
