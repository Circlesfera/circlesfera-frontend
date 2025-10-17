'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  TrendingUp,
  UserPlus,
  MapPin,
  Clock,
  BarChart3,
  RefreshCw,
  Filter,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Activity,
  Globe
} from 'lucide-react'
import { analyticsService, formatAnalyticsData, type UserAnalytics, type AnalyticsParams } from '@/services/analyticsService'
import { Chart } from '@/features/analytics/components'

export default function UserAnalyticsPage() {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<AnalyticsParams['timeRange']>('30d')
  const [groupBy, setGroupBy] = useState<AnalyticsParams['groupBy']>('daily')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [showDetails, setShowDetails] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState<Date | null>(null)
  const [showExportOptions, setShowExportOptions] = useState(false)

  const fetchUserAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await analyticsService.getUserAnalytics({
        timeRange: timeRange || '30d',
        groupBy: groupBy || 'daily'
      })
      setAnalytics(data)
      setLastRefresh(new Date())
    } catch (err) {
      setError('Error al cargar análisis de usuarios')
      console.error('Error fetching user analytics:', err)
    } finally {
      setLoading(false)
    }
  }, [timeRange, groupBy])

  useEffect(() => {
    fetchUserAnalytics()
  }, [fetchUserAnalytics])

  const handleRefresh = () => {
    fetchUserAnalytics()
  }

  const handleToggleDetails = () => {
    setShowDetails(!showDetails)
  }

  const handleDateRangeChange = (date: Date) => {
    setSelectedDateRange(date)
    // Aquí podrías filtrar los datos basándose en la fecha seleccionada
    console.log('Fecha seleccionada:', date.toISOString())
  }

  const handleExportData = () => {
    setShowExportOptions(!showExportOptions)
    // Funcionalidad de exportación
    if (analytics) {
      const exportData = {
        timestamp: new Date().toISOString(),
        timeRange,
        groupBy,
        data: analytics
      }
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `user-analytics-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleShareReport = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    // Aquí podrías agregar una notificación de éxito
  }

  const handleLikeReport = () => {
    // Funcionalidad para marcar reporte como favorito
    console.log('Reporte marcado como favorito')
  }

  const handleCommentOnReport = () => {
    // Funcionalidad para agregar comentarios al reporte
    console.log('Abrir modal de comentarios')
  }

  if (loading && !analytics) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando análisis de usuarios...</p>
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
            <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 text-sm">!</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error al cargar datos</h3>
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

  if (!analytics) return null

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Análisis de Usuarios
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Métricas detalladas sobre el comportamiento y crecimiento de usuarios
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Filtros */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as AnalyticsParams['timeRange'])}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
              </select>

              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as AnalyticsParams['groupBy'])}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center space-x-2">
              {/* Botón de calendario */}
              <button
                onClick={() => handleDateRangeChange(new Date())}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                title="Seleccionar rango de fechas"
              >
                <Calendar className="w-4 h-4" />
              </button>

              {/* Botón de detalles */}
              <button
                onClick={handleToggleDetails}
                className={`px-3 py-2 border rounded-lg transition-colors duration-200 ${showDetails
                  ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                title={showDetails ? "Ocultar detalles" : "Mostrar detalles"}
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Botón de exportar */}
              <button
                onClick={handleExportData}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                title="Exportar datos"
              >
                <Share className="w-4 h-4" />
              </button>

              {/* Botón de actualización */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Información de última actualización */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Última actualización: {formatAnalyticsData.formatDate(lastRefresh.toISOString(), 'time')}</span>
            </div>
            {selectedDateRange && (
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <Calendar className="w-4 h-4" />
                <span>Fecha seleccionada: {formatAnalyticsData.formatDate(selectedDateRange.toISOString(), 'short')}</span>
              </div>
            )}
          </div>

          {/* Botones de interacción social */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLikeReport}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
              title="Marcar como favorito"
            >
              <Heart className="w-4 h-4" />
              <span>Favorito</span>
            </button>

            <button
              onClick={handleCommentOnReport}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
              title="Agregar comentario"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Comentar</span>
            </button>

            <button
              onClick={handleShareReport}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors duration-200"
              title="Compartir reporte"
            >
              <Share className="w-4 h-4" />
              <span>Compartir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sección de detalles expandidos */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Distribución Geográfica Detallada</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Análisis detallado por ubicación</p>
              </div>
            </div>

            {analytics.geographicDistribution && analytics.geographicDistribution.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.geographicDistribution.slice(0, 9).map((location, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {location.id.country}
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {location.id.region || 'N/A'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Sesiones:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatAnalyticsData.formatNumber(location.count)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Usuarios únicos:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatAnalyticsData.formatNumber(location.uniqueUserCount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No hay datos de distribución geográfica disponibles
              </div>
            )}
          </div>
        </motion.div>
      )}

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
                {analytics.activeUsers ? formatAnalyticsData.formatNumber(analytics.activeUsers) : 'N/A'}
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
                {analytics.newUsers ? formatAnalyticsData.formatNumber(analytics.newUsers) : 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-green-600 dark:text-green-400" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Países Activos</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.geographicDistribution ? formatAnalyticsData.formatNumber(analytics.geographicDistribution.length) : 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Usuarios Top</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.topUsers ? formatAnalyticsData.formatNumber(analytics.topUsers.length) : 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gráfico de crecimiento de usuarios */}
      {analytics.growth && analytics.growth.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Chart
            data={analytics.growth.map(item => ({
              label: item.date,
              value: item.count
            }))}
            type="line"
            title="Crecimiento de Usuarios"
            subtitle={`Nuevos registros en los últimos ${timeRange}`}
            height={350}
            colors={['#3B82F6', '#10B981']}
          />
        </motion.div>
      )}

      {/* Análisis de retención */}
      {analytics.retention && analytics.retention.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Análisis de Retención</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de retención por cohortes</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Cohorte</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Usuarios</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Semana 1</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Semana 2</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Semana 3</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Semana 4</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.retention.slice(0, 10).map((cohort, index) => (
                    <tr key={cohort.cohort} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{cohort.cohort}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-700 dark:text-gray-300">
                        {formatAnalyticsData.formatNumber(cohort.totalUsers)}
                      </td>
                      {[1, 2, 3, 4].map(week => {
                        const weekData = cohort.retention.find(r => r.week === week)
                        return (
                          <td key={week} className="py-3 px-4 text-center text-sm text-gray-700 dark:text-gray-300">
                            {weekData ? formatAnalyticsData.formatPercentage(weekData.retentionRate) : 'N/A'}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top usuarios activos */}
      {analytics.topUsers && analytics.topUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Usuarios Más Activos</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ranking por actividad en el período</p>
              </div>
            </div>

            <div className="space-y-4">
              {analytics.topUsers.map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex items-center space-x-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                          {user.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.fullName || user.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatAnalyticsData.formatNumber(user.activityCount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Actividades</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatAnalyticsData.formatDate(user.lastActivity, 'short')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Última actividad</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Distribución geográfica */}
      {analytics.geographicDistribution && analytics.geographicDistribution.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Distribución por País</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Usuarios activos por ubicación</p>
                </div>
              </div>

              <div className="space-y-4">
                {analytics.geographicDistribution.slice(0, 10).map((geo, index) => {
                  const total = analytics.geographicDistribution?.reduce((sum, g) => sum + g.count, 0) || 1
                  const percentage = (geo.count / total) * 100

                  return (
                    <div key={`${geo.id.country}-${geo.id.region}`} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-purple-500' :
                              index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                          }`}></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {geo.id.country}
                          {geo.id.region && `, ${geo.id.region}`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${index === 0 ? 'bg-blue-500' :
                              index === 1 ? 'bg-green-500' :
                                index === 2 ? 'bg-purple-500' :
                                  index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                              }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatAnalyticsData.formatNumber(geo.count)}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            ({formatAnalyticsData.formatNumber(geo.uniqueUserCount)} usuarios)
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gráfico de Distribución</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Visualización de usuarios por país</p>
                </div>
              </div>

              <Chart
                data={analytics.geographicDistribution.slice(0, 8).map(geo => ({
                  label: geo.id.country,
                  value: geo.count
                }))}
                type="doughnut"
                height={300}
                colors={['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']}
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
