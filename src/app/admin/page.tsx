'use client'

import { useEffect, useState } from 'react'
import { Flag, Users, AlertTriangle, CheckCircle, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    rejectedReports: 0,
    totalUsers: 0,
    activeUsers: 0,
    reportsTrend: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Cargar estadísticas reales del backend
    // Por ahora, datos de ejemplo
    setTimeout(() => {
      setStats({
        totalReports: 45,
        pendingReports: 12,
        resolvedReports: 28,
        rejectedReports: 5,
        totalUsers: 1250,
        activeUsers: 890,
        reportsTrend: 15,
      })
      setLoading(false)
    }, 500)
  }, [])

  const statCards = [
    {
      name: 'Reportes Pendientes',
      value: stats.pendingReports,
      change: `+${stats.reportsTrend}%`,
      changeType: 'increase',
      icon: Flag,
      color: 'blue',
      href: '/admin/reports?status=pending',
    },
    {
      name: 'Total Reportes',
      value: stats.totalReports,
      subtitle: 'Este mes',
      icon: AlertTriangle,
      color: 'yellow',
      href: '/admin/reports',
    },
    {
      name: 'Reportes Resueltos',
      value: stats.resolvedReports,
      subtitle: 'Este mes',
      icon: CheckCircle,
      color: 'green',
      href: '/admin/reports?status=resolved',
    },
    {
      name: 'Usuarios Activos',
      value: stats.activeUsers,
      subtitle: `de ${stats.totalUsers} total`,
      icon: Users,
      color: 'purple',
      href: '/admin/users',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

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

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Actividad Reciente
        </h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Nuevo reporte: Spam en post #12345
              </p>
              <p className="text-xs text-gray-500">Hace 5 minutos</p>
            </div>
            <Link
              href="/admin/reports"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Ver
            </Link>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Reporte resuelto: Contenido inapropiado
              </p>
              <p className="text-xs text-gray-500">Hace 1 hora</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Usuario suspendido: Violación de normas
              </p>
              <p className="text-xs text-gray-500">Hace 3 horas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

