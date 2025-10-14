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
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Sidebar visible durante carga */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:z-40">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 px-6 pb-4 shadow-xl">
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
        <div className="lg:pl-72">
          <main className="py-4 sm:py-6 pb-20 lg:pb-6">
            <div className="mx-auto max-w-none px-3 sm:px-4 lg:px-8">
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Verificando permisos de administrador...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">CircleSfera</span>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Admin</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-xl
        `}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-gray-100 text-lg">CircleSfera</h1>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Panel Admin</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10">
          <div className="flex items-center space-x-3">
            {user.avatar ? (
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={`Avatar de ${user.username}`}
                  className="w-12 h-12 rounded-xl object-cover shadow-lg border-2 border-white dark:border-gray-700"
                  onError={(e) => {
                    // Fallback a iniciales si la imagen falla
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                          ${user.username?.[0]?.toUpperCase() || 'A'}
                        </div>
                      `
                    }
                  }}
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-700 ${user.role === 'admin' ? 'bg-red-500' : user.role === 'moderator' ? 'bg-blue-500' : 'bg-green-500'} shadow-sm`}></div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {user.username?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-700 ${user.role === 'admin' ? 'bg-red-500' : user.role === 'moderator' ? 'bg-blue-500' : 'bg-green-500'} shadow-sm`}></div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">
                {user.displayName || user.username}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <div className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-red-500' : user.role === 'moderator' ? 'bg-blue-500' : 'bg-green-500'} shadow-sm`}></div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium capitalize">
                  {user.role === 'admin' ? 'Administrador' : user.role === 'moderator' ? 'Moderador' : 'Usuario'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = typeof window !== 'undefined' && window.location.pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:shadow-md'
                  }
                `}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false)
                  }
                }}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-white/80 animate-pulse"></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/10">
          <Link
            href="/feed"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 mb-3 group"
          >
            <Home className="w-5 h-5 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            <span className="font-medium">Volver al Inicio</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50/80 dark:hover:bg-red-900/20 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-700" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        <main className="py-4 sm:py-6 pb-20 lg:pb-6">
          <div className="mx-auto max-w-none px-3 sm:px-4 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

