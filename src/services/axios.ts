import axios, { AxiosError, AxiosResponse } from 'axios';
import { config } from '@/config/env';
import { TIMEOUTS } from '@/config/constants';

const api = axios.create({
  baseURL: config.apiUrl, // Usar URL de API desde config
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || String(TIMEOUTS.API_REQUEST)),
  withCredentials: true, // Permitir cookies para CSRF
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log de inicialización para debug - SIEMPRE mostrar en desarrollo

// Función para obtener token de forma segura
const getToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return localStorage.getItem('token');
  } catch (storageError) {
    // Error accessing localStorage (puede estar bloqueado por privacidad)
    console.error('Error accessing localStorage:', {
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

    } else if (isPublicRoute) {

    } else {

    }

    // Verificar que el header se configuró correctamente DESPUÉS de configurarlo
    const authHeader = config.headers.Authorization;
    if (authHeader && typeof authHeader === 'string') {
      console.log('🔐 Header Authorization configurado:', authHeader.substring(0, 30) + '...');
    } else {

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

      return Promise.reject(error);
    }

    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Error desconocido';

    // Log de errores en desarrollo (solo para errores críticos)
    if (process.env.NODE_ENV === 'development' && status && status >= 500) {

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

        break;

      case 404:
        // Recurso no encontrado

        break;

      case 429:
        // Rate limit excedido

        break;

      case 500:
        // Error interno del servidor

        break;

      default:
        if (status && status >= 500) {

        } else if (status && status >= 400) {

        }
    }

    return Promise.reject(error);
  }
);

export default api;
