import React from 'react';
import { Tabs } from 'expo-router';
import { BottomTabBar } from '../../src/components/navigation/BottomTabBar';

export default function TabLayout() {
    return (
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
    );
}
