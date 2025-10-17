import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { authService } from './authService'

// Configuración base de axios
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

// Crear instancia de axios
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requests - agregar token de autorización
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses - manejar errores y refresh token
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = authService.getRefreshToken()
        if (refreshToken) {
          const newTokens = await authService.refreshToken(refreshToken)

          // Actualizar el header de autorización
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`

          // Reintentar la request original
          return axiosInstance(originalRequest)
        }
      } catch (refreshError) {
        // Si el refresh falla, redirigir al login
        authService.clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Para otros errores, extraer mensaje del servidor si está disponible
    if (error.response?.data?.message) {
      error.message = error.response.data.message
    }

    return Promise.reject(error)
  }
)

export default axiosInstance

// Funciones helper para requests comunes
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    axiosInstance.get(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    axiosInstance.post(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    axiosInstance.put(url, data, config),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    axiosInstance.patch(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    axiosInstance.delete(url, config),
}

// Funciones específicas para uploads
export const uploadFile = async (url: string, file: File, onProgress?: (progress: number) => void) => {
  const formData = new FormData()
  formData.append('file', file)

  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    },
  }

  return axiosInstance.post(url, formData, config)
}

export const uploadMultipleFiles = async (
  url: string,
  files: File[],
  onProgress?: (progress: number) => void
) => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append(`files`, file)
  })

  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    },
  }

  return axiosInstance.post(url, formData, config)
}

export { axiosInstance as axios }
