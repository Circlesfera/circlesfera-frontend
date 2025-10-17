/**
 * Auth Service - Frontend
 * Servicio para manejar operaciones de autenticación
 */

import api from '../../../services/api'
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  AuthTokens,
  // PasswordResetRequest,
  PasswordResetData,
  ApiResponse
} from '../types'

export class AuthService {
  private readonly baseUrl = '/api/auth'

  /**
   * Iniciar sesión
   * @param credentials - Credenciales de login
   * @returns Promise con respuesta de autenticación
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(
        `${this.baseUrl}/login`,
        credentials
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error en el login')
      }

      // Guardar tokens en localStorage
      if (response.data.data?.tokens) {
        this.setTokens(response.data.data.tokens)
      }

      return response.data.data!
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Registrar nuevo usuario
   * @param data - Datos de registro
   * @returns Promise con respuesta de autenticación
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const formData = new FormData()

      // Agregar campos básicos
      formData.append('username', data.username)
      formData.append('email', data.email)
      formData.append('password', data.password)
      formData.append('fullName', data.fullName)

      if (data.bio) {
        formData.append('bio', data.bio)
      }

      if (data.avatar) {
        formData.append('avatar', data.avatar)
      }

      formData.append('acceptTerms', data.acceptTerms.toString())

      const response = await api.post<ApiResponse<AuthResponse>>(
        `${this.baseUrl}/register`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error en el registro')
      }

      // Guardar tokens en localStorage
      if (response.data.data?.tokens) {
        this.setTokens(response.data.data.tokens)
      }

      return response.data.data!
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Cerrar sesión
   * @returns Promise<void>
   */
  async logout(): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/logout`)
    } catch (error) {
      // Continuar con logout local aunque falle la llamada al servidor
      console.warn('Error en logout del servidor:', error)
    } finally {
      // Limpiar tokens locales
      this.clearTokens()
    }
  }

  /**
   * Refrescar token de acceso
   * @returns Promise con nuevos tokens
   */
  async refreshToken(): Promise<AuthTokens> {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible')
      }

      const response = await api.post<ApiResponse<{ tokens: AuthTokens }>>(
        `${this.baseUrl}/refresh`,
        { refreshToken }
      )

      if (!response.data.success || !response.data.data?.tokens) {
        throw new Error('Error refrescando token')
      }

      // Actualizar tokens
      this.setTokens(response.data.data.tokens)

      return response.data.data.tokens
    } catch (error: any) {
      // Si falla el refresh, limpiar tokens
      this.clearTokens()
      throw this.handleAuthError(error)
    }
  }

  /**
   * Obtener perfil del usuario actual
   * @returns Promise con datos del usuario
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(`${this.baseUrl}/profile`)

      if (!response.data.success || !response.data.data) {
        throw new Error('Error obteniendo perfil del usuario')
      }

      return response.data.data
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Actualizar perfil del usuario
   * @param data - Datos a actualizar
   * @returns Promise con usuario actualizado
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value)
          } else if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value))
          } else {
            formData.append(key, value.toString())
          }
        }
      })

      const response = await api.put<ApiResponse<User>>(
        `${this.baseUrl}/profile`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error actualizando perfil')
      }

      return response.data.data
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Cambiar contraseña
   * @param currentPassword - Contraseña actual
   * @param newPassword - Nueva contraseña
   * @returns Promise<void>
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await api.put<ApiResponse>(
        `${this.baseUrl}/change-password`,
        {
          currentPassword,
          newPassword
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error cambiando contraseña')
      }
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Solicitar reset de contraseña
   * @param email - Email del usuario
   * @returns Promise<void>
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await api.post<ApiResponse>(
        `${this.baseUrl}/forgot-password`,
        { email }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error solicitando reset de contraseña')
      }
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Resetear contraseña
   * @param data - Datos para resetear contraseña
   * @returns Promise<void>
   */
  async resetPassword(data: PasswordResetData): Promise<void> {
    try {
      const response = await api.post<ApiResponse>(
        `${this.baseUrl}/reset-password`,
        data
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error reseteando contraseña')
      }
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Verificar si el usuario está autenticado
   * @returns boolean
   */
  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken()
    const refreshToken = this.getRefreshToken()

    if (!accessToken || !refreshToken) {
      return false
    }

    // Verificar si el token no ha expirado
    try {
      const tokenData = this.parseJWT(accessToken)
      const currentTime = Date.now() / 1000

      return tokenData.exp > currentTime
    } catch {
      return false
    }
  }

  /**
   * Obtener token de acceso
   * @returns string | null
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  /**
   * Obtener refresh token
   * @returns string | null
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken')
  }

  /**
   * Guardar tokens en localStorage
   * @param tokens - Tokens de autenticación
   */
  private setTokens(tokens: AuthTokens): void {
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    localStorage.setItem('tokenExpiresIn', tokens.expiresIn.toString())
  }

  /**
   * Limpiar tokens del localStorage
   */
  private clearTokens(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('tokenExpiresIn')
  }

  /**
   * Parsear JWT token
   * @param token - JWT token
   * @returns object con payload del token
   */
  private parseJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1]
      if (!base64Url) {
        throw new Error('Invalid token format')
      }
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch {
      throw new Error('Token inválido')
    }
  }

  /**
   * Manejar errores de autenticación
   * @param error - Error capturado
   * @returns Error procesado
   */
  private handleAuthError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message)
    }

    if (error.response?.status === 401) {
      // Token expirado o inválido
      this.clearTokens()
      return new Error('Sesión expirada. Por favor, inicia sesión nuevamente.')
    }

    if (error.response?.status === 403) {
      return new Error('No tienes permisos para realizar esta acción.')
    }

    if (error.response?.status >= 500) {
      return new Error('Error del servidor. Por favor, intenta más tarde.')
    }

    return new Error(error.message || 'Error de autenticación')
  }
}

// Instancia singleton del servicio
export const authService = new AuthService()
