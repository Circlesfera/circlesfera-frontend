'use client'

import { useEffect, useState } from 'react'
import { Flag, Users, AlertTriangle, CheckCircle, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'
import { getDashboardStats, DashboardStats } from '@/services/adminService'
import logger from '@/utils/logger'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await getDashboardStats()

      if (response.success && response.data) {
        setStats(response.data)
      } else {
        setError('Error al cargar estadísticas')
      }

      setLoading(false)
    } catch (err) {
      logger.error('Error fetching dashboard stats:', err)
      setError('Error al cargar estadísticas del sistema')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Cargando estadísticas reales del sistema...</p>
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
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Reintentar
        </button>
      </div>
    )
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard de Moderación
        </h1>
        <p className="text-gray-600">
          Gestiona reportes, usuarios y contenido de CircleSfera
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          const colorClasses: Record<string, string> = {
            blue: 'bg-blue-500',
            yellow: 'bg-yellow-500',
            green: 'bg-green-500',
            purple: 'bg-purple-500',
          }

          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${colorClasses[stat.color]} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.change && (
                  <span className={`text-sm font-medium ${stat.changeType === 'increase' ? 'text-red-600' : 'text-green-600'
                    }`}>
                    {stat.change}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                {stat.name}
              </h3>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-sm text-gray-500">
                    {stat.subtitle}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/reports?status=pending"
            className="flex items-center space-x-3 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <Flag className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Ver Reportes Pendientes</span>
          </Link>

          <Link
            href="/admin/stats"
            className="flex items-center space-x-3 p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">Ver Estadísticas</span>
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center space-x-3 p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
          >
            <Users className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900">Gestionar Usuarios</span>
          </Link>
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Vista General del Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total de Usuarios</p>
            <p className="text-3xl font-bold text-blue-600">{stats.users.total}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.users.new24h} nuevos en 24h
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Contenido Total</p>
            <p className="text-3xl font-bold text-purple-600">
              {stats.content.posts + stats.content.reels}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.content.posts24h + stats.content.reels24h} nuevos en 24h
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Transmisiones Activas</p>
            <p className="text-3xl font-bold text-green-600">{stats.activity.liveStreams}</p>
            <p className="text-xs text-gray-500 mt-1">
              En vivo ahora
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

