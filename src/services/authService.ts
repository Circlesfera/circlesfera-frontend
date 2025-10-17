import { User, AuthTokens, LoginCredentials, RegisterCredentials } from '@/types/auth'
import api from './axios'

class AuthService {
  private readonly TOKEN_KEY = 'circlesfera_token'
  private readonly REFRESH_TOKEN_KEY = 'circlesfera_refresh_token'

  // Métodos para manejar tokens
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.TOKEN_KEY)
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  getStoredTokens(): AuthTokens | null {
    const accessToken = this.getAccessToken()
    const refreshToken = this.getRefreshToken()

    if (accessToken && refreshToken) {
      return {
        accessToken,
        refreshToken
      }
    }

    return null
  }

  setStoredTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return

    localStorage.setItem(this.TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken)
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  // Métodos de autenticación
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const response = await api.post('/auth/login', credentials)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión')
    }
  }

  async register(credentials: RegisterCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const response = await api.post('/auth/register', credentials)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrarse')
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await api.get('/auth/profile')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener perfil')
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put('/auth/profile', userData)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar perfil')
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const response = await api.post('/auth/refresh', { refreshToken })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al refrescar token')
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken()
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken })
      }
    } catch (error) {
      // Ignorar errores de logout, siempre limpiar tokens localmente
      console.error('Error al cerrar sesión:', error)
    } finally {
      this.clearTokens()
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await api.post('/auth/forgot-password', { email })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar email de recuperación')
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/reset-password', { token, newPassword })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al restablecer contraseña')
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      await api.post('/auth/verify-email', { token })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al verificar email')
    }
  }

  async resendVerificationEmail(): Promise<void> {
    try {
      await api.post('/auth/resend-verification')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al reenviar email de verificación')
    }
  }

  // Métodos de utilidad
  isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.')
      if (parts.length !== 3 || !parts[1]) return true

      const payload = JSON.parse(atob(parts[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch (error) {
      return true
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    return token !== null && !this.isTokenExpired(token)
  }

  getUserId(): string | null {
    try {
      const token = this.getAccessToken()
      if (!token) return null

      const parts = token.split('.')
      if (parts.length !== 3 || !parts[1]) return null

      const payload = JSON.parse(atob(parts[1]))
      return payload.userId || payload.id
    } catch (error) {
      return null
    }
  }
}

// Exportar instancia singleton
export const authService = new AuthService()
export default authService
