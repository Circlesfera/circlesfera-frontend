'use client'

import { useEffect, useState } from 'react'
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
                <span className="text-sm font-medium">+15.3%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Likes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">12,847</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Últimas 24h</p>
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
                <span className="text-sm font-medium">+8.7%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Comentarios</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">3,421</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Últimas 24h</p>
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
                <span className="text-sm font-medium">+22.1%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Visualizaciones</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">89,234</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Últimas 24h</p>
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
                <span className="text-sm font-medium">+5.2%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">4.8%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Promedio diario</p>
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
            <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
              {[65, 72, 58, 85, 78, 92, 88, 95, 82, 76, 89, 94, 87, 91, 85, 88, 92, 89, 86, 90, 93, 88, 85, 89].map((height, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  className="bg-blue-500 rounded-t-sm transition-all duration-500 hover:bg-blue-600 cursor-pointer"
                  style={{ width: '8px' }}
                  title={`${height} usuarios activos`}
                />
              ))}
            </div>
            <div className="absolute bottom-2 left-4 right-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>24:00</span>
            </div>
            <div className="absolute top-4 left-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">En vivo</span>
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

