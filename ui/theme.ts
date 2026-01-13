import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { MD3LightTheme } from 'react-native-paper';

export const colors = {
  bg: '#F3F5FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F7F9FF',

  white: '#FFFFFF',
  black: '#000000',

  text: '#0B2B34',
  textMuted: '#6B7280',
  textSubtle: '#9AA3B2',

  primary: '#6366F1',
  primaryDark: '#0B2545',
  primarySoft: 'rgba(99,102,241,0.12)',

  onPrimary: '#FFFFFF',

  onPrimaryMuted: 'rgba(255,255,255,0.92)',
  onPrimarySubtle: 'rgba(255,255,255,0.82)',

  info: '#3B82F6',

  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',

  infoSoft: 'rgba(59,130,246,0.12)',
  successSoft: 'rgba(34,197,94,0.12)',
  warningSoft: 'rgba(245,158,11,0.12)',
  dangerSoft: 'rgba(239,68,68,0.10)',

  border: '#E6EEFB',

  overlay: 'rgba(0,0,0,0.5)',
};

export const accentPalette = [
  colors.info,
  colors.success,
  colors.warning,
  '#8B5CF6', // violet accent
  colors.danger,
  '#06B6D4', // cyan accent
];

export const radii = {
  sm: 10,
  md: 12,
  lg: 16,
  xl: 22,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
};

export const paperTheme = {
  ...MD3LightTheme,
  roundness: radii.md,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.primary,
    background: colors.bg,
    surface: colors.surface,
    onSurface: colors.text,
    onBackground: colors.text,
    error: colors.danger,
  },
};

export const navigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};
