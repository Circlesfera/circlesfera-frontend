import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './modules/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
          DEFAULT: '#a855f7'
        },
        accent: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9f1239',
          900: '#831843',
          950: '#500724'
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        warning: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12'
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d'
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'sans-serif']
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        'xs': ['0.75rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.5rem', letterSpacing: '0.005em' }],
        'base': ['1rem', { lineHeight: '1.625rem', letterSpacing: '0em' }],
        'lg': ['1.125rem', { lineHeight: '1.875rem', letterSpacing: '-0.005em' }],
        'xl': ['1.25rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2.25rem', letterSpacing: '-0.015em' }],
        '3xl': ['1.875rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.025em' }],
        '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.03em' }],
        '6xl': ['3.75rem', { lineHeight: '1.15', letterSpacing: '-0.035em' }],
        '7xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],
        '8xl': ['6rem', { lineHeight: '1.1', letterSpacing: '-0.045em' }],
        '9xl': ['8rem', { lineHeight: '1.05', letterSpacing: '-0.05em' }]
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
        '176': '44rem',
        '192': '48rem'
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-grid': 'radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.15) 1px, transparent 0)',
        'mesh-gradient': 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(15, 23, 42, 0.15)',
        'soft-md': '0 4px 16px -4px rgba(15, 23, 42, 0.2)',
        'soft-lg': '0 10px 30px -10px rgba(15, 23, 42, 0.25)',
        'soft-xl': '0 20px 50px -20px rgba(15, 23, 42, 0.3)',
        'glow-sm': '0 0 10px rgba(168, 85, 247, 0.3)',
        'glow-md': '0 0 20px rgba(168, 85, 247, 0.4)',
        'glow-lg': '0 0 30px rgba(168, 85, 247, 0.5)',
        'glow-xl': '0 0 40px rgba(168, 85, 247, 0.6)',
        'glow-accent-sm': '0 0 10px rgba(236, 72, 153, 0.3)',
        'glow-accent-md': '0 0 20px rgba(236, 72, 153, 0.4)',
        'glow-accent-lg': '0 0 30px rgba(236, 72, 153, 0.5)',
        'glow-primary-accent': '0 0 30px rgba(168, 85, 247, 0.4), 0 0 60px rgba(236, 72, 153, 0.2)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.4)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.4)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        'elegant': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'elegant-lg': '0 12px 48px rgba(0, 0, 0, 0.5)',
        'elegant-xl': '0 16px 64px rgba(0, 0, 0, 0.6)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.3), 0 2px 8px -2px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 8px 32px -4px rgba(0, 0, 0, 0.4), 0 4px 16px -4px rgba(0, 0, 0, 0.3)'
      },
      backdropBlur: {
        'xs': '2px',
        '4xl': '72px'
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-out': {
          from: { opacity: '1', transform: 'translateY(0)' },
          to: { opacity: '0', transform: 'translateY(-8px)' }
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-100%)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' }
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        },
        'scale-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'fade-out': 'fade-out 0.2s ease-in forwards',
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.3s ease-out forwards',
        'slide-up': 'slide-up 0.4s ease-out forwards',
        'scale-in': 'scale-in 0.2s ease-out forwards',
        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'scale-pulse': 'scale-pulse 2s ease-in-out infinite'
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms'
      }
    }
  },
  darkMode: 'class',
  plugins: []
};

export default config;

