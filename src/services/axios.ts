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
    if (storageError instanceof Error) {
      logger.error('Error accessing localStorage:', {
        message: storageError.message,
        name: storageError.name
      });
    } else {
      logger.error('Error accessing localStorage:', {
        type: typeof storageError,
        value: String(storageError)
      });
    }
    return null;
  }
};

// Función para obtener token CSRF de las cookies
const getCsrfToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Leer cookie XSRF-TOKEN (enviada por el backend)
    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));

    if (csrfCookie) {
      return csrfCookie.split('=')[1];
    }

    return null;
  } catch (error) {
    logger.error('Error reading CSRF token from cookie:', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
};

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    const csrfToken = getCsrfToken();

    // Rutas que no requieren token de autorización
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));

    // Log de interceptor para debugging
    logger.debug('Axios interceptor:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      hasCsrfToken: !!csrfToken,
      isPublicRoute
    });

    // Agregar Authorization token
    if (token && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
      logger.debug('Token added to request');
    }

    // Agregar CSRF token para peticiones mutativas (POST, PUT, DELETE, PATCH)
    const mutativeMethods = ['post', 'put', 'delete', 'patch'];
    if (config.method && mutativeMethods.includes(config.method.toLowerCase())) {
      if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken;
        logger.debug('CSRF token added to request');
      } else {
        logger.warn('CSRF token not available for mutative request', {
          method: config.method,
          url: config.url
        });
      }
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
  async (error: AxiosError<{ message?: string }>) => {
    // Validar que el error tiene la estructura esperada
    if (!error || typeof error !== 'object') {
      logger.error('Invalid error object:', {
        type: typeof error,
        value: String(error)
      });
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

          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }
        }
        break;

      case 403:
        // Error CSRF - no intentar recursión infinita
        if (message.includes('CSRF') || message.includes('csrf')) {
          logger.warn('CSRF error detected:', {
            message,
            url: error.config?.url
          });

          // Solo intentar refrescar si no es una petición al endpoint de CSRF
          if (error.config?.url && !error.config.url.includes('/auth/csrf-token')) {
            try {
              // Crear nueva instancia de axios para evitar recursión
              const csrfResponse = await fetch(`${config.apiUrl}/auth/csrf-token`, {
                method: 'GET',
                credentials: 'include'
              });

              if (csrfResponse.ok) {
                logger.info('CSRF token refreshed successfully');
                // No reintentar automáticamente, dejar que el usuario reintente
              }
            } catch (csrfError) {
              logger.error('Failed to refresh CSRF token:', csrfError);
            }
          }
        } else {
          logger.warn('Authorization error:', { message });
        }
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
