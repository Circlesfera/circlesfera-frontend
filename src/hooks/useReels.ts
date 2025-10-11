import { useState, useCallback, useEffect } from 'react'
import { getReelsForFeed, Reel, likeReel, unlikeReel } from '@/services/reelService'
import logger from '@/utils/logger'

interface UseReelsReturn {
  reels: Reel[]
  currentIndex: number
  currentReel: Reel | null
  loading: boolean
  error: string | null
  hasMore: boolean
  page: number
  goToNext: () => void
  goToPrevious: () => void
  goToIndex: (index: number) => void
  loadMore: () => Promise<void>
  handleLike: (videoId: string, isLiked: boolean) => Promise<void>
  handleSave: (videoId: string, isSaved: boolean) => Promise<void>
  handleShare: (videoId: string) => Promise<void>
  updateReel: (reelId: string, updates: Partial<Reel>) => void
  removeReel: (reelId: string) => void
}

const REELS_PER_PAGE = 10

export function useReels(): UseReelsReturn {
  const [reels, setReels] = useState<Reel[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  // Cargar reels iniciales
  useEffect(() => {
    const loadInitialReels = async () => {
      try {
        setLoading(true)
        const response = await getReelsForFeed(1, REELS_PER_PAGE)

        if (response.success && response.reels) {
          setReels(response.reels)
          setHasMore(response.reels.length === REELS_PER_PAGE)
        }
      } catch (loadError) {
        const errorMessage = 'Error al cargar reels'
        setError(errorMessage)
        logger.error('Error loading reels:', {
          error: loadError instanceof Error ? loadError.message : 'Unknown error'
        })
      } finally {
        setLoading(false)
      }
    }

    loadInitialReels()
  }, [])

  // Cargar más reels cuando se acerca al final
  const loadMoreReels = useCallback(async () => {
    if (!hasMore || loading) return

    try {
      const nextPage = page + 1
      const response = await getReelsForFeed(nextPage, REELS_PER_PAGE)

      if (response.success && response.reels) {
        setReels(prev => {
          // Evitar duplicados
          const newReels = response.reels.filter(
            newReel => !prev.some(existingReel => existingReel._id === newReel._id)
          )
          return [...prev, ...newReels]
        })
        setHasMore(response.reels.length === REELS_PER_PAGE)
        setPage(nextPage)
      }
    } catch (loadMoreError) {
      logger.error('Error loading more reels:', {
        error: loadMoreError instanceof Error ? loadMoreError.message : 'Unknown error',
        page
      })
      setError('Error al cargar más reels')
    }
  }, [hasMore, loading, page])

  // Ir al siguiente reel
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => {
      const nextIndex = prev + 1
      // Si estamos cerca del final, cargar más
      if (nextIndex >= reels.length - 3 && hasMore && !loading) {
        loadMoreReels()
      }
      return Math.min(nextIndex, reels.length - 1)
    })
  }, [reels.length, hasMore, loading, loadMoreReels])

  // Ir al reel anterior
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }, [])

  // Ir a un índice específico
  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, reels.length - 1)))
  }, [reels.length])

  // Actualizar un reel específico
  const updateReel = useCallback((reelId: string, updates: Partial<Reel>) => {
    setReels(prev =>
      prev.map(reel =>
        reel._id === reelId ? { ...reel, ...updates } : reel
      )
    )
    logger.debug('Reel updated:', { reelId, updates })
  }, [])

  // Eliminar un reel
  const removeReel = useCallback((reelId: string) => {
    setReels(prev => {
      const filtered = prev.filter(reel => reel._id !== reelId)
      // Si eliminamos el reel actual, ajustar el índice
      if (filtered.length > 0 && currentIndex >= filtered.length) {
        setCurrentIndex(filtered.length - 1)
      }
      logger.info('Reel removed:', { reelId, remainingCount: filtered.length })
      return filtered
    })
  }, [currentIndex])

  // Implementar lógica de like/unlike
  const handleLike = useCallback(async (videoId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await unlikeReel(videoId)
        logger.debug('Reel unliked:', { videoId })
      } else {
        await likeReel(videoId)
        logger.debug('Reel liked:', { videoId })
      }

      // Actualizar estado local
      setReels(prev => prev.map(reel =>
        reel._id === videoId ? { ...reel, isLiked: !isLiked } : reel
      ))
    } catch (likeError) {
      logger.error('Error toggling like:', {
        error: likeError instanceof Error ? likeError.message : 'Unknown error',
        videoId,
        isLiked
      })
      setError('Error al dar like')
    }
  }, [])

  // Implementar lógica de guardar/desguardar
  const handleSave = useCallback(async (videoId: string, isSaved: boolean) => {
    try {
      // TODO: Implementar servicio de guardado cuando esté disponible
      logger.info('Save/Unsave reel:', { videoId, isSaved })

      // Actualizar estado local
      setReels(prev => prev.map(reel =>
        reel._id === videoId ? { ...reel, isSaved: !isSaved } : reel
      ))
    } catch (saveError) {
      logger.error('Error toggling save:', {
        error: saveError instanceof Error ? saveError.message : 'Unknown error',
        videoId,
        isSaved
      })
      setError('Error al guardar')
    }
  }, [])

  // Implementar lógica de compartir
  const handleShare = useCallback(async (videoId: string) => {
    try {
      // Usar Web Share API si está disponible
      if (navigator.share) {
        await navigator.share({
          title: 'CircleSfera Reel',
          text: 'Mira este reel en CircleSfera',
          url: `${window.location.origin}/reels/${videoId}`
        })
        logger.info('Reel shared:', { videoId })
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(`${window.location.origin}/reels/${videoId}`)
        logger.info('Reel link copied to clipboard:', { videoId })
      }
    } catch (shareError) {
      logger.error('Error sharing reel:', {
        error: shareError instanceof Error ? shareError.message : 'Unknown error',
        videoId
      })
      setError('Error al compartir')
    }
  }, [])

  return {
    reels,
    currentIndex,
    currentReel: reels[currentIndex] || null,
    loading,
    error,
    hasMore,
    page,
    goToNext,
    goToPrevious,
    goToIndex,
    loadMore: loadMoreReels,
    handleLike,
    handleSave,
    handleShare,
    updateReel,
    removeReel
  }
}
