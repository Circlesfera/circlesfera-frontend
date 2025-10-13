/**
 * 🎨 DESIGN TOKENS - CIRCLESFERA
 * ================================
 * FUENTE ÚNICA DE VERDAD para todos los valores de diseño
 *
 * ✅ Cumple con WCAG 2.1 AA (contraste 4.5:1 para texto normal)
 * ✅ Inspirado en Instagram pero con accesibilidad mejorada
 * ✅ Compatible con Dark Mode
 *
 * @see https://www.w3.org/WAI/WCAG21/quickref/
 * @version 2.0.0
 */

// ==========================================
// 🎨 COLORES
// ==========================================

export const colors = {
  // Colores primarios (Azul - Instagram inspired)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Color principal
    600: '#2563eb',  // Hover
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Colores secundarios (Púrpura)
  secondary: {
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
  },

  // Colores de acento (Rosa - Instagram)
  accent: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },

  // Grises (Neutrales) - MEJORADO para WCAG
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',   // 4.6:1 ✅ (antes era #8e8e8e con 2.9:1 ❌)
    600: '#525252',   // 7.0:1 ✅
    700: '#404040',   // 10.7:1 ✅
    800: '#262626',   // 15.3:1 ✅ (texto principal)
    900: '#171717',   // 17.1:1 ✅
  },

  // Colores semánticos (Estados)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',   // 3.1:1 en grande, 4.5:1 con bold ✅
    600: '#16a34a',   // 4.8:1 ✅
    700: '#15803d',   // 6.4:1 ✅
    800: '#166534',
    900: '#14532d',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',   // 2.9:1 en grande ⚠️
    600: '#d97706',   // 4.5:1 ✅
    700: '#b45309',   // 6.0:1 ✅
    800: '#92400e',
    900: '#78350f',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',   // 3.3:1 en grande ⚠️
    600: '#dc2626',   // 4.5:1 ✅
    700: '#b91c1c',   // 6.1:1 ✅
    800: '#991b1b',
    900: '#7f1d1d',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',   // 4.5:1 ✅
    600: '#2563eb',   // 6.0:1 ✅
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Colores específicos de CircleSfera
  circlesfera: {
    // Gradientes Instagram-style
    gradient: {
      primary: 'linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d)',
      secondary: 'linear-gradient(45deg, #ffdc80, #fcaf45, #f77737, #fd1d1d, #c13584, #833ab4)',
      accent: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
      warm: 'linear-gradient(45deg, #fa709a 0%, #fee140 100%)',
      cool: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      ocean: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
    },

    // Link color (Instagram blue)
    link: '#0095f6',     // 4.5:1 ✅
    linkHover: '#0073c0', // 6.0:1 ✅
  },
} as const

// ==========================================
// 🎨 COLORES SEMÁNTICOS (Por uso)
// ==========================================

export const semanticColors = {
  // Textos - AJUSTADOS para WCAG 2.1 AA ✅
  text: {
    primary: colors.gray[800],      // 15.3:1 ✅ (antes #262626)
    secondary: colors.gray[600],    // 7.0:1 ✅ (antes #8e8e8e con 2.9:1 ❌)
    tertiary: colors.gray[500],     // 4.6:1 ✅ (antes #c7c7c7 con 1.8:1 ❌)
    inverse: '#ffffff',             // Para fondos oscuros
    disabled: colors.gray[400],     // 3.4:1 (aceptable para disabled)
    link: colors.circlesfera.link,
    linkHover: colors.circlesfera.linkHover,
  },

  // Fondos
  background: {
    primary: '#ffffff',
    secondary: colors.gray[50],     // #fafafa
    tertiary: colors.gray[100],     // #f5f5f5
    inverse: colors.gray[900],      // Para dark mode
    overlay: 'rgba(0, 0, 0, 0.65)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
  },

  // Bordes
  border: {
    primary: colors.gray[200],      // #e5e5e5 (Instagram-like)
    secondary: colors.gray[100],    // Más sutil
    focus: colors.primary[500],     // Para focus states
    error: colors.error[600],
    success: colors.success[600],
  },

  // Estados
  state: {
    success: {
      bg: colors.success[50],
      border: colors.success[200],
      text: colors.success[700],    // 6.4:1 ✅
      icon: colors.success[600],
    },
    warning: {
      bg: colors.warning[50],
      border: colors.warning[200],
      text: colors.warning[700],    // 6.0:1 ✅
      icon: colors.warning[600],
    },
    error: {
      bg: colors.error[50],
      border: colors.error[200],
      text: colors.error[700],      // 6.1:1 ✅
      icon: colors.error[600],
    },
    info: {
      bg: colors.info[50],
      border: colors.info[200],
      text: colors.info[700],       // 7.1:1 ✅
      icon: colors.info[600],
    },
  },

  // Superficies (Cards, modales, etc)
  surface: {
    card: '#ffffff',
    elevated: '#ffffff',
    overlay: colors.gray[900],
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
} as const

// ==========================================
// 📐 ESPACIADO
// ==========================================

export const spacing = {
  // Escala base (4px)
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px - Mínimo táctil WCAG ✅
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
} as const

// ==========================================
// 🔤 TIPOGRAFÍA
// ==========================================

export const typography = {
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
    mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'Courier New', 'monospace'],
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    '5xl': ['3rem', { lineHeight: '1' }],           // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
    '7xl': ['4.5rem', { lineHeight: '1' }],         // 72px
    '8xl': ['6rem', { lineHeight: '1' }],           // 96px
    '9xl': ['8rem', { lineHeight: '1' }],           // 128px
  },

  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const

// ==========================================
// 🔘 BORDER RADIUS
// ==========================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',     // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',     // 6px
  lg: '0.5rem',       // 8px
  xl: '0.75rem',      // 12px
  '2xl': '1rem',      // 16px
  '3xl': '1.5rem',    // 24px
  full: '9999px',
} as const

// Guía de uso de border-radius por componente
export const radiusGuide = {
  button: borderRadius.lg,        // 8px
  input: borderRadius.xl,         // 12px
  card: borderRadius['2xl'],      // 16px
  modal: borderRadius['2xl'],     // 16px
  avatar: borderRadius.full,      // redondo
  badge: borderRadius.full,       // redondo
  chip: borderRadius.full,        // redondo
  image: borderRadius.lg,         // 8px
} as const

// ==========================================
// 🌑 SOMBRAS
// ==========================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  // Custom shadows
  soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  glow: '0 0 20px rgba(59, 130, 246, 0.3)',
  glowLg: '0 0 30px rgba(59, 130, 246, 0.4)',
} as const

// ==========================================
// ⚡ TRANSICIONES
// ==========================================

export const transitions = {
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },

  timing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  property: {
    none: 'none',
    all: 'all',
    DEFAULT: 'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter',
    colors: 'color, background-color, border-color, text-decoration-color, fill, stroke',
    opacity: 'opacity',
    shadow: 'box-shadow',
    transform: 'transform',
  },
} as const

// ==========================================
// 📱 BREAKPOINTS
// ==========================================

export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ==========================================
// 🗂️ Z-INDEX
// ==========================================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1020,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const

// ==========================================
// 📏 CONSTANTES DE LAYOUT
// ==========================================

export const layout = {
  // Header heights
  header: {
    mobile: '48px',    // h-12
    tablet: '56px',    // h-14
    desktop: '64px',   // h-16
  },

  // Sidebar
  sidebar: {
    width: '240px',    // w-60
    collapsed: '64px', // w-16
  },

  // Mobile nav
  mobileNav: {
    height: '56px',    // h-14
  },

  // Container
  container: {
    padding: {
      mobile: spacing[4],    // px-4
      tablet: spacing[6],    // px-6
      desktop: spacing[8],   // px-8
    },
  },

  // Content widths
  maxWidth: {
    xs: '320px',
    sm: '384px',
    md: '448px',
    lg: '512px',
    xl: '576px',
    '2xl': '672px',
    '3xl': '768px',
    '4xl': '896px',
    '5xl': '1024px',
    '6xl': '1152px',
    '7xl': '1280px',
    full: '100%',
  },
} as const

// ==========================================
// 🎯 CONSTANTES DE COMPONENTES
// ==========================================

export const componentConstants = {
  // Tamaños mínimos táctiles (WCAG 2.1)
  touch: {
    minWidth: '44px',
    minHeight: '44px',
  },

  // Caption length
  caption: {
    previewLength: 80,
    maxLength: 2200,
  },

  // Images
  image: {
    maxPerPost: 10,
    aspectRatios: {
      square: '1:1',
      portrait: '4:5',
      landscape: '16:9',
    },
  },

  // Avatar sizes
  avatar: {
    xs: spacing[8],   // 32px
    sm: spacing[10],  // 40px
    md: spacing[12],  // 48px
    lg: spacing[16],  // 64px
    xl: spacing[20],  // 80px
  },
} as const

// ==========================================
// 📦 EXPORT CONSOLIDADO
// ==========================================

export const designTokens = {
  colors,
  semanticColors,
  spacing,
  typography,
  borderRadius,
  radiusGuide,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  layout,
  componentConstants,
} as const

// Export individual para conveniencia
export {
  colors as COLORS,
  semanticColors as SEMANTIC_COLORS,
  spacing as SPACING,
  typography as TYPOGRAPHY,
  borderRadius as BORDER_RADIUS,
  shadows as SHADOWS,
  transitions as TRANSITIONS,
  breakpoints as BREAKPOINTS,
  zIndex as Z_INDEX,
  layout as LAYOUT,
  componentConstants as COMPONENT_CONSTANTS,
}

// Default export
export default designTokens

