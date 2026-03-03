import type { Theme } from '@react-navigation/native';

export const palette = {
  ink: '#0f172a',
  muted: '#475569',
  surface: '#f8fafc',
  card: '#ffffff',
  accent: '#0ea5e9',
  accentDark: '#0284c7',
  border: '#e2e8f0',
  danger: '#b91c1c',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const navigationTheme: Theme = {
  dark: false,
  colors: {
    primary: palette.accent,
    background: palette.surface,
    card: palette.card,
    text: palette.ink,
    border: palette.border,
    notification: palette.accentDark,
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '800',
    },
  },
};
