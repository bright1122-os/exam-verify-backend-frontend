/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E40AF',
          light: '#3B82F6',
          dark: '#1E3A8A',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        anthracite: '#141413',
        parchment: {
          DEFAULT: '#F8F6F2',
          dark: '#EDE9E3',
        },
        stone: '#6B7280',
        sand: '#F3F1EC',
        cream: '#FFFDF9',
        ink: {
          DEFAULT: '#0C1220',
          light: '#1A2332',
          muted: '#2A3444',
        },
        warm: {
          50: '#FEFDFB',
          100: '#FBF8F3',
          200: '#F3EDE4',
          300: '#E8DFD2',
          400: '#C4B9A8',
          500: '#9A8E7E',
        },
        terracotta: {
          DEFAULT: '#1E40AF',
          50: 'rgba(30, 64, 175, 0.08)',
          100: 'rgba(30, 64, 175, 0.12)',
          200: 'rgba(30, 64, 175, 0.2)',
        },
      },
      fontFamily: {
        heading: ['Lora', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['5.5rem', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-lg': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'display-md': ['3.5rem', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'display-sm': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'heading-lg': ['2rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'heading-md': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.3' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body-md': ['1rem', { lineHeight: '1.7' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
        'label': ['0.75rem', { lineHeight: '1', letterSpacing: '0.08em' }],
        'micro': ['0.6875rem', { lineHeight: '1', letterSpacing: '0.1em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '20px',
        '2xl': '28px',
        '3xl': '40px',
      },
      boxShadow: {
        'premium': '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 20px rgba(0, 0, 0, 0.03)',
        'premium-hover': '0 8px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
        'premium-lg': '0 20px 60px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'card-dark': '0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'shimmer': 'shimmer 2s linear infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'reveal': 'reveal 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-120px)' },
          '100%': { transform: 'translateY(120px)' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
