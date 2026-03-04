import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

export type IconName =
    | 'bluetooth'
    | 'dumbbell'
    | 'clock'
    | 'flame'
    | 'heart'
    | 'play'
    | 'pause'
    | 'stop'
    | 'chevron-left'
    | 'chevron-right'
    | 'search'
    | 'settings'
    | 'share'
    | 'menu-down'
    | 'close'
    | 'help-circle'
    | 'chevron-up';

const iconMap: Record<IconName, keyof typeof MaterialCommunityIcons.glyphMap> = {
    'bluetooth': 'bluetooth',
    'dumbbell': 'dumbbell',
    'clock': 'clock-outline',
    'flame': 'fire',
    'heart': 'heart-outline',
    'play': 'play',
    'pause': 'pause',
    'stop': 'stop',
    'chevron-left': 'chevron-left',
    'chevron-right': 'chevron-right',
    'search': 'magnify',
    'settings': 'cog-outline',
    'share': 'share-variant',
    'menu-down': 'menu-down',
    'close': 'close',
    'help-circle': 'help-circle-outline',
    'chevron-up': 'chevron-up',
};

interface AppIconProps {
    name: IconName;
    size?: number;
    color?: string;
    isGold?: boolean;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, size = 24, color, isGold = false }) => {
    const theme = useTheme();

    const iconColor = isGold ? theme.colors.primary : (color || theme.colors.onSurface);
    const materialName = iconMap[name] || 'help-circle-outline';

    return <MaterialCommunityIcons name={materialName} size={size} color={iconColor} />;
};
