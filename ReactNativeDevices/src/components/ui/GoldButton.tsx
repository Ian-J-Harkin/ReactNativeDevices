import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Radii, Spacing } from '../../theme/theme';

interface GoldButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'black';
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    isPill?: boolean;
    fullWidth?: boolean;
}

export const GoldButton: React.FC<GoldButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    style,
    textStyle,
    isPill = false,
    fullWidth = false,
}) => {
    const theme = useTheme();

    let backgroundColor = theme.colors.primary; // Gold
    let textColor = '#000000'; // Black text on gold
    let borderColor = 'transparent';

    if (variant === 'secondary') {
        backgroundColor = 'transparent';
        textColor = theme.colors.onSurface;
        borderColor = theme.colors.outline;
    } else if (variant === 'black') {
        backgroundColor = theme.colors.onSurface;
        textColor = theme.colors.surface;
    }

    if (disabled) {
        backgroundColor = theme.colors.surfaceDisabled;
        textColor = theme.colors.onSurfaceDisabled;
        borderColor = 'transparent';
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={[
                styles.base,
                {
                    backgroundColor,
                    borderColor,
                    borderWidth: variant === 'secondary' ? 1 : 0,
                    borderRadius: isPill ? Radii.pill : Radii.md,
                    width: fullWidth ? '100%' : 'auto',
                    opacity: disabled ? 0.7 : 1,
                },
                style,
            ]}
        >
            <Text style={[styles.text, { color: textColor }, textStyle]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
    },
});
