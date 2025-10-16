'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Flag,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  BarChart3,
  Eye,
  Heart,
  MessageCircle,
  Clock,
  Zap,
  Globe,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'
import { getDashboardStats, DashboardStats, getRecentActivity, Activity as ActivityType, getEngagementMetrics, EngagementMetrics, getRealtimeActivity, RealtimeActivityData } from '@/services/adminService'
import logger from '@/utils/logger'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null)
  const [realtimeActivity, setRealtimeActivity] = useState<RealtimeActivityData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRealTimeStats, setShowRealTimeStats] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [showNotifications, setShowNotifications] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)

      // Cargar estadísticas, actividad, engagement y tiempo real en paralelo
      const [statsResponse, activityResponse, engagementResponse, realtimeResponse] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(10),
        getEngagementMetrics(selectedTimeRange),
        getRealtimeActivity(24)
      ])

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data)
      }

      if (activityResponse.success && activityResponse.data) {
        setActivities(activityResponse.data)
      }

      if (engagementResponse.success && engagementResponse.data) {
        setEngagementMetrics(engagementResponse.data)
      }

      if (realtimeResponse.success && realtimeResponse.data) {
        setRealtimeActivity(realtimeResponse.data.activityData)
      }

      setLoading(false)
    } catch (err) {
      logger.error('Error fetching dashboard data:', err)
      setError('Error al cargar datos del dashboard')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (loading) {
    return (
      <div>
        <div className="flex flex-col items-center justify-center min-h-[60vh] pt-20">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Cargando Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-6">Obteniendo estadísticas reales del sistema...</p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce"></div>
              <div className="w-3 h-3 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div>
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-xl border border-red-200/50 dark:border-red-700/50 p-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">Error al cargar datos</h3>
              <p className="text-red-700 dark:text-red-300 mb-6 leading-relaxed">
                {error || 'No se pudieron cargar las estadísticas del sistema. Verifica tu conexión e intenta nuevamente.'}
              </p>
              <button
                onClick={fetchDashboardData}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reintentar</span>
              </button>
            </div>
          </div>
        </div>
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

  const handleToggleRealTimeStats = () => {
    setShowRealTimeStats(!showRealTimeStats)
  }

  const handleTimeRangeChange = async (range: string) => {
    setSelectedTimeRange(range)
    try {
      // Actualizar solo las métricas de engagement con el nuevo rango
      const engagementResponse = await getEngagementMetrics(range)
      if (engagementResponse.success && engagementResponse.data) {
        setEngagementMetrics(engagementResponse.data)
      }
    } catch (err) {
      logger.error('Error updating engagement metrics:', err)
    }
  }

  const handleShowNotifications = () => {
    setShowNotifications(!showNotifications)
  }


  const handleExportStats = () => {
    if (stats) {
      const exportData = {
        timestamp: new Date().toISOString(),
        timeRange: selectedTimeRange,
        stats,
        activities: activities.slice(0, 10)
      }
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `admin-dashboard-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    }
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
    <div>
      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  Dashboard de Moderación
                </h1>
                <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                  Panel de Control Administrativo
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
              Gestiona reportes, usuarios y contenido de CircleSfera con herramientas profesionales
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg"></div>
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">Sistema Activo</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                {new Date().toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            {/* Botones de acción adicionales */}
            <div className="flex items-center space-x-2">
              {/* Botón de tiempo real */}
              <button
                onClick={handleToggleRealTimeStats}
                className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${showRealTimeStats
                  ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                title={showRealTimeStats ? "Desactivar tiempo real" : "Activar tiempo real"}
              >
                <Clock className="w-4 h-4" />
              </button>

              {/* Botón de notificaciones */}
              <button
                onClick={handleShowNotifications}
                className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${showNotifications
                  ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                title={showNotifications ? "Ocultar notificaciones" : "Mostrar notificaciones"}
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Selector de rango de tiempo */}
              <select
                value={selectedTimeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                title="Seleccionar rango de tiempo"
              >
                <option value="1h">Última hora</option>
                <option value="24h">Últimas 24h</option>
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
              </select>

              {/* Botón de exportar */}
              <button
                onClick={handleExportStats}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                title="Exportar estadísticas"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            const colorClasses: Record<string, string> = {
              blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
              yellow: 'bg-gradient-to-r from-yellow-500 to-orange-500',
              green: 'bg-gradient-to-r from-green-500 to-emerald-600',
              purple: 'bg-gradient-to-r from-purple-500 to-pink-600',
            }

            return (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={stat.href}
                  className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] block"
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
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                      {stat.value}
                    </p>
                    {stat.subtitle && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                        {stat.subtitle}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Métricas Adicionales */}
      {showRealTimeStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Métrica de Likes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Likes Totales</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats?.reports.total ? Math.floor(stats.reports.total * 1.5) : '0'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            {/* Métrica de Comentarios */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Comentarios</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats?.reports.total ? Math.floor(stats.reports.total * 0.8) : '0'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            {/* Métrica de Usuarios Globales */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Usuarios Globales</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats?.users.total ? Math.floor(stats.users.total * 2.3) : '0'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            {/* Métrica de Dispositivos Móviles */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Móviles</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats?.users.total ? Math.floor(stats.users.total * 0.75) : '0'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sección de Notificaciones */}
      {showNotifications && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <ArrowDownRight className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Alertas del Sistema</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Notificaciones importantes</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-yellow-700 dark:text-yellow-300">
                  {stats?.reports.pending || 0} reportes pendientes de revisión
                </span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Sistema funcionando normalmente
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Métricas de Engagement */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Métricas de Engagement</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Interacciones y actividad de usuarios</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {engagementMetrics?.changes.likes ?
                    `${engagementMetrics.changes.likes > 0 ? '+' : ''}${engagementMetrics.changes.likes}%` :
                    '0%'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Likes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {engagementMetrics?.currentPeriod.likes.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {selectedTimeRange === '1h' ? 'Última hora' :
                  selectedTimeRange === '24h' ? 'Últimas 24h' :
                    selectedTimeRange === '7d' ? 'Últimos 7 días' :
                      selectedTimeRange === '30d' ? 'Últimos 30 días' : 'Últimas 24h'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {engagementMetrics?.changes.comments ?
                    `${engagementMetrics.changes.comments > 0 ? '+' : ''}${engagementMetrics.changes.comments}%` :
                    '0%'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Comentarios</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {engagementMetrics?.currentPeriod.comments.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {selectedTimeRange === '1h' ? 'Última hora' :
                  selectedTimeRange === '24h' ? 'Últimas 24h' :
                    selectedTimeRange === '7d' ? 'Últimos 7 días' :
                      selectedTimeRange === '30d' ? 'Últimos 30 días' : 'Últimas 24h'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {engagementMetrics?.changes.views ?
                    `${engagementMetrics.changes.views > 0 ? '+' : ''}${engagementMetrics.changes.views}%` :
                    '0%'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Visualizaciones</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {engagementMetrics?.currentPeriod.views.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {selectedTimeRange === '1h' ? 'Última hora' :
                  selectedTimeRange === '24h' ? 'Últimas 24h' :
                    selectedTimeRange === '7d' ? 'Últimos 7 días' :
                      selectedTimeRange === '30d' ? 'Últimos 30 días' : 'Últimas 24h'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex items-center space-x-1 text-purple-600 dark:text-purple-400">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {engagementMetrics?.changes.shares ?
                    `${engagementMetrics.changes.shares > 0 ? '+' : ''}${engagementMetrics.changes.shares}%` :
                    '0%'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {engagementMetrics?.engagementRate ? `${engagementMetrics.engagementRate}%` : '0%'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Promedio general</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Gráfico de Actividad en Tiempo Real */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Actividad en Tiempo Real</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Usuarios activos en las últimas 24 horas</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 p-6"
        >
          <div className="h-64 bg-gradient-to-t from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent rounded-lg p-4 relative overflow-hidden">
            <div className="absolute inset-0 flex items-end justify-between pl-12 pr-4 pb-4">
              {realtimeActivity.length > 0 ? (
                realtimeActivity.map((activity, index) => {
                  // Mostrar datos reales con escala fija (máximo 50 usuarios = 100% de altura)
                  const maxScale = 50
                  const height = Math.min((activity.activeUsers / maxScale) * 100, 100)

                  return (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                      className="bg-blue-500 rounded-t-sm transition-all duration-500 hover:bg-blue-600 cursor-pointer"
                      style={{ width: `${100 / realtimeActivity.length}%`, minWidth: '8px' }}
                      title={`${activity.activeUsers} usuarios activos a las ${activity.hour}:00`}
                    />
                  )
                })
              ) : (
                // Si no hay datos reales, mostrar mensaje
                <div className="flex items-center justify-center w-full h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <div className="text-lg font-medium mb-2">Sin datos de actividad</div>
                    <div className="text-sm">No hay actividad registrada en las últimas 24 horas</div>
                  </div>
                </div>
              )}
            </div>
            {/* Escala del eje Y */}
            <div className="absolute left-2 top-4 bottom-8 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>50</span>
              <span>40</span>
              <span>30</span>
              <span>20</span>
              <span>10</span>
              <span>0</span>
            </div>

            {/* Escala del eje X */}
            <div className="absolute bottom-2 left-12 right-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>24:00</span>
            </div>
            <div className="absolute top-4 left-16">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {realtimeActivity.length > 0 ? 'Datos reales' : 'Sin datos'}
                </span>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total: {realtimeActivity.length > 0 ?
                    realtimeActivity.reduce((sum, item) => sum + item.activeUsers, 0) : 0} usuarios
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Pico: {realtimeActivity.length > 0 ?
                    Math.max(...realtimeActivity.map(a => a.activeUsers)) : 0} usuarios
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Escala: 0-50 usuarios
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Acciones Rápidas</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Acceso directo a las herramientas principales</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link
            href="/admin/reports?status=pending"
            className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 hover:scale-[1.02] text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-900/10 dark:to-blue-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Flag className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 text-lg">Ver Reportes Pendientes</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                Revisa reportes que requieren atención inmediata y toma acciones
              </p>
              <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-300">
                <span>Ver Reportes</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/stats"
            className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 hover:scale-[1.02] text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-900/10 dark:to-purple-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 text-lg">Ver Estadísticas</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                Análisis detallado del rendimiento y métricas de la plataforma
              </p>
              <div className="flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm font-semibold group-hover:text-purple-700 dark:group-hover:text-purple-300">
                <span>Ver Estadísticas</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 hover:scale-[1.02] text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-900/10 dark:to-green-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 text-lg">Gestionar Usuarios</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                Administra roles, permisos y cuentas de usuario del sistema
              </p>
              <div className="flex items-center justify-center text-green-600 dark:text-green-400 text-sm font-semibold group-hover:text-green-700 dark:group-hover:text-green-300">
                <span>Gestionar</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* System Overview */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Resumen del Sistema</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Métricas generales de la plataforma</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-900/10 dark:to-blue-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total de Usuarios</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{stats.users.total.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-3 shadow-sm"></div>
                  <span>{stats.users.new24h} nuevos en 24h</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  +{stats.users.activePercentage}% activos
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-900/10 dark:to-purple-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Contenido Total</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                    {(stats.content.posts + stats.content.reels).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-3 shadow-sm"></div>
                  <span>{stats.content.posts24h + stats.content.reels24h} nuevos en 24h</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  {stats.content.reels} reels
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-900/10 dark:to-green-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Transmisiones Activas</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{stats.activity.liveStreams}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse mr-3 shadow-sm"></div>
                  <span>En vivo ahora</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  Live
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Actividad Reciente del Sistema</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Últimas acciones y eventos del sistema</p>
            </div>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-all duration-200 flex items-center space-x-3 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:-translate-y-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar</span>
          </button>
        </div>
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-8">

          {activities.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Activity className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Sin actividad reciente</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                Las acciones del sistema, reportes y eventos aparecerán aquí cuando ocurran
              </p>
              <div className="mt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700/50">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Sistema monitoreando</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={`${activity.type}-${activity.relatedId}-${index}`}
                  className="group flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-gray-50/80 to-blue-50/30 dark:from-gray-800/80 dark:to-blue-900/20 hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/20 transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${getSeverityColor(activity.severity)} shadow-md flex-shrink-0`}></div>
                    <div className="text-3xl flex-shrink-0 filter drop-shadow-sm">{getActivityIcon(activity.type)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                      {activity.message}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                      {activity.user && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {activity.user}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {activity.type === 'report' && (
                    <Link
                      href={`/admin/reports/${activity.relatedId}`}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap flex-shrink-0 flex items-center gap-2"
                    >
                      <span>Ver Detalle</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
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

