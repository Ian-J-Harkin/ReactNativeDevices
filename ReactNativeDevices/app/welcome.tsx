import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { GoldButton } from '../src/components/ui/GoldButton';
import { useUserStore } from '../src/services/storage/UserStore';
import { Radii, Spacing } from '../src/theme/theme';

export default function WelcomeScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { addProfile } = useUserStore();

    const handleCreateAccount = () => {
        // Mocking an initial profile creation for the demo
        addProfile({
            name: 'Alex Developer',
            age: 28,
            heightCm: 180,
            weightKg: 75,
            sex: 'Male',
        });
        router.replace('/');
    };

    const handleLogin = () => {
        // Just mock setting active profile and go to dashboard
        handleCreateAccount();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Mocking the hero image with a dark placeholder since we don't have the asset */}
            <View style={[styles.heroImage, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.logo, { color: theme.colors.primary }]}>SPORTPLUS</Text>
            </View>

            <SafeAreaView style={styles.content}>
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                        Welcome to SportPlus
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                        Connect your devices, track your progress, and reach your fitness goals.
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <GoldButton
                        title="Create account"
                        onPress={handleCreateAccount}
                        fullWidth
                    />
                    <View style={{ height: Spacing.md }} />
                    <GoldButton
                        title="Log in"
                        variant="secondary"
                        onPress={handleLogin}
                        fullWidth
                    />
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    heroImage: {
        flex: 0.55,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: Radii.lg * 2,
        borderBottomRightRadius: Radii.lg * 2,
    },
    logo: {
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: 2,
    },
    content: {
        flex: 0.45,
        padding: Spacing.xl,
        justifyContent: 'space-between',
    },
    textContainer: {
        marginTop: Spacing.lg,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: Spacing.md,
    },
    buttonContainer: {
        marginBottom: Spacing.xl,
    },
});
