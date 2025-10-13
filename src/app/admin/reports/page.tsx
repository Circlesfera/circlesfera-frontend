'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Flag,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getReports } from '@/services/reportService'
import type { Report } from '@/types'

export default function ReportsPage() {
  const searchParams = useSearchParams()

  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filtros
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all')
  const [reasonFilter, setReasonFilter] = useState(searchParams.get('reason') || 'all')
  const [search, setSearch] = useState('')

  // Paginación
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalReports, setTotalReports] = useState(0)

  const statusOptions = [
    { value: 'all', label: 'Todos los Estados', color: 'gray' },
    { value: 'pending', label: 'Pendientes', color: 'yellow' },
    { value: 'under_review', label: 'En Revisión', color: 'blue' },
    { value: 'resolved', label: 'Resueltos', color: 'green' },
    { value: 'rejected', label: 'Rechazados', color: 'red' },
  ]

  const typeOptions = [
    { value: 'all', label: 'Todos los Tipos' },
    { value: 'post', label: 'Posts' },
    { value: 'reel', label: 'Reels' },
    { value: 'story', label: 'Stories' },
    { value: 'comment', label: 'Comentarios' },
    { value: 'user', label: 'Usuarios' },
    { value: 'message', label: 'Mensajes' },
    { value: 'live_stream', label: 'Transmisiones' },
  ]

  const reasonOptions = [
    { value: 'all', label: 'Todas las Razones' },
    { value: 'spam', label: 'Spam' },
    { value: 'harassment', label: 'Acoso' },
    { value: 'hate_speech', label: 'Discurso de Odio' },
    { value: 'violence', label: 'Violencia' },
    { value: 'false_information', label: 'Información Falsa' },
    { value: 'copyright', label: 'Copyright' },
    { value: 'suicide_or_self_harm', label: 'Suicidio o Autolesión' },
    { value: 'scam', label: 'Estafa' },
    { value: 'terrorism', label: 'Terrorismo' },
    { value: 'other', label: 'Otro' },
  ]

  useEffect(() => {
    fetchReports()
  }, [statusFilter, typeFilter, reasonFilter, page])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const params: any = { page, limit: 20 }

      if (statusFilter !== 'all') params.status = statusFilter
      if (typeFilter !== 'all') params.contentType = typeFilter
      if (reasonFilter !== 'all') params.reason = reasonFilter

      const response = await getReports(params)

      if (response.success) {
        setReports(response.data || response.reports || [])
        setTotalPages(response.pagination?.pages || 1)
        setTotalReports(response.pagination?.total || 0)
      }

      setLoading(false)
    } catch (err) {
      setError('Error al cargar reportes')
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      under_review: { label: 'En Revisión', color: 'bg-blue-100 text-blue-800' },
      resolved: { label: 'Resuelto', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-800' },
    }
    const badge = badges[status] || { label: status, color: 'bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 text-gray-800 dark:text-gray-200' }

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`

    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gestión de Reportes
        </h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
          {totalReports} reporte{totalReports !== 1 ? 's' : ''} en total
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Contenido
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Razón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Razón del Reporte
            </label>
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ID, usuario..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Reset Filters */}
        {(statusFilter !== 'all' || typeFilter !== 'all' || reasonFilter !== 'all' || search) && (
          <button
            onClick={() => {
              setStatusFilter('all')
              setTypeFilter('all')
              setReasonFilter('all')
              setSearch('')
              setPage(1)
            }}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Cargando reportes...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center">
            <Flag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No hay reportes
            </h3>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
              No se encontraron reportes con los filtros seleccionados
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Contenido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Razón
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Reportado Por
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reports.map((report) => (
                    <tr
                      key={report._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors"
                    >
                      {/* ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900 dark:text-gray-100">
                          #{report._id.slice(-6)}
                        </div>
                      </td>

                      {/* Contenido */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 flex items-center justify-center">
                              {report.contentType === 'post' && <span className="text-xl">📷</span>}
                              {report.contentType === 'reel' && <span className="text-xl">🎬</span>}
                              {report.contentType === 'story' && <span className="text-xl">⭐</span>}
                              {report.contentType === 'comment' && <span className="text-xl">💬</span>}
                              {report.contentType === 'user' && <span className="text-xl">👤</span>}
                              {report.contentType === 'message' && <span className="text-xl">✉️</span>}
                              {report.contentType === 'live_stream' && <span className="text-xl">📡</span>}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                              {report.contentType}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 truncate max-w-xs">
                              {report.description || 'Sin descripción'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Razón */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {getReasonLabel(report.reason)}
                        </span>
                      </td>

                      {/* Reportado por */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {report.reportedBy?.avatar ? (
                            <Image
                              src={report.reportedBy.avatar}
                              alt={report.reportedBy.username}
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
                              {report.reportedBy?.username?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {report.reportedBy?.username || 'Anónimo'}
                          </span>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(report.status)}
                      </td>

                      {/* Fecha */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                        {formatDate(report.createdAt)}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/admin/reports/${report._id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Página {page} de {totalPages} ({totalReports} reportes totales)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  {page}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

