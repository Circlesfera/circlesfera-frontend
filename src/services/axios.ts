import axios, { AxiosError, AxiosResponse } from 'axios';
import { config } from '@/config/env';
import { TIMEOUTS } from '@/config/constants';
import logger from '@/utils/logger';

const api = axios.create({
  baseURL: config.apiUrl, // Usar URL de API desde config
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || String(TIMEOUTS.API_REQUEST)),
  withCredentials: true, // Permitir cookies para CSRF
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para obtener token de forma segura
const getToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return localStorage.getItem('token');
  } catch (storageError) {
    // Error accessing localStorage (puede estar bloqueado por privacidad)
    logger.error('Error accessing localStorage:', {
      error: storageError instanceof Error ? storageError.message : 'Unknown error'
    });
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

    // Log de interceptor para debugging
    logger.debug('Axios interceptor:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      isPublicRoute
    });

    if (token && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
      logger.debug('Token added to request');
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
      logger.error('Invalid error object');
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Error desconocido';

    // Log de errores (solo errores críticos)
    if (status && status >= 500) {
      logger.error('Server error:', { status, message, url: error.config?.url });
    }

    // Manejo específico de errores
    switch (status) {
      case 401:
        // Error de autenticación - limpiar tokens y redirigir
        logger.warn('Authentication error:', {
          message,
          url: error.config?.url,
          hasToken: !!getToken(),
        });

        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        break;

      case 403:
        logger.warn('Authorization error:', { message });
        break;

      case 404:
        logger.debug('Resource not found:', { url: error.config?.url });
        break;

      case 429:
        logger.warn('Rate limit exceeded');
        break;

      case 500:
      case 502:
      case 503:
        logger.error('Server error:', { status, message });
        break;

      default:
        if (status && status >= 400) {
          logger.debug('Client error:', { status, message });
        }
    }

    return Promise.reject(error);
  }
);

export default api;
