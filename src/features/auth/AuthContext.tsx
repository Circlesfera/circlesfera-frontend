'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, AuthTokens, LoginCredentials, RegisterCredentials } from '@/types/auth'
import { authService } from '@/services/authService'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  tokens: AuthTokens | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)

  const isAuthenticated = !!user && !!tokens?.accessToken

  // Inicializar autenticación al cargar la app
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      setIsLoading(true)

      // Verificar si hay tokens almacenados
      const storedTokens = authService.getStoredTokens()
      if (storedTokens) {
        setTokens(storedTokens)

        // Verificar si el token es válido
        const userData = await authService.getProfile()
        setUser(userData)
      }
    } catch (error) {
      console.error('Error inicializando auth:', error)
      // Si hay error, limpiar tokens almacenados
      authService.clearTokens()
      setTokens(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await authService.login(credentials)
      setTokens(response.tokens)
      setUser(response.user)

      // Almacenar tokens
      authService.setStoredTokens(response.tokens)
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await authService.register(credentials)
      setTokens(response.tokens)
      setUser(response.user)

      // Almacenar tokens
      authService.setStoredTokens(response.tokens)
    } catch (error: any) {
      setError(error.message || 'Error al registrarse')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    try {
      authService.logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      setUser(null)
      setTokens(null)
      setError(null)
      authService.clearTokens()
    }
  }

  const refreshToken = async () => {
    try {
      if (!tokens?.refreshToken) {
        throw new Error('No hay refresh token disponible')
      }

      const newTokens = await authService.refreshToken(tokens.refreshToken)
      setTokens(newTokens)
      authService.setStoredTokens(newTokens)
    } catch (error) {
      console.error('Error refrescando token:', error)
      logout()
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    tokens,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

// Exportar el contexto para compatibilidad
export { AuthContext }
