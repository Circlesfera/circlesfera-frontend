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
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 font-medium">Cargando estadísticas reales del sistema...</p>
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
        return 'bg-gray-50 dark:bg-gray-8000'
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
    <div className="max-w-6xl mx-auto mt-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">
              Dashboard de Moderación
            </h1>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Gestiona reportes, usuarios y contenido de CircleSfera
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Sistema Activo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            const colorClasses: Record<string, string> = {
              blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
              yellow: 'bg-gradient-to-r from-yellow-500 to-orange-500',
              green: 'bg-gradient-to-r from-green-500 to-emerald-600',
              purple: 'bg-gradient-to-r from-purple-500 to-pink-600',
            }

            return (
              <Link
                key={stat.name}
                href={stat.href}
                className="group bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl ${colorClasses[stat.color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  {stat.change && (
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${stat.changeType === 'increase'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                      }`}>
                      {stat.change}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                  {stat.name}
                </h3>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      {stat.subtitle}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100">Acciones Rápidas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/reports?status=pending"
            className="group bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Flag className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">Ver Reportes Pendientes</h3>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm mb-4">
              Revisa reportes que requieren atención inmediata
            </p>
            <div className="flex items-center justify-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
              <span>Ver Reportes</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/admin/stats"
            className="group bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">Ver Estadísticas</h3>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm mb-4">
              Análisis detallado del rendimiento de la plataforma
            </p>
            <div className="flex items-center justify-center text-purple-600 text-sm font-medium group-hover:text-purple-700">
              <span>Ver Estadísticas</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="group bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">Gestionar Usuarios</h3>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm mb-4">
              Administra roles, permisos y cuentas de usuario
            </p>
            <div className="flex items-center justify-center text-green-600 text-sm font-medium group-hover:text-green-700">
              <span>Gestionar</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* System Overview */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <Activity className="w-6 h-6 text-green-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100">Resumen del Sistema</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500">Total de Usuarios</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100">{stats.users.total.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center text-blue-600 text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
              <span>{stats.users.new24h} nuevos en 24h</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500">Contenido Total</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100">
                  {(stats.content.posts + stats.content.reels).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center text-purple-600 text-sm">
              <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
              <span>{stats.content.posts24h + stats.content.reels24h} nuevos en 24h</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500">Transmisiones Activas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100">{stats.activity.liveStreams}</p>
              </div>
            </div>
            <div className="flex items-center text-green-600 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
              <span>En vivo ahora</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Activity className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100">Actividad Reciente del Sistema</h2>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar</span>
          </button>
        </div>
        <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">

          {activities.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <Activity className="w-8 h-8 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-1">Sin actividad reciente</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                Las acciones del sistema aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map((activity, index) => (
                <div
                  key={`${activity.type}-${activity.relatedId}-${index}`}
                  className="group flex items-center gap-3 p-3.5 rounded-lg bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-transparent hover:border-blue-200"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${getSeverityColor(activity.severity)} shadow-md flex-shrink-0`}></div>
                  <div className="text-2xl flex-shrink-0">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 group-hover:text-blue-900 transition-colors truncate">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 flex items-center gap-2 mt-0.5">
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
                      className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium text-xs transition-colors shadow-sm dark:shadow-gray-900/50 hover:shadow whitespace-nowrap flex-shrink-0"
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
    </div>
  )
}

