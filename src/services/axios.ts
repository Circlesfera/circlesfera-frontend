import axios, { AxiosError, AxiosResponse } from 'axios';
import { config } from '@/config/env';

const api = axios.create({
  baseURL: '/api', // Usar ruta relativa para aprovechar el proxy de Next.js
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log de inicialización para debug - SIEMPRE mostrar en desarrollo
console.log('🔧 Axios API inicializada:', {
  baseURL: '/api', // Usando proxy de Next.js
  configApiUrl: config.apiUrl,
  envApiUrl: process.env.NEXT_PUBLIC_API_URL,
  nodeEnv: process.env.NODE_ENV,
  isClient: typeof window !== 'undefined'
});

// Función para obtener token de forma segura
const getToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token from localStorage:', error);
    return null;
  }
};

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    // Rutas que no requieren token de autorización
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));

    // Log de interceptor - SIEMPRE mostrar para debug
    console.log('🔐 Axios interceptor - Configuración completa:', {
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: config.baseURL ? `${config.baseURL}${config.url || ''}` : 'No baseURL',
      method: config.method,
      headers: config.headers,
      token: token ? `Bearer ${token.substring(0, 20)}...` : 'No hay token',
      isPublicRoute,
      nodeEnv: process.env.NODE_ENV,
      isClient: typeof window !== 'undefined'
    });

    if (token && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;

      // Log de token enviado
      console.log('Axios interceptor - Token enviado:', `Bearer ${token.substring(0, 20)}...`);
      console.log('Axios interceptor - URL:', config.url);
      console.log('Axios interceptor - Método:', config.method);
    } else if (isPublicRoute) {
      console.log('Axios interceptor - Ruta pública, no se agrega token');
    } else {
      console.log('Axios interceptor - No hay token disponible');
    }

    // Verificar que el header se configuró correctamente DESPUÉS de configurarlo
    const authHeader = config.headers.Authorization;
    if (authHeader && typeof authHeader === 'string') {
      console.log('🔐 Header Authorization configurado:', authHeader.substring(0, 30) + '...');
    } else {
      console.log('❌ Header Authorization NO configurado - Token:', token ? 'Presente' : 'Ausente');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    // Validar que el error tiene la estructura esperada
    if (!error || typeof error !== 'object') {
      console.error('Error inesperado en interceptor de axios:', error);
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Error desconocido';

    // Log de errores en desarrollo (solo para errores críticos)
    if (process.env.NODE_ENV === 'development' && status && status >= 500) {
      console.error('API Error Details:', {
        status: status || 'No status',
        message: message || 'No message',
        url: error.config?.url || 'No URL',
        method: error.config?.method || 'No method'
      });
    }

    // Manejo específico de errores
    switch (status) {
      case 401:
        // Error de autenticación - limpiar tokens y redirigir
        if (process.env.NODE_ENV === 'development') {
          console.warn('🔐 Error de autenticación:', {
            message,
            url: error.config?.url || 'No disponible',
            method: error.config?.method || 'No disponible',
            hasToken: !!getToken(),
            status,
          });
        }

        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        break;

      case 403:
        // Error de autorización
        console.warn('Acceso denegado:', message);
        break;

      case 404:
        // Recurso no encontrado
        console.warn('Recurso no encontrado:', message);
        break;

      case 429:
        // Rate limit excedido
        console.warn('Demasiadas solicitudes:', message);
        break;

      case 500:
        // Error interno del servidor
        console.error('Error interno del servidor:', message);
        break;

      default:
        if (status && status >= 500) {
          console.error('Error del servidor:', message);
        } else if (status && status >= 400) {
          console.warn('Error del cliente:', message);
        }
    }

    return Promise.reject(error);
  }
);

export default api;
