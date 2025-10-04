// Configuración de variables de entorno para el frontend

export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://dev-api.circlesfera.com/api',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://dev.circlesfera.com'),
  
  // App Configuration
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'CircleSfera',
  appDescription: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Redefining social media in a connected world.',
  
  // File Configuration
  maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'), // 10MB
  allowedFileTypes: (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm').split(','),
  
  // Features Configuration
  features: {
    stories: process.env.NEXT_PUBLIC_FEATURES_STORIES === 'true',
    reels: process.env.NEXT_PUBLIC_FEATURES_REELS === 'true',
    messages: process.env.NEXT_PUBLIC_FEATURES_MESSAGES === 'true',
    notifications: process.env.NEXT_PUBLIC_FEATURES_NOTIFICATIONS === 'true',
  },
  
  // Analytics Configuration (optional)
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  
  // Maps Configuration (optional)
  maps: {
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  
  // Push Notifications Configuration (optional)
  pushNotifications: {
    vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  },
  
  // Development Configuration
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

// Validación de configuración crítica
export const validateConfig = () => {
  const errors: string[] = [];
  
  if (!config.apiUrl) {
    errors.push('NEXT_PUBLIC_API_URL is required');
  }
  
  if (!config.appUrl) {
    errors.push('NEXT_PUBLIC_APP_URL is required');
  }
  
  if (config.maxFileSize <= 0) {
    errors.push('NEXT_PUBLIC_MAX_FILE_SIZE must be a positive number');
  }
  
  if (config.allowedFileTypes.length === 0) {
    errors.push('NEXT_PUBLIC_ALLOWED_FILE_TYPES must contain at least one file type');
  }
  
  if (errors.length > 0) {
    console.error('Configuration validation errors:', errors);
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }
  
  return true;
};

// Validar configuración al importar el módulo
if (typeof window !== 'undefined') {
  validateConfig();
}
