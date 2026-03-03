import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
    label: string;
    value: string | number;
    unit: string;
    primary?: boolean;
    color?: string;
}

export const MetricCard: React.FC<Props> = ({ label, value, unit, primary = false, color = '#fff' }) => {
    return (
        <View style={[styles.bentoBox, primary ? styles.bentoLarge : styles.bentoSmall]}>
            <Text style={styles.label}>{label}</Text>
            <Text style={[primary ? styles.valueLarge : styles.valueSmall, { color }]}>{value}</Text>
            <Text style={styles.unit}>{unit}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    bentoBox: {
        backgroundColor: '#1c1c1e',
        borderRadius: 24,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2c2c2e',
    },
    bentoLarge: {
        flex: 1,
        aspectRatio: 1,
    },
    bentoSmall: {
        flex: 1,
        aspectRatio: 1.5,
    },
    label: {
        fontSize: 12,
        color: '#8e8e93',
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
    },
    valueLarge: {
        fontSize: 48,
        fontWeight: '900',
        fontVariant: ['tabular-nums'],
    },
    valueSmall: {
        fontSize: 32,
        fontWeight: '800',
        fontVariant: ['tabular-nums'],
    },
    unit: {
        fontSize: 14,
        color: '#636366',
        fontWeight: '600',
        marginTop: 4,
    },
});
