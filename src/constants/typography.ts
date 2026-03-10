import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const FontFamily = {
  // Using system fonts for reliability without custom font loading
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 40,
  '5xl': 48,
};

export const LineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
};

export const Typography = StyleSheet.create({
  // Display
  displayLarge: {
    fontSize: FontSize['4xl'],
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: FontSize['4xl'] * 1.1,
    color: Colors.textPrimary,
  },
  displayMedium: {
    fontSize: FontSize['3xl'],
    fontWeight: '800',
    letterSpacing: -1.2,
    lineHeight: FontSize['3xl'] * 1.15,
    color: Colors.textPrimary,
  },
  displaySmall: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: FontSize['2xl'] * 1.2,
    color: Colors.textPrimary,
  },

  // Headings
  h1: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: FontSize['2xl'] * 1.25,
    color: Colors.textPrimary,
  },
  h2: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: FontSize.xl * 1.3,
    color: Colors.textPrimary,
  },
  h3: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: FontSize.lg * 1.35,
    color: Colors.textPrimary,
  },
  h4: {
    fontSize: FontSize.md,
    fontWeight: '600',
    letterSpacing: -0.1,
    lineHeight: FontSize.md * 1.4,
    color: Colors.textPrimary,
  },

  // Body
  bodyLarge: {
    fontSize: FontSize.md,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: FontSize.md * 1.6,
    color: Colors.textSecondary,
  },
  body: {
    fontSize: FontSize.base,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: FontSize.base * 1.6,
    color: Colors.textSecondary,
  },
  bodySmall: {
    fontSize: FontSize.sm,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: FontSize.sm * 1.55,
    color: Colors.textSecondary,
  },

  // Labels
  labelLarge: {
    fontSize: FontSize.base,
    fontWeight: '600',
    letterSpacing: 0.1,
    lineHeight: FontSize.base * 1.4,
    color: Colors.textPrimary,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    letterSpacing: 0.2,
    lineHeight: FontSize.sm * 1.4,
    color: Colors.textPrimary,
  },
  labelSmall: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.4,
    lineHeight: FontSize.xs * 1.4,
    color: Colors.textTertiary,
  },

  // Caption
  caption: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    letterSpacing: 0.3,
    lineHeight: FontSize.xs * 1.5,
    color: Colors.textTertiary,
  },

  // Overline (all caps labels)
  overline: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.textTertiary,
  },
});
