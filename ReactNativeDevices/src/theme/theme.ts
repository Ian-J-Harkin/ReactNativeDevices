import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// SportPlus Branding Colors
export const SportPlusColors = {
    primary: '#E5B84B', // Vibrant Gold
    backgroundDark: '#121212', // Deep Charcoal
    surfaceDark: '#1E1E1E',
    backgroundLight: '#F8F9FA',
    surfaceLight: '#FFFFFF',
    textPrimaryLight: '#212529',
    textSecondaryLight: '#6C757D',
    textPrimaryDark: '#FFFFFF',
    textSecondaryDark: '#A0A0A0',
    error: '#FF3B30',
    success: '#30D158'
};

// Map to React Native Paper's Dark Theme
export const AppDarkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: SportPlusColors.primary,
        background: SportPlusColors.backgroundDark,
        surface: SportPlusColors.surfaceDark,
        onSurface: SportPlusColors.textPrimaryDark,
        onSurfaceVariant: SportPlusColors.textSecondaryDark,
        error: SportPlusColors.error,
    },
};

// Map to React Native Paper's Light Theme
export const AppLightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: SportPlusColors.primary,
        background: SportPlusColors.backgroundLight,
        surface: SportPlusColors.surfaceLight,
        onSurface: SportPlusColors.textPrimaryLight,
        onSurfaceVariant: SportPlusColors.textSecondaryLight,
        error: SportPlusColors.error,
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const Radii = {
    sm: 8,
    md: 12,
    lg: 20,
    pill: 9999,
};
