/**
 * 🎨 TAILWIND CSS CONFIGURATION - CIRCLESFERA
 * ===========================================
 * Configuración unificada usando design tokens
 * @see src/design-system/tokens/index.ts
 */

// Importar design tokens (única fuente de verdad)
const designTokens = require('./src/design-system/tokens/index.ts')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',

  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/design-system/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      // ✅ Colores desde tokens (WCAG 2.1 AA compliant)
      colors: {
        ...designTokens.colors,
        // Aliases para compatibilidad
        gray: designTokens.colors.gray,
      },

      // ✅ Spacing desde tokens
      spacing: designTokens.spacing,

      // ✅ Tipografía desde tokens
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.fontSize,
      fontWeight: designTokens.typography.fontWeight,
      lineHeight: designTokens.typography.lineHeight,
      letterSpacing: designTokens.typography.letterSpacing,

      // ✅ Border radius desde tokens
      borderRadius: designTokens.borderRadius,

      // ✅ Shadows desde tokens
      boxShadow: {
        ...designTokens.shadows,
        // Aliases custom
        base: designTokens.shadows.DEFAULT,
        soft: designTokens.shadows.soft,
        medium: designTokens.shadows.lg,
        large: designTokens.shadows.xl,
      },

      // ✅ Z-index desde tokens
      zIndex: designTokens.zIndex,

      // ✅ Max width desde tokens
      maxWidth: designTokens.layout.maxWidth,

      // Backdrop blur
      backdropBlur: {
        xs: '2px',
      },

      // Animaciones (mantener las existentes)
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'scale': 'scale 0.3s ease-in-out',
        'shimmer': 'shimmer 1.5s infinite',
        'gradient-shift': 'gradientShift 3s ease infinite',
        'blob': 'blob 7s infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scale: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        blob: {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
          },
          '25%': {
            transform: 'translate(20px, -50px) scale(1.1)',
          },
          '50%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '75%': {
            transform: 'translate(50px, 50px) scale(1.05)',
          },
        },
      },
    },
  },

  plugins: [],
}
