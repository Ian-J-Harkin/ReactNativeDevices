import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { CircularTimer } from '../../src/components/workout/CircularTimer';
// Reusing the scaffolded Bento Box dashboard from Phase 1
import { WorkoutDashboard } from '../../src/components/WorkoutDashboard';
import { Spacing } from '../../src/theme/theme';

export default function ActiveWorkoutScreen() {
    const theme = useTheme();
    const router = useRouter();

    const [elapsed, setElapsed] = useState(0);

    // Mock timer progression
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleStop = () => {
        Alert.alert(
            "End Workout",
            "Are you sure you want to end this workout early?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "End Workout",
                    style: "destructive",
                    onPress: () => {
                        router.replace('/workout/summary');
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

            {/* Header Actions */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconBtn} onPress={handleStop}>
                    <AppIcon name="close" size={28} color={theme.colors.onSurface} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                    <AppIcon name="settings" size={24} color={theme.colors.onSurface} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Dynamic Circular Timer */}
                <CircularTimer elapsedSeconds={elapsed} />

                {/* Existing Data Grid + Controls */}
                <WorkoutDashboard />
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
    },
    iconBtn: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.sm,
    },
});
