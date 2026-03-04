import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { UseWorkoutResult } from '../services/ble';
import { ConnectionHeader } from './ConnectionHeader';
import { TelemetryGrid } from './TelemetryGrid';
import { ControlBar } from './ControlBar';
import { Spacing } from '../theme/theme';

interface Props {
    workout: UseWorkoutResult;
}

export const WorkoutDashboard: React.FC<Props> = ({ workout }) => {
    const theme = useTheme();
    const { data, status, protocolName, isStale, start, pause, disconnect, setResistance } = workout;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ConnectionHeader
                status={status}
                protocolName={protocolName}
                onDisconnect={disconnect}
            />

            <TelemetryGrid
                data={data}
                isStale={isStale}
            />

            <ControlBar
                status={status}
                resistance={data?.resistance || 1}
                onStart={start}
                onPause={pause}
                onResistanceChange={setResistance}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spacing.lg,
        paddingTop: Spacing.xl * 1.5, // accommodate safe area natively for now
    },
});
