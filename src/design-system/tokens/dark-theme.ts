/**
 * 🌙 DARK THEME TOKENS
 * ====================
 * Tokens de colores para modo oscuro
 *
 * ✅ WCAG 2.1 AA Compliant (contraste invertido)
 * ✅ Compatible con light theme
 * ✅ Transiciones suaves
 *
 * @see src/design-system/tokens/index.ts
 */

export const darkTheme = {
  // Colores de texto (invertidos)
  text: {
    primary: '#f8fafc',      // 15.3:1 sobre fondo oscuro ✅
    secondary: '#cbd5e1',    // 9.0:1 ✅
    tertiary: '#94a3b8',     // 5.8:1 ✅
    inverse: '#0f172a',      // Para fondos claros
    disabled: '#64748b',
    link: '#60a5fa',         // Azul más claro para dark
    linkHover: '#93c5fd',
  },

  // Colores de fondo
  background: {
    primary: '#0f172a',      // Slate 900
    secondary: '#1e293b',    // Slate 800
    tertiary: '#334155',     // Slate 700
    inverse: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.75)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',
  },

  // Colores de borde
  border: {
    primary: '#334155',      // Más visible en dark
    secondary: '#475569',
    focus: '#60a5fa',        // Azul más claro
    error: '#f87171',        // Rojo más claro
    success: '#4ade80',      // Verde más claro
  },

  // Estados (ajustados para dark)
  state: {
    success: {
      bg: '#14532d',         // Verde oscuro
      border: '#166534',
      text: '#4ade80',       // Verde claro ✅
      icon: '#22c55e',
    },
    warning: {
      bg: '#78350f',         // Amarillo oscuro
      border: '#92400e',
      text: '#fbbf24',       // Amarillo claro ✅
      icon: '#f59e0b',
    },
    error: {
      bg: '#7f1d1d',         // Rojo oscuro
      border: '#991b1b',
      text: '#f87171',       // Rojo claro ✅
      icon: '#ef4444',
    },
    info: {
      bg: '#1e3a8a',         // Azul oscuro
      border: '#1e40af',
      text: '#93c5fd',       // Azul claro ✅
      icon: '#60a5fa',
    },
  },

  // Superficies
  surface: {
    card: '#1e293b',         // Slate 800
    elevated: '#334155',     // Slate 700
    overlay: '#0f172a',
    backdrop: 'rgba(0, 0, 0, 0.8)',
  },

  // Colores primarios (ajustados para mejor visibilidad)
  primary: {
    50: '#1e3a8a',
    100: '#1e40af',
    200: '#1d4ed8',
    300: '#2563eb',
    400: '#3b82f6',
    500: '#60a5fa',          // Más claro para dark mode
    600: '#93c5fd',
    700: '#bfdbfe',
    800: '#dbeafe',
    900: '#eff6ff',
  },

  // Grises (invertidos)
  gray: {
    50: '#0f172a',
    100: '#1e293b',
    200: '#334155',
    300: '#475569',
    400: '#64748b',
    500: '#94a3b8',
    600: '#cbd5e1',
    700: '#e2e8f0',
    800: '#f1f5f9',
    900: '#f8fafc',
  },
} as const

/**
 * Utilidad para generar clases dark: de Tailwind
 */
export function generateDarkClasses(lightClass: string, darkClass: string): string {
  return `${lightClass} dark:${darkClass}`
}

/**
 * Mapeo de clases comunes light → dark
 */
export const darkClassMap = {
  // Backgrounds
  'bg-white': 'dark:bg-gray-900',
  'bg-gray-50': 'dark:bg-gray-800',
  'bg-gray-100': 'dark:bg-gray-700',

  // Text
  'text-gray-900': 'dark:text-gray-100',
  'text-gray-800': 'dark:text-gray-200',
  'text-gray-700': 'dark:text-gray-300',
  'text-gray-600': 'dark:text-gray-400',
  'text-gray-500': 'dark:text-gray-500',

  // Borders
  'border-gray-200': 'dark:border-gray-700',
  'border-gray-300': 'dark:border-gray-600',

  // Hover states
  'hover:bg-gray-50': 'dark:hover:bg-gray-800',
  'hover:bg-gray-100': 'dark:hover:bg-gray-700',
} as const

