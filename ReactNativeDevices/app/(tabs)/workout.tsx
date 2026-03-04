import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { FilterChip } from '../../src/components/ui/FilterChip';
import { WorkoutCard, WorkoutData } from '../../src/components/workout/WorkoutCard';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { Radii, Spacing } from '../../src/theme/theme';

const CATEGORIES = ['All', 'X-Bike', 'Crosstrainer', 'Rudergerät', 'Laufband'];

const MOCK_WORKOUTS: WorkoutData[] = [
    { id: '1', title: 'Mountain Climb', level: 'Level 3', durationMin: 30, type: 'Crosstrainer', isFavorite: true },
    { id: '2', title: 'Sunset Ride', level: 'Level 2', durationMin: 45, type: 'X-Bike' },
    { id: '3', title: 'Sprint Interval', level: 'Level 4', durationMin: 20, type: 'Crosstrainer' },
    { id: '4', title: 'Endurance Row', level: 'Level 3', durationMin: 60, type: 'Rudergerät' },
    { id: '5', title: 'Fat Burner', level: 'Level 1', durationMin: 25, type: 'X-Bike', isFavorite: true },
];

export default function WorkoutBrowseScreen() {
    const theme = useTheme();
    const router = useRouter();

    const [activeCategory, setActiveCategory] = useState('All');

    const filteredWorkouts = activeCategory === 'All'
        ? MOCK_WORKOUTS
        : MOCK_WORKOUTS.filter(w => w.type === activeCategory);

    const handleWorkoutPress = (id: string) => {
        router.push(`/workout/${id}/details`);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

            {/* Header */}
            <View style={styles.header}>
                <View style={{ width: 24 }} /> {/* Spacer for centering */}
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>Select workout</Text>
                <AppIcon name="heart" size={24} color={theme.colors.onSurfaceVariant} />
            </View>

            {/* Search Bar (Mock) */}
            <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
                <AppIcon name="search" size={20} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.searchText, { color: theme.colors.onSurfaceVariant }]}>Search</Text>
            </View>

            {/* Filter Chips */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {CATEGORIES.map(category => (
                        <FilterChip
                            key={category}
                            label={category}
                            isActive={activeCategory === category}
                            onPress={() => setActiveCategory(category)}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Workout Grid */}
            <FlatList
                data={filteredWorkouts}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <WorkoutCard
                        workout={item}
                        onPress={() => handleWorkoutPress(item.id)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

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
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Spacing.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: 12,
        borderRadius: Radii.lg,
        marginBottom: Spacing.md,
        gap: Spacing.md,
    },
    searchText: {
        fontSize: 16,
    },
    filterContainer: {
        marginBottom: Spacing.md,
    },
    filterScroll: {
        paddingHorizontal: Spacing.lg,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl * 2,
    },
});
