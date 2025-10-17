/**
 * API Service - Frontend
 * Configuración centralizada de Axios para todas las llamadas a la API
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { config } from '@/config/env'
import { TIMEOUTS } from '@/config/constants'
// import logger from '@/utils/logger'

// Configuración base de la API
const API_BASE_URL = config.apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Crear instancia de Axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || String(TIMEOUTS.API_REQUEST)),
  withCredentials: true, // Permitir cookies para CSRF
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage directamente para evitar dependencia circular
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Intentar refrescar el token
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refreshToken })
          const { accessToken } = response.data

          // Guardar nuevo token
          localStorage.setItem('access_token', accessToken)

          // Reintentar la petición original
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Si falla el refresh, limpiar tokens y redirigir al login
        console.error('Error refreshing token:', refreshError)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')

        // Redirigir al login si estamos en el cliente
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

// Funciones de utilidad para manejo de errores
interface ApiError {
  response?: {
    data?: { message?: string }
    status?: number
  }
  code?: string
  message?: string
}

export const handleApiError = (error: unknown): string => {
  if (error && typeof error === 'object') {
    const apiError = error as ApiError

    if (apiError.response?.data?.message) {
      return apiError.response.data.message
    }

    if (apiError.response?.status === 401) {
      return 'No tienes permisos para realizar esta acción'
    }

    if (apiError.response?.status === 403) {
      return 'Acceso denegado'
    }

    if (apiError.response?.status === 404) {
      return 'Recurso no encontrado'
    }

    if (apiError.response?.status === 422) {
      return 'Datos inválidos'
    }

    if (apiError.response?.status && apiError.response.status >= 500) {
      return 'Error del servidor. Por favor, intenta más tarde'
    }

    if (apiError.code === 'NETWORK_ERROR') {
      return 'Error de conexión. Verifica tu internet'
    }

    return apiError.message || 'Error desconocido'
  }

  return 'Error desconocido'
}

// Función para crear URLs con parámetros
export const createApiUrl = (endpoint: string, params?: Record<string, unknown>): string => {
  const url = new URL(endpoint, API_BASE_URL)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          url.searchParams.append(key, value.join(','))
        } else {
          url.searchParams.append(key, value.toString())
        }
      }
    })
  }

  return url.toString()
}

// Función para subir archivos con progreso
export const uploadWithProgress = async (
  endpoint: string,
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<AxiosResponse> => {
  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    }
  })
}

// Función para hacer peticiones con retry
export const apiWithRetry = async (
  requestFn: () => Promise<AxiosResponse>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<AxiosResponse> => {
  let lastError: unknown

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error: unknown) {
      lastError = error

      // No reintentar en errores 4xx (excepto 429)
      if (error && typeof error === 'object') {
        const apiError = error as ApiError
        if (apiError.response?.status && apiError.response.status >= 400 && apiError.response.status < 500 && apiError.response.status !== 429) {
          throw error
        }
      }

      // Esperar antes del siguiente intento
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }

  throw lastError
}

// Función para cancelar peticiones
export const createCancelToken = () => {
  return axios.CancelToken.source()
}

// Función para verificar si un error es de cancelación
export const isCancelError = (error: unknown): boolean => {
  return axios.isCancel(error)
}

// Función para crear petición con timeout personalizado
export const apiWithTimeout = async (
  config: AxiosRequestConfig,
  timeout: number = 10000
): Promise<AxiosResponse> => {
  return api({
    ...config,
    timeout
  })
}

// Función para hacer peticiones en lote
export const batchRequest = async <T>(
  requests: (() => Promise<T>)[]
): Promise<T[]> => {
  return Promise.all(requests.map(request => request()))
}

// Función para hacer peticiones secuenciales
export const sequentialRequest = async <T>(
  requests: (() => Promise<T>)[]
): Promise<T[]> => {
  const results: T[] = []

  for (const request of requests) {
    const result = await request()
    results.push(result)
  }

  return results
}

// Función para crear petición con cache
export const apiWithCache = async <T>(
  key: string,
  requestFn: () => Promise<T>,
  ttl: number = 300000 // 5 minutos por defecto
): Promise<T> => {
  // Verificar cache en localStorage
  const cached = localStorage.getItem(`api_cache_${key}`)
  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < ttl) {
      return data
    }
  }

  // Hacer petición
  const result = await requestFn()

  // Guardar en cache
  localStorage.setItem(`api_cache_${key}`, JSON.stringify({
    data: result,
    timestamp: Date.now()
  }))

  return result
}

// Función para limpiar cache
export const clearApiCache = (pattern?: string): void => {
  if (pattern) {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('api_cache_') && key.includes(pattern)) {
        localStorage.removeItem(key)
      }
    })
  } else {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('api_cache_')) {
        localStorage.removeItem(key)
      }
    })
  }
}

export default api
