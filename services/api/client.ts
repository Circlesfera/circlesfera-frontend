import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { clientEnv } from '@/lib/env';
import { sessionStore } from '@/store/session';
import { refreshSession } from './auth';

/**
 * Cliente HTTP basado en Axios usado para consumir la API de CircleSfera.
 * Incluye envío automático de tokens, refresh automático y soporte para cookies httpOnly.
 */
export const apiClient = axios.create({
  baseURL: clientEnv.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 12_000
});

// Flag para evitar múltiples refreshes simultáneos
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

apiClient.interceptors.request.use((config) => {
  const token = sessionStore.getState().accessToken;
  const isHydrated = sessionStore.getState().isHydrated;
  
  // Solo agregar token si existe y la sesión está hidratada
  // El refresh automático se encarga de mantener el token actualizado
  if (token && isHydrated) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Para rutas protegidas (excepto auth), rechazar la petición si no hay token después de hidratar
  const isProtectedRoute = !config.url?.includes('/auth/') && 
                           !config.url?.includes('/health') &&
                           !config.url?.includes('/public');
  
  if (isProtectedRoute && isHydrated && !token) {
    // No enviar la petición si no hay token para rutas protegidas
    return Promise.reject(new Error('No hay token de autenticación disponible'));
  }
  
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Si es un error 401 y no es un endpoint de auth y no hemos intentado refrescar
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const isAuthEndpoint = originalRequest.url?.includes('/auth/');
      
      // No intentar refresh para endpoints de auth (excepto refresh mismo)
      if (isAuthEndpoint && !originalRequest.url?.includes('/auth/refresh')) {
        // Si falla login/register/logout, no intentar refresh
        if (originalRequest.url?.includes('/auth/login') || 
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/logout')) {
          return Promise.reject(error);
        }
      }
      
      // Si ya estamos refrescando, poner esta petición en cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token as string}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Intentar refrescar el token
        const tokens = await refreshSession();
        
        // Actualizar el store con el nuevo token
        sessionStore.setState({
          accessToken: tokens.accessToken,
          expiresAt: Date.now() + tokens.expiresIn * 1000
        });
        
        // Configurar refresh automático para el nuevo token
        import('@/lib/token-refresh').then(({ setupTokenRefresh }) => {
          setupTokenRefresh();
        });

        // Actualizar el header de la petición original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }

        // Procesar la cola de peticiones fallidas
        processQueue(null, tokens.accessToken);

        // Reintentar la petición original
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla, limpiar sesión y rechazar todas las peticiones en cola
        processQueue(refreshError as AxiosError, null);
        sessionStore.getState().clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

