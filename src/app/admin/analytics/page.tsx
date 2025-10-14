'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Globe,
  Smartphone,
  Activity,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Share,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { analyticsService, formatAnalyticsData, type DashboardMetrics, type AnalyticsParams } from '@/services/analyticsService'

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<AnalyticsParams['timeRange']>('24h')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    fetchDashboardData()
  }, [timeRange])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await analyticsService.getRealTimeDashboard({ timeRange })
      setMetrics(data)
      setLastRefresh(new Date())
    } catch (err) {
      setError('Error al cargar métricas del dashboard')
      console.error('Error fetching dashboard metrics:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchDashboardData()
  }

  const handleExport = () => {
    if (!metrics) return

    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange,
      metrics
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-dashboard-${timeRange}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading && !metrics) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando métricas de analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error al cargar métricas</h3>
              <p className="text-red-600 dark:text-red-300">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Métricas en tiempo real del sistema
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Filtro de tiempo */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as AnalyticsParams['timeRange'])}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1h">Última hora</option>
                <option value="24h">Últimas 24 horas</option>
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
              </select>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>

              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Información de última actualización */}
        <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Última actualización: {formatAnalyticsData.formatDate(lastRefresh.toISOString(), 'time')}</span>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Usuarios Activos</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatAnalyticsData.formatNumber(metrics.overview.activeUsers)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nuevos Usuarios</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatAnalyticsData.formatNumber(metrics.overview.newUsers)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Contenido Total</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatAnalyticsData.formatNumber(
                  metrics.overview.totalPosts + metrics.overview.totalReels + metrics.overview.totalStories
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reportes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatAnalyticsData.formatNumber(metrics.overview.totalReports)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Métricas de engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Likes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Interacciones positivas</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {formatAnalyticsData.formatNumber(metrics.engagement.likes)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Comentarios</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Interacciones conversacionales</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {formatAnalyticsData.formatNumber(metrics.engagement.comments)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Visualizaciones</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Contenido visto</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {formatAnalyticsData.formatNumber(metrics.engagement.views)}
          </p>
        </motion.div>
      </div>

      {/* Distribución por plataforma */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Uso por Plataforma</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Distribución de usuarios por dispositivo</p>
            </div>
          </div>

          <div className="space-y-4">
            {metrics.platform.map((platform, index) => {
              const total = metrics.platform.reduce((sum, p) => sum + p.count, 0)
              const percentage = total > 0 ? (platform.count / total) * 100 : 0

              return (
                <div key={platform._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-purple-500' : 'bg-gray-500'
                      }`}></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {platform._id}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' :
                              index === 2 ? 'bg-purple-500' : 'bg-gray-500'
                          }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-16 text-right">
                      {formatAnalyticsData.formatPercentage(percentage)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Distribución Geográfica</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Top países por actividad</p>
            </div>
          </div>

          <div className="space-y-4">
            {metrics.geographic.slice(0, 5).map((geo, index) => (
              <div key={`${geo._id.country}-${geo._id.region}`} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' :
                          index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                    }`}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {geo._id.country}
                    {geo._id.region && `, ${geo._id.region}`}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatAnalyticsData.formatNumber(geo.count)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    ({formatAnalyticsData.formatNumber(geo.uniqueUserCount)} usuarios)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top contenido */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contenido Más Popular</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Ranking por engagement total</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Contenido</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Tipo</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Likes</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Comentarios</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Visualizaciones</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {metrics.topContent.slice(0, 10).map((content, index) => (
                <tr key={content._id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {content._id.slice(-8)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${content.contentType === 'post' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        content.contentType === 'reel' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                      {content.contentType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-gray-700 dark:text-gray-300">
                    {formatAnalyticsData.formatNumber(content.likes)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-gray-700 dark:text-gray-300">
                    {formatAnalyticsData.formatNumber(content.comments)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-gray-700 dark:text-gray-300">
                    {formatAnalyticsData.formatNumber(content.views)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatAnalyticsData.formatNumber(content.totalEngagement)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Errores del sistema */}
      {metrics.errors && metrics.errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 mt-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Errores del Sistema</h3>
              <p className="text-sm text-red-600 dark:text-red-300">Errores detectados en el período seleccionado</p>
            </div>
          </div>

          <div className="space-y-3">
            {metrics.errors.slice(0, 5).map((error, index) => (
              <div key={error._id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {error._id || 'Error desconocido'}
                  </span>
                </div>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {formatAnalyticsData.formatNumber(error.count)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
