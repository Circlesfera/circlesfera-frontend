import api from './axios'
import { useState } from 'react';

// Interfaces para los tipos de datos de analytics
export interface DashboardMetrics {
  overview: {
    activeUsers: number
    newUsers: number
    totalPosts: number
    totalReels: number
    totalStories: number
    totalReports: number
  }
  engagement: {
    likes: number
    comments: number
    views: number
  }
  topContent: ContentMetric[]
  growth: GrowthData[]
  geographic: GeographicData[]
  platform: PlatformData[]
  errors: ErrorMetric[]
  timeRange: string
  lastUpdated: string
}

export interface ContentMetric {
  id: string
  contentType: 'post' | 'reel' | 'story'
  likes: number
  comments: number
  views: number
  totalEngagement: number
  content?: Record<string, unknown>
}

export interface GrowthData {
  date: string
  count: number
}

export interface GeographicData {
  id: {
    country: string
    region?: string
  }
  count: number
  uniqueUserCount: number
}

export interface PlatformData {
  id: string
  count: number
  uniqueUserCount: number
}

export interface ErrorMetric {
  id: string
  count: number
  severity: string[]
}

export interface UserAnalytics {
  growth?: GrowthData[]
  activeUsers?: number
  newUsers?: number
  retention?: UserRetentionData[]
  topUsers?: TopUserData[]
  geographicDistribution?: GeographicData[]
}

export interface UserRetentionData {
  cohort: string
  totalUsers: number
  retention: {
    week: number
    retentionRate: number
    activeUsers: number
    totalUsers: number
  }[]
}

export interface TopUserData {
  userId: string
  username: string
  fullName?: string
  avatar?: string
  activityCount: number
  lastActivity: string
  eventTypes: string[]
}

export interface ContentAnalytics {
  metrics: {
    posts: number
    reels: number
    stories: number
  }
  engagement: {
    likes: number
    comments: number
    views: number
  }
  topContent: ContentMetric[]
  trends: ContentTrendData[]
  distribution: ContentDistributionData[]
}

export interface ContentTrendData {
  id: {
    date: string
    contentType: string
  }
  count: number
}

export interface ContentDistributionData {
  id: string
  count: number
}

export interface EngagementAnalytics {
  metrics: {
    likes: number
    comments: number
    views: number
    totalInteractions: number
    avgEngagementPerUser: number
  }
  trends: EngagementTrendData[]
  topContent: ContentMetric[]
  byContentType: ContentTypeEngagementData[]
  byTimeOfDay: TimeEngagementData[]
  byDayOfWeek: DayEngagementData[]
}

export interface EngagementTrendData {
  id: {
    date: string
    eventType: string
  }
  count: number
}

export interface ContentTypeEngagementData {
  id: string
  likes: number
  comments: number
  views: number
  total: number
}

export interface TimeEngagementData {
  id: number
  count: number
}

export interface DayEngagementData {
  id: number
  count: number
}

export interface GeographicAnalytics {
  distribution: GeographicData[]
  trends: GeographicTrendData[]
  topCountries: CountryData[]
  topRegions: RegionData[]
  engagement: GeographicEngagementData[]
}

export interface GeographicTrendData {
  id: {
    date: string
    country: string
  }
  count: number
}

export interface CountryData {
  id: string
  count: number
  uniqueUserCount: number
}

export interface RegionData {
  id: {
    country: string
    region: string
  }
  count: number
  uniqueUserCount: number
}

export interface GeographicEngagementData {
  id: string
  engagementCount: number
  uniqueUserCount: number
  avgEngagementPerUser: number
}

export interface PlatformAnalytics {
  usage: PlatformData[]
  trends: PlatformTrendData[]
  engagement: PlatformEngagementData[]
  retention: PlatformRetentionData[]
}

export interface PlatformTrendData {
  id: {
    date: string
    platform: string
  }
  count: number
}

export interface PlatformEngagementData {
  id: string
  engagementCount: number
  uniqueUserCount: number
  avgEngagementPerUser: number
}

export interface PlatformRetentionData {
  id: string
  uniqueUsers: string[]
  totalLogins: number
  uniqueUserCount: number
  avgLoginsPerUser: number
}

export interface PeriodComparison {
  current: Record<string, unknown>
  previous: Record<string, unknown>
  changes: {
    [key: string]: {
      value: number
      percentage: number
    }
  }
}

export interface CustomMetric {
  name: string
  type: 'active_users' | 'new_users' | 'content_created' | 'engagement' | 'top_content' | 'geographic' | 'platform'
  limit?: number
}

export interface CustomMetricsRequest {
  metrics: CustomMetric[]
  timeRange?: '7d' | '30d' | '90d'
  filters?: Record<string, unknown>
  groupBy?: 'daily' | 'weekly' | 'monthly'
}

export interface CustomMetricsResponse {
  [metricName: string]: {
    data: Record<string, unknown>
    error?: string
    timestamp: string
  }
}

// Parámetros para consultas
export interface AnalyticsParams {
  timeRange?: '1h' | '24h' | '7d' | '30d' | '90d'
  userId?: string
  groupBy?: 'daily' | 'weekly' | 'monthly'
  contentType?: 'post' | 'reel' | 'story'
  sortBy?: 'engagement' | 'likes' | 'comments' | 'views'
  country?: string
  region?: string
}

// Funciones del servicio
export const analyticsService = {
  /**
   * Obtener métricas del dashboard en tiempo real
   */
  async getRealTimeDashboard(params?: AnalyticsParams): Promise<DashboardMetrics> {
    const queryParams = new URLSearchParams()

    if (params?.timeRange) queryParams.append('timeRange', params.timeRange)

    const response = await api.get(`/admin/analytics/dashboard?${queryParams.toString()}`)
    return response.data.data
  },

  /**
   * Obtener análisis de usuarios
   */
  async getUserAnalytics(params?: AnalyticsParams): Promise<UserAnalytics> {
    const queryParams = new URLSearchParams()

    if (params?.timeRange) queryParams.append('timeRange', params.timeRange)
    if (params?.userId) queryParams.append('userId', params.userId)
    if (params?.groupBy) queryParams.append('groupBy', params.groupBy)

    const response = await api.get(`/admin/analytics/users?${queryParams.toString()}`)
    return response.data.data
  },

  /**
   * Obtener análisis de contenido
   */
  async getContentAnalytics(params?: AnalyticsParams): Promise<ContentAnalytics> {
    const queryParams = new URLSearchParams()

    if (params?.timeRange) queryParams.append('timeRange', params.timeRange)
    if (params?.contentType) queryParams.append('contentType', params.contentType)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)

    const response = await api.get(`/admin/analytics/content?${queryParams.toString()}`)
    return response.data.data
  },

  /**
   * Obtener análisis de engagement
   */
  async getEngagementAnalytics(params?: AnalyticsParams): Promise<EngagementAnalytics> {
    const queryParams = new URLSearchParams()

    if (params?.timeRange) queryParams.append('timeRange', params.timeRange)
    if (params?.groupBy) queryParams.append('groupBy', params.groupBy)

    const response = await api.get(`/admin/analytics/engagement?${queryParams.toString()}`)
    return response.data.data
  },

  /**
   * Obtener análisis geográfico
   */
  async getGeographicAnalytics(params?: AnalyticsParams): Promise<GeographicAnalytics> {
    const queryParams = new URLSearchParams()

    if (params?.timeRange) queryParams.append('timeRange', params.timeRange)
    if (params?.country) queryParams.append('country', params.country)
    if (params?.region) queryParams.append('region', params.region)

    const response = await api.get(`/admin/analytics/geographic?${queryParams.toString()}`)
    return response.data.data
  },

  /**
   * Obtener análisis de plataformas
   */
  async getPlatformAnalytics(params?: AnalyticsParams): Promise<PlatformAnalytics> {
    const queryParams = new URLSearchParams()

    if (params?.timeRange) queryParams.append('timeRange', params.timeRange)

    const response = await api.get(`/admin/analytics/platform?${queryParams.toString()}`)
    return response.data.data
  },

  /**
   * Obtener comparación de períodos
   */
  async getPeriodComparison(
    metricType: string,
    currentPeriod: { start: string; end: string },
    previousPeriod: { start: string; end: string }
  ): Promise<PeriodComparison> {
    const response = await api.post('/admin/analytics/comparison', {
      metricType,
      currentPeriod,
      previousPeriod
    })
    return response.data.data
  },

  /**
   * Obtener métricas personalizadas
   */
  async getCustomMetrics(request: CustomMetricsRequest): Promise<CustomMetricsResponse> {
    const response = await api.post('/admin/analytics/custom', request)
    return response.data.data
  }
}

// Funciones de utilidad para formatear datos
export const formatAnalyticsData = {
  /**
   * Formatear número con separadores de miles
   */
  formatNumber: (num: number): string => {
    return new Intl.NumberFormat('es-ES').format(num)
  },

  /**
   * Formatear porcentaje
   */
  formatPercentage: (num: number, decimals: number = 1): string => {
    return `${num.toFixed(decimals)}%`
  },

  /**
   * Formatear cambio porcentual
   */
  formatPercentageChange: (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? '+100%' : '0%'
    const change = ((current - previous) / previous) * 100
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  },

  /**
   * Formatear fecha para mostrar
   */
  formatDate: (dateString: string, format: 'short' | 'long' | 'time' = 'short'): string => {
    const date = new Date(dateString)

    switch (format) {
      case 'short':
        return date.toLocaleDateString('es-ES')
      case 'long':
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      case 'time':
        return date.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })
      default:
        return date.toLocaleDateString('es-ES')
    }
  },

  /**
   * Formatear duración
   */
  formatDuration: (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  },

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize: (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  },

  /**
   * Obtener color para métricas basado en el valor
   */
  getMetricColor: (value: number, type: 'positive' | 'negative' | 'neutral' = 'neutral'): string => {
    if (type === 'positive') {
      return value >= 0 ? 'text-green-600' : 'text-red-600'
    } else if (type === 'negative') {
      return value <= 0 ? 'text-green-600' : 'text-red-600'
    } else {
      return 'text-gray-600'
    }
  },

  /**
   * Generar colores para gráficos
   */
  generateChartColors: (count: number): string[] => {
    const colors: string[] = [
      '#3B82F6', // blue-500
      '#EF4444', // red-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#8B5CF6', // violet-500
      '#06B6D4', // cyan-500
      '#84CC16', // lime-500
      '#F97316', // orange-500
      '#EC4899', // pink-500
      '#6B7280'  // gray-500
    ]

    const result: string[] = []
    for (let i = 0; i < count; i++) {
      const color = colors[i % colors.length]
      if (color) {
        result.push(color)
      }
    }
    return result
  }
}

// Hooks personalizados para analytics
export const useAnalytics = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async <T>(
    fetchFunction: () => Promise<T>,
    setData: (data: T) => void
  ): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchFunction()
      setData(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error fetching analytics data:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    fetchData
  }
}

export default analyticsService
