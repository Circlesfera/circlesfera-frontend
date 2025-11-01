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
          50: '#ecf6ff',
          100: '#d6e9ff',
          200: '#aed3ff',
          300: '#7fbbff',
          400: '#499dff',
          500: '#1f7efe',
          600: '#0a63e4',
          700: '#064abc',
          800: '#083c8f',
          900: '#0a326f'
        },
        accent: '#f97316',
        success: '#22c55e',
        warning: '#facc15',
        danger: '#ef4444'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Clash Display', 'Inter', 'sans-serif']
      },
      backgroundImage: {
        'hero-grid': 'radial-gradient(circle at 1px 1px, rgba(79, 70, 229, 0.18) 1px, transparent 0)'
      },
      boxShadow: {
        'soft-lg': '0 20px 50px -20px rgba(15, 23, 42, 0.25)'
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards'
      }
    }
  },
  darkMode: 'class',
  plugins: []
};

export default config;

