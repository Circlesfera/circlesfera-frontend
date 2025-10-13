'use client'

import { useAuth } from '@/features/auth/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  BarChart3,
  Flag,
  Users,
  Shield,
  Home,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    // Verificar si el usuario es admin o moderator
    if (!loading && user) {
      const isAdminOrModerator = user.role === 'admin' || user.role === 'moderator'

      if (!isAdminOrModerator) {
        // Si no es admin ni moderator, redirigir al feed
        router.push('/feed')
      }
    }

    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 dark:from-gray-900 to-gray-100">
        {/* Sidebar visible durante carga */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:z-40">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 dark:bg-gray-900/80 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 px-6 pb-4 shadow-xl">
            <div className="flex h-16 shrink-0 items-center">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="font-bold text-gray-900 dark:text-gray-100">CircleSfera</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Panel Admin</p>
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Cargando...</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Contenido principal con loading */}
        <main className="lg:ml-64 min-h-screen flex items-start justify-start">
          <div className="max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8">
            <div className="pt-20">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 font-medium text-lg">Verificando permisos de administrador...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Reportes', href: '/admin/reports', icon: Flag },
    { name: 'Estadísticas', href: '/admin/stats', icon: BarChart3 },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Configuración', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 dark:from-gray-900 to-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-gray-900 dark:text-gray-100">Panel Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 w-64 bg-white dark:bg-gray-900 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 dark:border-gray-700
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="font-bold text-gray-900 dark:text-gray-100">CircleSfera</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Panel Admin</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {user.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {user.username}
              </p>
              <p className="text-xs text-blue-600 font-medium capitalize">
                {user.role === 'admin' ? 'Administrador' : user.role === 'moderator' ? 'Moderador' : 'Usuario'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = typeof window !== 'undefined' && window.location.pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all
                  ${isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 dark:text-gray-300 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800'
                  }
                `}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false)
                  }
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/feed"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 transition-all mb-2"
          >
            <Home className="w-5 h-5" />
            <span>Volver al Inicio</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="transition-all duration-300 pt-16 lg:pt-0 lg:ml-64 min-h-screen">
        <div className="max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

