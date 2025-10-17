/**
 * AuthProvider Component - Frontend
 * Proveedor de contexto para autenticación
 */

'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import type { AuthContextType, User, AuthTokens } from '../types'

// Crear contexto de autenticación
const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Provider de autenticación que envuelve la aplicación
 * @param children - Componentes hijos
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook para usar el contexto de autenticación
 * @returns AuthContextType
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de AuthProvider')
  }

  return context
}

/**
 * Componente de orden superior para proteger rutas
 * @param children - Componentes hijos
 * @param requiredRole - Rol requerido (opcional)
 * @param fallback - Componente a mostrar si no tiene acceso
 */
interface AuthGuardProps {
  children: ReactNode
  requiredRole?: string
  fallback?: ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRole,
  fallback = <div>No tienes permisos para acceder a esta página.</div>
}) => {
  const { isAuthenticated, user, isLoading } = useAuthContext()

  // Mostrar loading mientras se verifica autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Verificar autenticación
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Restringido
          </h2>
          <p className="text-gray-600 mb-6">
            Necesitas iniciar sesión para acceder a esta página.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    )
  }

  // Verificar rol si es requerido
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Componente para mostrar contenido solo a usuarios autenticados
 * @param children - Componentes hijos
 * @param fallback - Componente a mostrar si no está autenticado
 */
interface AuthenticatedOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

export const AuthenticatedOnly: React.FC<AuthenticatedOnlyProps> = ({
  children,
  fallback = null
}) => {
  const { isAuthenticated } = useAuthContext()

  if (!isAuthenticated) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Componente para mostrar contenido solo a usuarios no autenticados
 * @param children - Componentes hijos
 * @param fallback - Componente a mostrar si está autenticado
 */
interface GuestOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

export const GuestOnly: React.FC<GuestOnlyProps> = ({
  children,
  fallback = null
}) => {
  const { isAuthenticated } = useAuthContext()

  if (isAuthenticated) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Componente para mostrar contenido basado en rol
 * @param children - Componentes hijos
 * @param roles - Roles permitidos
 * @param fallback - Componente a mostrar si no tiene el rol
 */
interface RoleBasedProps {
  children: ReactNode
  roles: string[]
  fallback?: ReactNode
}

export const RoleBased: React.FC<RoleBasedProps> = ({
  children,
  roles,
  fallback = null
}) => {
  const { user, isAuthenticated } = useAuthContext()

  if (!isAuthenticated || !user || !roles.includes(user.role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Hook para obtener información del usuario actual
 * @returns User | null
 */
export const useCurrentUser = (): User | null => {
  const { user } = useAuthContext()
  return user
}

/**
 * Hook para verificar si el usuario tiene un rol específico
 * @param role - Rol a verificar
 * @returns boolean
 */
export const useHasRole = (role: string): boolean => {
  const { user, isAuthenticated } = useAuthContext()

  if (!isAuthenticated || !user) {
    return false
  }

  return user.role === role || user.role === 'admin'
}

/**
 * Hook para verificar si el usuario es admin
 * @returns boolean
 */
export const useIsAdmin = (): boolean => {
  return useHasRole('admin')
}

/**
 * Hook para obtener tokens de autenticación
 * @returns AuthTokens | null
 */
export const useTokens = (): AuthTokens | null => {
  const { tokens } = useAuthContext()
  return tokens
}

export default AuthProvider
