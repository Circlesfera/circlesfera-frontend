'use client'

import { useEffect, useState } from 'react'
import { Flag, Users, AlertTriangle, CheckCircle, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'
import { getDashboardStats, DashboardStats, getRecentActivity, Activity as ActivityType } from '@/services/adminService'
import logger from '@/utils/logger'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Cargar estadísticas y actividad en paralelo
      const [statsResponse, activityResponse] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(10)
      ])

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data)
      }

      if (activityResponse.success && activityResponse.data) {
        setActivities(activityResponse.data)
      }

      setLoading(false)
    } catch (err) {
      logger.error('Error fetching dashboard data:', err)
      setError('Error al cargar datos del dashboard')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-start justify-start min-h-[60vh] pt-20">
        <div className="text-left">
          <Activity className="w-12 h-12 text-blue-500 animate-pulse mb-4" />
          <p className="text-gray-600 font-medium">Cargando estadísticas reales del sistema...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 rounded-xl border border-red-200 p-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700">{error || 'No se pudieron cargar las estadísticas'}</p>
          </div>
        </div>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Reintentar
        </button>
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'report':
        return '🚩'
      case 'user_join':
        return '👤'
      case 'content_post':
        return '📷'
      case 'content_reel':
        return '🎬'
      case 'live_stream':
        return '📡'
      default:
        return '📋'
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const activityDate = new Date(timestamp)
    const diffMs = now.getTime() - activityDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora mismo'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`

    return activityDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    })
  }

  const statCards = [
    {
      name: 'Reportes Pendientes',
      value: stats.reports.pending,
      change: stats.reports.pending > 0 ? `${stats.reports.trend}% del total` : '0%',
      changeType: stats.reports.pending > 5 ? 'increase' : 'normal',
      icon: Flag,
      color: 'blue',
      href: '/admin/reports?status=pending',
    },
    {
      name: 'Total Reportes',
      value: stats.reports.total,
      subtitle: `${stats.reports.underReview} en revisión`,
      icon: AlertTriangle,
      color: 'yellow',
      href: '/admin/reports',
    },
    {
      name: 'Reportes Resueltos',
      value: stats.reports.resolved,
      subtitle: `${stats.reports.rejected} rechazados`,
      icon: CheckCircle,
      color: 'green',
      href: '/admin/reports?status=resolved',
    },
    {
      name: 'Usuarios Activos',
      value: stats.users.active,
      subtitle: `${stats.users.activePercentage}% de ${stats.users.total}`,
      icon: Users,
      color: 'purple',
      href: '/admin/users',
    },
  ]

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            Dashboard de Moderación
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Gestiona reportes, usuarios y contenido de CircleSfera
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium text-green-700">Sistema Activo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Diseño Moderno Mejorado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          const colorClasses: Record<string, string> = {
            blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
            yellow: 'bg-gradient-to-br from-yellow-500 to-orange-500',
            green: 'bg-gradient-to-br from-green-500 to-emerald-600',
            purple: 'bg-gradient-to-br from-purple-500 to-pink-600',
          }
          const hoverClasses: Record<string, string> = {
            blue: 'hover:from-blue-600 hover:to-blue-700',
            yellow: 'hover:from-yellow-600 hover:to-orange-600',
            green: 'hover:from-green-600 hover:to-emerald-700',
            purple: 'hover:from-purple-600 hover:to-pink-700',
          }

          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative"
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-lg ${colorClasses[stat.color]} ${hoverClasses[stat.color]} flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-105`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.change && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.changeType === 'increase'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                      }`}>
                      {stat.change}
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {stat.name}
                </h3>
                <div className="flex items-baseline space-x-2">
                  <p className="text-3xl font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Acciones Rápidas
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/reports?status=pending"
            className="group relative flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-md overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative w-11 h-11 rounded-lg bg-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
              <Flag className="w-5 h-5 text-white" />
            </div>
            <div className="relative flex-1 min-w-0">
              <span className="font-semibold text-blue-900 block text-sm">Ver Reportes Pendientes</span>
              <span className="text-xs text-blue-700">Requieren atención</span>
            </div>
          </Link>

          <Link
            href="/admin/stats"
            className="group relative flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-md overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-700 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative w-11 h-11 rounded-lg bg-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="relative flex-1 min-w-0">
              <span className="font-semibold text-purple-900 block text-sm">Ver Estadísticas</span>
              <span className="text-xs text-purple-700">Análisis detallado</span>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="group relative flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-md overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-700 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative w-11 h-11 rounded-lg bg-green-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="relative flex-1 min-w-0">
              <span className="font-semibold text-green-900 block text-sm">Gestionar Usuarios</span>
              <span className="text-xs text-green-700">Roles y permisos</span>
            </div>
          </Link>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm font-medium opacity-90">Total de Usuarios</p>
            <Users className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-3xl sm:text-4xl font-bold mb-2">{stats.users.total.toLocaleString()}</p>
          <div className="flex items-center space-x-2 text-xs opacity-90">
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            <span>{stats.users.new24h} nuevos en 24h</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm font-medium opacity-90">Contenido Total</p>
            <Activity className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-3xl sm:text-4xl font-bold mb-2">
            {(stats.content.posts + stats.content.reels).toLocaleString()}
          </p>
          <div className="flex items-center space-x-2 text-xs opacity-90">
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            <span>{stats.content.posts24h + stats.content.reels24h} nuevos en 24h</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm font-medium opacity-90">Transmisiones Activas</p>
            <Activity className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-3xl sm:text-4xl font-bold mb-2">{stats.activity.liveStreams}</p>
          <div className="flex items-center space-x-2 text-xs opacity-90">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
            <span>En vivo ahora</span>
          </div>
        </div>
      </div>

      {/* Actividad Reciente - DATOS REALES */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Actividad Reciente del Sistema
            </h2>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors flex items-center space-x-2 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar</span>
          </button>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Sin actividad reciente</h3>
            <p className="text-sm text-gray-500">
              Las acciones del sistema aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((activity, index) => (
              <div
                key={`${activity.type}-${activity.relatedId}-${index}`}
                className="group flex items-center gap-3 p-3.5 rounded-lg bg-gray-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-transparent hover:border-blue-200"
              >
                <div className={`w-2.5 h-2.5 rounded-full ${getSeverityColor(activity.severity)} shadow-md flex-shrink-0`}></div>
                <div className="text-2xl flex-shrink-0">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-900 transition-colors truncate">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    <span>{formatTimeAgo(activity.timestamp)}</span>
                    {activity.user && (
                      <>
                        <span>•</span>
                        <span className="font-medium truncate">{activity.user}</span>
                      </>
                    )}
                  </p>
                </div>
                {activity.type === 'report' && (
                  <Link
                    href={`/admin/reports/${activity.relatedId}`}
                    className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium text-xs transition-colors shadow-sm hover:shadow whitespace-nowrap flex-shrink-0"
                  >
                    Ver Detalle
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

