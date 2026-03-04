import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Radii, Spacing } from '../../theme/theme';

interface Props {
    data: number[]; // Array of intensity/resistance values
    height?: number;
}

export const PerformanceChart: React.FC<Props> = ({ data, height = 120 }) => {
    const theme = useTheme();

    if (!data || data.length === 0) {
        return <View style={[styles.container, { height }]} />;
    }

    const maxVal = Math.max(...data);
    const minVal = 0; // Assuming 0 as floor for visualization

    return (
        <View style={[styles.container, { height, backgroundColor: theme.colors.surface }]}>
            {data.map((val, index) => {
                // Normalize height percentage based on max value in set
                const percentage = maxVal === 0 ? 0 : (val / maxVal) * 100;

                return (
                    <View
                        key={index}
                        style={[
                            styles.bar,
                            {
                                height: `${percentage}%`,
                                backgroundColor: theme.colors.primary
                            }
                        ]}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderRadius: Radii.lg,
    },
    bar: {
        flex: 1, // Space evenly
        marginHorizontal: 1,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        minHeight: 2, // Ensure 0-values are still slightly visible as dots
    },
});
