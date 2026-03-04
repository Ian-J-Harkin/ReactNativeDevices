import React from 'react';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AppDarkTheme, AppLightTheme } from '../src/theme/theme';

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? AppDarkTheme : AppLightTheme;

    return (
        <PaperProvider theme={theme}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="welcome" />
            </Stack>
        </PaperProvider>
    );
}
