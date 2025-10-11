/**
 * Constantes centralizadas del frontend
 * NO hardcodear valores en el código, usar estas constantes
 */

// ============================================
// LÍMITES DE CONTENIDO
// ============================================
export const CONTENT_LIMITS = {
  // Usuarios
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
  },
  BIO: {
    MAX_LENGTH: 160,
  },
  FULL_NAME: {
    MAX_LENGTH: 50,
  },

  // Posts
  CAPTION: {
    MAX_LENGTH: 2200,
  },
  TAGS: {
    MAX_PER_POST: 30,
    MAX_LENGTH: 50,
  },
  IMAGES: {
    MAX_PER_POST: 10,
  },

  // Comentarios
  COMMENT: {
    MAX_LENGTH: 500,
  },

  // Mensajes
  MESSAGE: {
    MAX_LENGTH: 1000,
  },

  // Stories
  STORY_DURATION_MS: 24 * 60 * 60 * 1000, // 24 horas

  // Reels
  REEL: {
    MAX_DURATION_SECONDS: 60,
    MIN_DURATION_SECONDS: 3,
  },
} as const;

// ============================================
// LÍMITES DE ARCHIVOS (usar env vars como override)
// ============================================
export const FILE_LIMITS = {
  IMAGE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  },
  VIDEO: {
    MAX_SIZE: 100 * 1024 * 1024, // 100MB
    ALLOWED_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
    ALLOWED_EXTENSIONS: ['.mp4', '.webm', '.mov'],
    MAX_DURATION: 60, // segundos
    MIN_DURATION: 3, // segundos
  },
  AVATAR: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  },
} as const;

// ============================================
// UI - COLORES DE MARCA
// ============================================
export const BRAND_COLORS = {
  PRIMARY: '#1DA1F2',
  SECONDARY: '#14171A',
  ACCENT: '#E1E8ED',
  SUCCESS: '#17BF63',
  ERROR: '#E0245E',
  WARNING: '#FFAD1F',
  INFO: '#1DA1F2',
} as const;

// ============================================
// UI - BREAKPOINTS (Mobile-first)
// ============================================
export const BREAKPOINTS = {
  XS: 320,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
} as const;

// ============================================
// PAGINACIÓN
// ============================================
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
  INFINITE_SCROLL_THRESHOLD: 0.8, // 80% del scroll
} as const;

// ============================================
// VALIDACIÓN
// ============================================
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
  },
  SEARCH: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  EMAIL: {
    MAX_LENGTH: 255,
  },
} as const;

// ============================================
// RUTAS DE LA APLICACIÓN
// ============================================
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  USER_PROFILE: (username: string) => `/${username}`,
  POST: (id: string) => `/post/${id}`,
  REEL: (id: string) => `/reel/${id}`,
  EXPLORE: '/explore',
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  CREATE: '/create',
  LIVE: '/live',
} as const;

// ============================================
// KEYS DE LOCAL STORAGE
// ============================================
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  RECENT_SEARCHES: 'recentSearches',
} as const;

// ============================================
// TIPOS DE NOTIFICACIONES
// ============================================
export const NOTIFICATION_TYPES = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  MENTION: 'mention',
  MESSAGE: 'message',
  SYSTEM: 'system',
} as const;

// ============================================
// TIPOS DE CONTENIDO
// ============================================
export const CONTENT_TYPES = {
  POST: {
    IMAGE: 'image',
    VIDEO: 'video',
  },
  STORY: {
    IMAGE: 'image',
    VIDEO: 'video',
    TEXT: 'text',
  },
  MESSAGE: {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    LOCATION: 'location',
  },
} as const;

// ============================================
// TIMEOUTS Y DELAYS
// ============================================
export const TIMEOUTS = {
  API_REQUEST: 10000, // 10 segundos
  DEBOUNCE_SEARCH: 300, // 300ms
  TOAST_DURATION: 3000, // 3 segundos
  STORY_DURATION: 5000, // 5 segundos
  SKELETON_MIN_DURATION: 500, // 500ms
} as const;

// ============================================
// WEBSOCKET EVENTS
// ============================================
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
  NOTIFICATION: 'notification',
  TYPING: 'typing',
  ONLINE: 'online',
  OFFLINE: 'offline',
} as const;

// ============================================
// MENSAJES DE ERROR COMUNES
// ============================================
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de red. Por favor, verifica tu conexión.',
  SERVER_ERROR: 'Error del servidor. Por favor, intenta más tarde.',
  UNAUTHORIZED: 'No autorizado. Por favor, inicia sesión.',
  FORBIDDEN: 'No tienes permiso para realizar esta acción.',
  NOT_FOUND: 'Recurso no encontrado.',
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.',
  FILE_TOO_LARGE: 'El archivo es demasiado grande.',
  INVALID_FILE_TYPE: 'Tipo de archivo no permitido.',
  UPLOAD_FAILED: 'Error al subir el archivo.',
} as const;

// ============================================
// REGEX PATTERNS
// ============================================
export const REGEX_PATTERNS = {
  USERNAME: /^[a-zA-Z0-9._]{3,30}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  HASHTAG: /#[a-zA-Z0-9_]+/g,
  MENTION: /@[a-zA-Z0-9._]+/g,
  URL: /(https?:\/\/[^\s]+)/g,
} as const;

// ============================================
// FEATURES FLAGS (valores por defecto)
// ============================================
export const DEFAULT_FEATURES = {
  STORIES: true,
  REELS: true,
  LIVE: true,
  MESSAGES: true,
  NOTIFICATIONS: true,
  DARK_MODE: true,
} as const;

// ============================================
// ANIMACIONES
// ============================================
export const ANIMATIONS = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================
// PWA
// ============================================
export const PWA = {
  THEME_COLOR: '#1DA1F2',
  BACKGROUND_COLOR: '#000000',
  DISPLAY: 'standalone' as const,
  ORIENTATION: 'portrait' as const,
} as const;

// ============================================
// EXPORTAR TODO COMO OBJETO ÚNICO
// ============================================
export const CONSTANTS = {
  CONTENT_LIMITS,
  FILE_LIMITS,
  BRAND_COLORS,
  BREAKPOINTS,
  PAGINATION,
  VALIDATION,
  ROUTES,
  STORAGE_KEYS,
  NOTIFICATION_TYPES,
  CONTENT_TYPES,
  TIMEOUTS,
  WS_EVENTS,
  ERROR_MESSAGES,
  REGEX_PATTERNS,
  DEFAULT_FEATURES,
  ANIMATIONS,
  PWA,
} as const;

export default CONSTANTS;

