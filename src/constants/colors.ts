export const Colors = {
  // Brand
  primary: '#E8704A',       // Warm terracotta - energy, appetite
  primaryLight: '#F28C6A',
  primaryDark: '#C4573A',
  primaryMuted: '#FDF0EC',

  secondary: '#2D6A4F',     // Deep forest green - freshness, health
  secondaryLight: '#52B788',
  secondaryMuted: '#EAF4EE',

  accent: '#F5A623',        // Saffron gold - premium, warmth
  accentLight: '#FFF3DC',

  // Backgrounds
  background: '#FFFBF7',    // Warm cream - premium, clean
  backgroundDark: '#FFF4EE',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFEFE',

  // Dark surfaces (for cards with dark bg)
  dark: '#1A1207',
  darkSurface: '#231A0E',
  darkCard: '#2E2318',

  // Text
  textPrimary: '#1A1207',
  textSecondary: '#6B5C4E',
  textTertiary: '#A89080',
  textInverse: '#FFFBF7',
  textMuted: '#C4B5A8',

  // Borders
  border: '#EDE0D8',
  borderLight: '#F5ECE7',
  borderStrong: '#D4C4BA',

  // Status
  success: '#22C55E',
  successMuted: '#DCFCE7',
  warning: '#F59E0B',
  warningMuted: '#FEF3C7',
  error: '#EF4444',
  errorMuted: '#FEE2E2',

  // Overlays
  overlay: 'rgba(26, 18, 7, 0.45)',
  overlayLight: 'rgba(26, 18, 7, 0.20)',
  overlayDark: 'rgba(26, 18, 7, 0.70)',

  // Gradients (as arrays for LinearGradient)
  gradientWarm: ['#FF8C5A', '#E8704A'],
  gradientDark: ['#1A1207', '#2E2318'],
  gradientCard: ['rgba(26, 18, 7, 0)', 'rgba(26, 18, 7, 0.85)'],
  gradientHero: ['rgba(26, 18, 7, 0)', 'rgba(26, 18, 7, 0.95)'],
  gradientGreen: ['#52B788', '#2D6A4F'],
  gradientGold: ['#F5C842', '#F5A623'],
  gradientSunrise: ['#FF8C5A', '#F5A623'],
};

export const Shadows = {
  sm: {
    shadowColor: '#1A1207',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A1207',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#1A1207',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  },
  xl: {
    shadowColor: '#E8704A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.30,
    shadowRadius: 20,
    elevation: 12,
  },
  card: {
    shadowColor: '#1A1207',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
};
