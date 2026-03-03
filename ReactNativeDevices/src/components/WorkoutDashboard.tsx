import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UseWorkoutResult } from '../services/ble';
import { ConnectionHeader } from './ConnectionHeader';
import { TelemetryGrid } from './TelemetryGrid';
import { ControlBar } from './ControlBar';

interface Props {
    workout: UseWorkoutResult;
}

export const WorkoutDashboard: React.FC<Props> = ({ workout }) => {
    const { data, status, protocolName, isStale, start, pause, disconnect, setResistance } = workout;

    return (
        <View style={styles.container}>
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
        backgroundColor: '#000', // Premium dark mode
        padding: 20,
    },
});
