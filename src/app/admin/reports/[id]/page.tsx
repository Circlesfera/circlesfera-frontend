'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Flag,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
  Trash2,
  FileText,
  Image as ImageIcon,
  Video,
  MessageSquare,
  Radio,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getReportById, updateReportStatus } from '@/services/reportService'
import type { Report, ReportStatus } from '@/types'

export default function ReportDetailPage() {
  const params = useParams()
  const reportId = params.id as string

  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState('')

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await getReportById(reportId)

      const reportData = response.data || response.report
      if (response.success && reportData) {
        setReport(reportData)
        setNotes(reportData.moderatorNotes || '')
      } else {
        setError('Reporte no encontrado')
      }

      setLoading(false)
    } catch {
      setError('Error al cargar el reporte')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (reportId) {
      fetchReport()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId])

  const handleUpdateStatus = async (newStatus: ReportStatus, action?: string | undefined) => {
    if (!report) return

    const confirmMessages: Record<string, string> = {
      resolved: '¿Marcar este reporte como resuelto?',
      rejected: '¿Rechazar este reporte?',
      under_review: '¿Marcar como en revisión?',
    }

    if (!confirm(confirmMessages[newStatus] || '¿Actualizar estado?')) {
      return
    }

    try {
      setUpdating(true)

      const updateData: { status: ReportStatus; moderatorNotes?: string | undefined; action?: string | undefined } = {
        status: newStatus,
        moderatorNotes: notes,
      }

      if (action) {
        updateData.action = action
      }

      const response = await updateReportStatus(reportId, updateData)

      if (response.success) {
        setReport({ ...report, status: newStatus, moderatorNotes: notes })
        alert('Estado actualizado exitosamente')
      } else {
        alert('Error al actualizar estado')
      }

      setUpdating(false)
    } catch {
      alert('Error al actualizar el reporte')
      setUpdating(false)
    }
  }

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spam: 'Spam',
      harassment: 'Acoso',
      hate_speech: 'Discurso de Odio',
      violence: 'Violencia',
      false_information: 'Información Falsa',
      copyright: 'Violación de Copyright',
      suicide_or_self_harm: 'Suicidio o Autolesión',
      scam: 'Estafa o Fraude',
      terrorism: 'Terrorismo',
      other: 'Otro',
    }
    return labels[reason] || reason
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      under_review: { label: 'En Revisión', color: 'bg-blue-100 text-blue-800', icon: Flag },
      resolved: { label: 'Resuelto', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-800', icon: XCircle },
    }
    const badge = badges[status] || { label: status, color: 'bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 text-gray-800 dark:text-gray-200', icon: Flag }
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4" />
        <span>{badge.label}</span>
      </span>
    )
  }

  const getContentIcon = (type: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      post: ImageIcon,
      reel: Video,
      story: Video,
      comment: MessageSquare,
      user: User,
      message: MessageSquare,
      live_stream: Radio,
    }
    return icons[type] || FileText
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Cargando reporte...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error || 'Reporte no encontrado'}</p>
            </div>
          </div>
          <Link
            href="/admin/reports"
            className="mt-4 inline-flex items-center space-x-2 text-sm font-medium text-red-600 hover:text-red-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a reportes</span>
          </Link>
        </div>
      </div>
    )
  }

  const ContentIcon = getContentIcon(report.contentType)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/reports"
          className="inline-flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:text-gray-100 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a reportes</span>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Detalle del Reporte
            </h1>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 font-mono">
                ID: {report.id}
              </span>
              {getStatusBadge(report.status)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del Reporte */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Información del Reporte
            </h2>

            <div className="space-y-4">
              {/* Tipo de Contenido */}
              <div className="flex items-start space-x-3">
                <ContentIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipo de Contenido
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 capitalize">
                    {report.contentType}
                  </p>
                </div>
              </div>

              {/* Razón */}
              <div className="flex items-start space-x-3">
                <Flag className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Razón del Reporte
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {getReasonLabel(report.reason)}
                  </p>
                </div>
              </div>

              {/* Descripción */}
              {report.description && (
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descripción Adicional
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      {report.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Reportado por */}
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reportado Por
                  </p>
                  {report.reportedBy ? (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {report.reportedBy.avatar ? (
                        <Image
                          src={report.reportedBy.avatar}
                          alt={report.reportedBy.username}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 dark:text-gray-500">
                          {report.reportedBy.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {report.reportedBy.fullName || report.reportedBy.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                          @{report.reportedBy.username}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Usuario no disponible</p>
                  )}
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Fecha de Reporte
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {new Date(report.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {report.updatedAt && report.updatedAt !== report.createdAt && (
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Última Actualización
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(report.updatedAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contenido Reportado */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Contenido Reportado
            </h2>

            {/* TODO: Mostrar preview del contenido según el tipo */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
              <ContentIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-2">
                Tipo: <span className="font-medium capitalize">{report.contentType}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                ID del contenido: {report.reportedContent}
              </p>
              <Link
                href={`/${report.contentType}/${report.reportedContent}`}
                className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 text-sm font-medium"
                target="_blank"
              >
                <span>Ver Contenido Original</span>
              </Link>
            </div>
          </div>

          {/* Notas del Moderador */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Notas del Moderador
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agrega notas internas sobre este reporte..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-2">
              Estas notas son internas y no serán visibles para los usuarios
            </p>
          </div>
        </div>

        {/* Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Acciones */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">
              Acciones de Moderación
            </h3>

            <div className="space-y-3">
              {/* Marcar En Revisión */}
              {report.status === 'pending' && (
                <button
                  onClick={() => handleUpdateStatus('under_review')}
                  disabled={updating}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50 font-medium"
                >
                  <Flag className="w-4 h-4" />
                  <span>Marcar En Revisión</span>
                </button>
              )}

              {/* Aprobar (Resolver) */}
              {report.status !== 'resolved' && (
                <button
                  onClick={() => handleUpdateStatus('resolved', 'content_removed')}
                  disabled={updating}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50 font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Aprobar y Eliminar Contenido</span>
                </button>
              )}

              {/* Rechazar */}
              {report.status !== 'rejected' && (
                <button
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={updating}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 font-medium"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Rechazar Reporte</span>
                </button>
              )}

              {/* Divider */}
              {report.status !== 'resolved' && (
                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
              )}

              {/* Acciones Severas */}
              {report.status !== 'resolved' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus('resolved', 'user_suspended')}
                    disabled={updating}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors disabled:opacity-50 font-medium"
                  >
                    <Ban className="w-4 h-4" />
                    <span>Suspender Usuario</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('resolved', 'user_banned')}
                    disabled={updating}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50 font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Banear Usuario</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">
              ℹ️ Nota sobre Moderación
            </h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              CircleSfera permite contenido para adultos consensuado.
              Solo modera contenido que viole las normas:
              <br />• Contenido ilegal
              <br />• Menores de edad
              <br />• Violencia extrema
              <br />• Spam masivo
              <br />• Acoso/bullying
            </p>
          </div>

          {/* Historial (placeholder) */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-sm">
              Historial de Acciones
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-900 dark:text-gray-100">
                    Reporte creado
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              {report.updatedAt && report.updatedAt !== report.createdAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-900 dark:text-gray-100">
                      Estado actualizado
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                      {new Date(report.updatedAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

