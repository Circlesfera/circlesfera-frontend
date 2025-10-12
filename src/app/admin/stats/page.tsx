'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Clock,
  Flag,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { getReportStats } from '@/services/reportService'

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await getReportStats()

      const statsData = response.data || response.stats
      if (response.success && statsData) {
        // Procesar datos del backend
        // El backend devuelve arrays, necesitamos convertirlos a objetos
        const processedStats = {
          total: 0,
          byStatus: statsData.byStatus || {},
          byReason: {} as Record<string, number>,
          byContentType: {} as Record<string, number>,
          averageResolutionTime: statsData.averageResolutionTime || '0h'
        }

        // Convertir arrays de byReason a objeto
        if (Array.isArray(statsData.byReason)) {
          statsData.byReason.forEach((item: any) => {
            processedStats.byReason[item._id] = item.count
            processedStats.total += item.count
          })
        }

        // Convertir arrays de byContentType a objeto
        if (Array.isArray(statsData.byContentType)) {
          statsData.byContentType.forEach((item: any) => {
            processedStats.byContentType[item._id] = item.count
          })
        }

        // Calcular total desde byStatus si no hay byReason
        if (processedStats.total === 0 && statsData.byStatus) {
          processedStats.total = Object.values(statsData.byStatus).reduce((sum: number, val: any) => sum + val, 0)
        }

        setStats(processedStats)
      }

      setLoading(false)
    } catch (err) {
      setError('Error al cargar estadísticas')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando estadísticas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spam: 'Spam',
      harassment: 'Acoso',
      hate_speech: 'Discurso de Odio',
      violence: 'Violencia',
      false_information: 'Info Falsa',
      copyright: 'Copyright',
      suicide_or_self_harm: 'Suicidio/Autolesión',
      scam: 'Estafa',
      terrorism: 'Terrorismo',
      other: 'Otro',
    }
    return labels[reason] || reason
  }

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      post: 'Posts',
      reel: 'Reels',
      story: 'Stories',
      comment: 'Comentarios',
      user: 'Usuarios',
      message: 'Mensajes',
      live_stream: 'Transmisiones',
    }
    return labels[type] || type
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Estadísticas de Reportes
        </h1>
        <p className="text-gray-600">
          Análisis y métricas del sistema de moderación
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Flag className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Reportes</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.total}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Pendientes</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.byStatus?.pending || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Resueltos</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.byStatus?.resolved || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Rechazados</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.byStatus?.rejected || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reportes por Razón */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Reportes por Razón</span>
          </h2>
          <div className="space-y-3">
            {stats.byReason && Object.entries(stats.byReason).map(([reason, count]: [string, any]) => {
              const percentage = (count / stats.total) * 100
              return (
                <div key={reason}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {getReasonLabel(reason)}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Reportes por Tipo de Contenido */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Por Tipo de Contenido</span>
          </h2>
          <div className="space-y-3">
            {stats.byContentType && Object.entries(stats.byContentType).map(([type, count]: [string, any]) => {
              const percentage = (count / stats.total) * 100
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {getContentTypeLabel(type)}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Reportes por Estado */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Estado de Reportes
          </h2>
          <div className="space-y-4">
            {stats.byStatus && Object.entries(stats.byStatus).map(([status, count]: [string, any]) => {
              const statusColors: Record<string, string> = {
                pending: 'bg-yellow-500',
                under_review: 'bg-blue-500',
                resolved: 'bg-green-500',
                rejected: 'bg-red-500',
              }
              const statusLabels: Record<string, string> = {
                pending: 'Pendiente',
                under_review: 'En Revisión',
                resolved: 'Resuelto',
                rejected: 'Rechazado',
              }

              return (
                <div key={status} className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${statusColors[status]}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {statusLabels[status]}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {count}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Usuarios con Más Reportes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Contenido Más Reportado
          </h2>
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Próximamente: Top contenido reportado
            </p>
          </div>
        </div>
      </div>

      {/* Tendencias */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span>Resumen General</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Tasa de Resolución</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.total > 0
                ? Math.round(((stats.byStatus?.resolved || 0) / stats.total) * 100)
                : 0}%
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Tiempo Promedio</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.averageResolutionTime || '0h'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">En Revisión</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.byStatus?.under_review || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

