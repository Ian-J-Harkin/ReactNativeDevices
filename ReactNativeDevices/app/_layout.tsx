import React from 'react';
import { useColorScheme } from 'react-native';
import { Stack, Tabs } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AppDarkTheme, AppLightTheme } from '../src/theme/theme';
import { BottomTabBar } from '../src/components/navigation/BottomTabBar';

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? AppDarkTheme : AppLightTheme;

    return (
        <PaperProvider theme={theme}>
            <Tabs
                initialRouteName="index"
                tabBar={(props) => <BottomTabBar {...props} />}
                screenOptions={{
                    headerShown: false,
                    tabBarHideOnKeyboard: true,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Dashboard',
                    }}
                />
                <Tabs.Screen
                    name="workout"
                    options={{
                        title: 'Workout',
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                    }}
                />
            </Tabs>
        </PaperProvider>
    );
}
