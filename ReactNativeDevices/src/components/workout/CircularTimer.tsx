import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Radii } from '../../theme/theme';

interface Props {
    elapsedSeconds: number;
    totalSeconds?: number;
}

export const CircularTimer: React.FC<Props> = ({ elapsedSeconds, totalSeconds }) => {
    const theme = useTheme();

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Mocking the circular progress SVG with a styled view for now since SVG requires SVGR or react-native-svg
    // We use a bordered circle with gold color to represent the timer in the dashboard.
    return (
        <View style={styles.container}>
            <View style={[styles.outerRing, { borderColor: theme.colors.surfaceDisabled }]}>
                <View style={[styles.progressRing, { borderTopColor: theme.colors.primary, borderRightColor: theme.colors.primary }]} />
                <View style={styles.innerContent}>
                    <Text style={[styles.timeLabel, { color: theme.colors.onSurfaceVariant }]}>ELAPSED TIME</Text>
                    <Text style={[styles.timeValue, { color: theme.colors.onSurface }]}>{formatTime(elapsedSeconds)}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    outerRing: {
        width: 240,
        height: 240,
        borderRadius: 120,
        borderWidth: 4,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    progressRing: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 120,
        borderWidth: 4,
        borderColor: 'transparent',
        transform: [{ rotate: '-45deg' }],
    },
    innerContent: {
        alignItems: 'center',
    },
    timeLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    timeValue: {
        fontSize: 48,
        fontWeight: '800',
        fontVariant: ['tabular-nums'],
    },
});
