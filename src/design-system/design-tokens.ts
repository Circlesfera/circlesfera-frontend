// Design System Tokens - Inspirado en Instagram
// Este archivo define todos los tokens de diseño para mantener consistencia

export const designTokens = {
  // Colores principales inspirados en Instagram
  colors: {
    // Azul Instagram
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Color principal
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Gradientes Instagram
    gradients: {
      primary: 'linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d)',
      secondary: 'linear-gradient(45deg, #ffdc80, #fcaf45, #f77737, #fd1d1d, #c13584, #833ab4)',
      accent: 'linear-gradient(45deg, #4facfe, #00f2fe)',
      warm: 'linear-gradient(45deg, #fa709a, #fee140)',
      cool: 'linear-gradient(45deg, #a8edea, #fed6e3)',
    },

    // Colores de texto
    text: {
      primary: '#262626',
      secondary: '#8e8e8e', 
      tertiary: '#c7c7c7',
      inverse: '#ffffff',
      link: '#0095f6',
    },

    // Colores de fondo
    background: {
      primary: '#ffffff',
      secondary: '#fafafa',
      tertiary: '#efefef',
      inverse: '#000000',
      overlay: 'rgba(0, 0, 0, 0.65)',
    },

    // Colores de estado
    state: {
      success: '#22c55e',
      warning: '#f59e0b', 
      error: '#ef4444',
      info: '#3b82f6',
    },

    // Colores de borde
    border: {
      primary: '#dbdbdb',
      secondary: '#efefef',
      focus: '#0095f6',
    },
  },

  // Tipografía
  typography: {
    fontFamily: {
      primary: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
    },
    
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },

    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },

    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // Espaciado
  spacing: {
    0: '0',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px',
  },

  // Bordes y radios
  borderRadius: {
    none: '0',
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },

  // Sombras
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },

  // Transiciones
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Z-index
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Breakpoints
  breakpoints: {
    xs: '480px',
    sm: '640px', 
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Utilidades para acceder a los tokens
export const getColor = (colorPath: string) => {
  const keys = colorPath.split('.');
  let value: Record<string, unknown> = designTokens.colors;
  
  for (const key of keys) {
    value = value?.[key] as Record<string, unknown>;
  }
  
  return value || colorPath;
};

export const getSpacing = (size: keyof typeof designTokens.spacing) => {
  return designTokens.spacing[size];
};

export const getShadow = (size: keyof typeof designTokens.shadows) => {
  return designTokens.shadows[size];
};

export const getTransition = (speed: keyof typeof designTokens.transitions) => {
  return designTokens.transitions[speed];
};

// Clases de utilidad para Tailwind
export const utilityClasses = {
  // Botones
  btn: {
    primary: `
      bg-gradient-to-r from-blue-500 to-purple-600 
      text-white font-medium px-6 py-3 
      rounded-xl shadow-lg hover:shadow-xl 
      transition-all duration-300 ease-out 
      hover:scale-105 active:scale-95
      focus:outline-none focus:ring-4 focus:ring-blue-300
    `,
    secondary: `
      bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium px-6 py-3 
      rounded-xl border-2 border-gray-200 dark:border-gray-700 
      hover:border-gray-300 dark:border-gray-600 hover:shadow-lg 
      transition-all duration-300 ease-out 
      hover:scale-105 active:scale-95
      focus:outline-none focus:ring-4 focus:ring-gray-200
    `,
    ghost: `
      text-gray-600 dark:text-gray-400 dark:text-gray-500 font-medium px-4 py-2 
      rounded-lg hover:bg-gray-100 dark:bg-gray-800 
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-gray-200
    `,
  },

  // Inputs
  input: `
    w-full px-4 py-3 
    border-2 border-gray-200 dark:border-gray-700 rounded-xl 
    focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
    transition-all duration-200 ease-out
    placeholder:text-gray-400 dark:text-gray-500
    bg-white dark:bg-gray-900
  `,

  // Cards
  card: `
    bg-white dark:bg-gray-900 rounded-2xl shadow-lg 
    border border-gray-100 dark:border-gray-700 
    hover:shadow-xl hover:-translate-y-1 
    transition-all duration-300 ease-out
  `,

  // Avatar
  avatar: {
    sm: 'w-8 h-8 rounded-full object-cover',
    base: 'w-10 h-10 rounded-full object-cover',
    lg: 'w-12 h-12 rounded-full object-cover',
    xl: 'w-16 h-16 rounded-full object-cover',
    '2xl': 'w-20 h-20 rounded-full object-cover',
  },

  // Text
  text: {
    heading: 'text-gray-900 dark:text-gray-100 font-semibold',
    body: 'text-gray-700 dark:text-gray-300',
    caption: 'text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm',
    link: 'text-blue-500 hover:text-blue-600 transition-colors',
  },
} as const;
