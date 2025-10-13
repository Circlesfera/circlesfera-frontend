/**
 * 🎯 usePostActions Hook
 * ======================
 * Hook personalizado para manejar todas las acciones de un post
 * Separa la lógica de negocio de la UI
 */

import { useState, useRef, useEffect } from 'react'
import { updatePost, deletePost, togglePinPost } from '@/services/postService'
import { createReport, type ReportReason } from '@/services/reportService'
import logger from '@/utils/logger'

export interface UsePostActionsProps {
  postId: string
  initialCaption: string
  onPostDeleted: ((postId: string) => void) | undefined
  onError: ((error: string) => void) | undefined
  onSuccess: ((message: string) => void) | undefined
}

export interface UsePostActionsReturn {
  // Estados
  isEditing: boolean
  editCaption: string
  isPinned: boolean
  isDeleting: boolean
  showDeleteConfirm: boolean
  showReportModal: boolean
  showMore: boolean
  isSaved: boolean
  error: string | null

  // Refs
  moreMenuRef: React.RefObject<HTMLDivElement | null>

  // Setters
  setIsEditing: (value: boolean) => void
  setEditCaption: (value: string) => void
  setShowDeleteConfirm: (value: boolean) => void
  setShowReportModal: (value: boolean) => void
  setShowMore: (value: boolean) => void
  setIsSaved: (value: boolean) => void

  // Acciones
  handleEdit: () => Promise<void>
  handleDelete: () => Promise<void>
  handleTogglePin: () => Promise<void>
  handleReport: (reason: string, description?: string) => Promise<void>
  handleSave: () => void
}

export function usePostActions({
  postId,
  initialCaption,
  onPostDeleted,
  onError,
  onSuccess,
}: UsePostActionsProps): UsePostActionsReturn {
  // Estados
  const [isEditing, setIsEditing] = useState(false)
  const [editCaption, setEditCaption] = useState(initialCaption)
  const [isPinned, setIsPinned] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs
  const moreMenuRef = useRef<HTMLDivElement>(null)

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMore(false)
      }
    }

    if (showMore) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMore])

  // Editar post
  const handleEdit = async () => {
    try {
      setError(null)
      const response = await updatePost(postId, { caption: editCaption })

      if (response.success) {
        setIsEditing(false)
        setShowMore(false)
        onSuccess?.('Post actualizado exitosamente')

        logger.info('Post edited successfully:', { postId })
      }
    } catch (editError) {
      const errorMessage = 'Error al editar el post'
      setError(errorMessage)
      onError?.(errorMessage)

      logger.error('Error editing post:', {
        error: editError instanceof Error ? editError.message : 'Unknown error',
        postId
      })
    }
  }

  // Eliminar post
  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setError(null)

      const response = await deletePost(postId)

      if (response.success) {
        setShowDeleteConfirm(false)
        setShowMore(false)
        onPostDeleted?.(postId)
        onSuccess?.('Post eliminado exitosamente')

        logger.info('Post deleted successfully:', { postId })
      }
    } catch (deleteError) {
      const errorMessage = 'Error al eliminar el post'
      setError(errorMessage)
      onError?.(errorMessage)

      logger.error('Error deleting post:', {
        error: deleteError instanceof Error ? deleteError.message : 'Unknown error',
        postId
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Fijar/Desfijar post
  const handleTogglePin = async () => {
    try {
      setError(null)
      const response = await togglePinPost(postId)

      if (response.success) {
        setIsPinned(response.isPinned)
        setShowMore(false)
        onSuccess?.(response.isPinned ? 'Post fijado' : 'Post desfijado')

        logger.info('Post pin toggled:', { postId, isPinned: response.isPinned })
      }
    } catch (pinError) {
      const errorMessage = 'Error al fijar el post'
      setError(errorMessage)
      onError?.(errorMessage)

      logger.error('Error toggling pin:', {
        error: pinError instanceof Error ? pinError.message : 'Unknown error',
        postId
      })
    }
  }

  // Reportar post
  const handleReport = async (reason: string, description?: string) => {
    try {
      const reportData: {
        contentType: 'post'
        contentId: string
        reason: ReportReason
        description?: string
      } = {
        contentType: 'post',
        contentId: postId,
        reason: reason as ReportReason
      }

      if (description) {
        reportData.description = description
      }

      await createReport(reportData)

      setShowReportModal(false)
      onSuccess?.('Reporte enviado exitosamente. Gracias por ayudarnos a mantener la comunidad segura.')

      logger.info('Post reported successfully:', {
        postId,
        reason
      })
    } catch (reportError) {
      const errorMessage = 'Error al enviar el reporte'
      onError?.(errorMessage)

      logger.error('Error reporting post:', {
        error: reportError instanceof Error ? reportError.message : 'Unknown error',
        postId,
        reason,
        description
      })
      throw reportError
    }
  }

  // Guardar post (local state por ahora)
  const handleSave = () => {
    setIsSaved(!isSaved)
    // TODO: Implementar API call para guardar en backend
    onSuccess?.(isSaved ? 'Post removido de guardados' : 'Post guardado')
  }

  return {
    // Estados
    isEditing,
    editCaption,
    isPinned,
    isDeleting,
    showDeleteConfirm,
    showReportModal,
    showMore,
    isSaved,
    error,

    // Refs
    moreMenuRef,

    // Setters
    setIsEditing,
    setEditCaption,
    setShowDeleteConfirm,
    setShowReportModal,
    setShowMore,
    setIsSaved,

    // Acciones
    handleEdit,
    handleDelete,
    handleTogglePin,
    handleReport,
    handleSave,
  }
}

