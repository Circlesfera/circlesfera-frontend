/**
 * useAuth Hook - Frontend
 * Hook personalizado para manejar el estado de autenticación
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { authService } from '../services/authService'
import type {
  User,
  AuthState,
  LoginCredentials,
  RegisterData,
  // AuthTokens,
  AuthError
} from '../types'

// Context para compartir estado de autenticación
const AuthContext = createContext<AuthState | null>(null)

/**
 * Hook para acceder al contexto de autenticación
 * @returns AuthState
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de AuthProvider')
  }
  return context
}

/**
 * Hook principal para manejar autenticación
 * @returns Objeto con estado y métodos de autenticación
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    tokens: null
  })

  /**
   * Inicializar estado de autenticación
   */
  const initializeAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      // Verificar si hay tokens válidos
      if (authService.isAuthenticated()) {
        // Obtener usuario actual
        const user = await authService.getCurrentUser()
        const accessToken = authService.getAccessToken()
        const refreshToken = authService.getRefreshToken()

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          tokens: accessToken && refreshToken ? {
            accessToken,
            refreshToken,
            expiresIn: parseInt(localStorage.getItem('tokenExpiresIn') || '0')
          } : null
        })
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          tokens: null
        })
      }
    } catch (error: unknown) {
      console.error('Error inicializando autenticación:', error)
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        tokens: null
      })
    }
  }, [])

  /**
   * Iniciar sesión
   * @param credentials - Credenciales de login
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      const response = await authService.login(credentials)

      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        tokens: response.tokens
      })

      return response
    } catch (error: unknown) {
      const authError = error as AuthError
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.message,
        isAuthenticated: false,
        user: null,
        tokens: null
      }))
      throw error
    }
  }, [])

  /**
   * Registrar nuevo usuario
   * @param data - Datos de registro
   */
  const register = useCallback(async (data: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      const response = await authService.register(data)

      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        tokens: response.tokens
      })

      return response
    } catch (error: unknown) {
      const authError = error as AuthError
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.message,
        isAuthenticated: false,
        user: null,
        tokens: null
      }))
      throw error
    }
  }, [])

  /**
   * Cerrar sesión
   */
  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      await authService.logout()

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        tokens: null
      })
    } catch (error: unknown) {
      console.error('Error en logout:', error)
      // Continuar con logout local aunque falle
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        tokens: null
      })
    }
  }, [])

  /**
   * Refrescar token de acceso
   */
  const refreshToken = useCallback(async () => {
    try {
      const tokens = await authService.refreshToken()

      setAuthState(prev => ({
        ...prev,
        tokens,
        error: null
      }))

      return tokens
    } catch (error: unknown) {
      console.error('Error refrescando token:', error)

      // Si falla el refresh, hacer logout
      await logout()
      throw error
    }
  }, [logout])

  /**
   * Actualizar perfil del usuario
   * @param data - Datos a actualizar
   */
  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      const updatedUser = await authService.updateProfile(data)

      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
        error: null
      }))

      return updatedUser
    } catch (error: unknown) {
      const authError = error as AuthError
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.message
      }))
      throw error
    }
  }, [])

  /**
   * Cambiar contraseña
   * @param currentPassword - Contraseña actual
   * @param newPassword - Nueva contraseña
   */
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      await authService.changePassword(currentPassword, newPassword)

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }))
    } catch (error: unknown) {
      const authError = error as AuthError
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.message
      }))
      throw error
    }
  }, [])

  /**
   * Solicitar reset de contraseña
   * @param email - Email del usuario
   */
  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      await authService.requestPasswordReset(email)

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }))
    } catch (error: unknown) {
      const authError = error as AuthError
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.message
      }))
      throw error
    }
  }, [])

  /**
   * Resetear contraseña
   * @param data - Datos para resetear contraseña
   */
  const resetPassword = useCallback(async (data: { token: string; password: string; confirmPassword: string }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      await authService.resetPassword(data)

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }))
    } catch (error: unknown) {
      const authError = error as AuthError
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.message
      }))
      throw error
    }
  }, [])

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }))
  }, [])

  /**
   * Verificar autenticación al montar el componente
   */
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  /**
   * Configurar interceptor para manejar tokens expirados
   */
  useEffect(() => {
    // const handleTokenExpiration = async () => {
    //   try {
    //     await refreshToken()
    //   } catch (error) {
    //     // Token refresh falló, hacer logout
    //     await logout()
    //   }
    // }

    // Aquí podrías configurar un interceptor de axios
    // para manejar automáticamente tokens expirados
  }, [refreshToken, logout])

  return {
    // Estado
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    tokens: authState.tokens,

    // Métodos
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    clearError,

    // Context para componentes hijos
    AuthContext
  }
}

/**
 * Hook para verificar si el usuario tiene un rol específico
 * @param requiredRole - Rol requerido
 * @returns boolean
 */
export const useRole = (requiredRole: string) => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return false
  }

  return user.role === requiredRole || user.role === 'admin'
}

/**
 * Hook para verificar si el usuario es admin
 * @returns boolean
 */
export const useIsAdmin = () => {
  return useRole('admin')
}

/**
 * Hook para verificar si el usuario puede acceder a una ruta
 * @param requiredRole - Rol requerido (opcional)
 * @returns boolean
 */
export const useCanAccess = (requiredRole?: string) => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || !user) {
    return false
  }

  if (!requiredRole) {
    return true
  }

  return user.role === requiredRole || user.role === 'admin'
}
