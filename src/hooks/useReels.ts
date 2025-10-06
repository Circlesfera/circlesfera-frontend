import { useState, useCallback, useEffect } from 'react'
import { getReelsForFeed, Reel } from '@/services/reelService'

interface UseReelsReturn {
  reels: Reel[]
  currentIndex: number
  currentReel: Reel | null
  loading: boolean
  error: string | null
  hasMore: boolean
  goToNext: () => void
  goToPrevious: () => void
  updateReel: (reelId: string, updates: Partial<Reel>) => void
  removeReel: (reelId: string) => void
}

/**
 * Hook personalizado para gestionar reels con infinite scroll
 * @returns Estado y funciones para gestionar reels
 */
export function useReels(): UseReelsReturn {
  const [reels, setReels] = useState<Reel[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const REELS_PER_PAGE = 20

  // Cargar reels iniciales
  useEffect(() => {
    const loadInitialReels = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await getReelsForFeed(1, REELS_PER_PAGE)

        if (response.success && response.reels) {
          setReels(response.reels)
          setHasMore(response.reels.length === REELS_PER_PAGE)
        }
      } catch (err) {
        setError('Error al cargar reels')
        console.error('Error loading reels:', err)
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
    } catch (err) {
      console.error('Error loading more reels:', err)
    }
  }, [hasMore, loading, page])

  // Ir al siguiente reel
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => {
      const nextIndex = prev + 1

      // Si estamos cerca del final, cargar más reels
      if (nextIndex >= reels.length - 3 && hasMore) {
        loadMoreReels()
      }

      // Si llegamos al final de los reels actuales, no avanzar
      if (nextIndex >= reels.length) {
        return prev
      }

      return nextIndex
    })
  }, [reels.length, hasMore, loadMoreReels])

  // Ir al reel anterior
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev))
  }, [])

  // Actualizar un reel específico
  const updateReel = useCallback((reelId: string, updates: Partial<Reel>) => {
    setReels(prev =>
      prev.map(reel =>
        reel._id === reelId ? { ...reel, ...updates } : reel
      )
    )
  }, [])

  // Eliminar un reel
  const removeReel = useCallback((reelId: string) => {
    setReels(prev => {
      const filtered = prev.filter(reel => reel._id !== reelId)
      // Si eliminamos el reel actual, ajustar el índice
      if (filtered.length > 0 && currentIndex >= filtered.length) {
        setCurrentIndex(filtered.length - 1)
      }
      return filtered
    })
  }, [currentIndex])

  // Obtener reel actual
  const currentReel = reels[currentIndex] || null

  return {
    reels,
    currentIndex,
    currentReel,
    loading,
    error,
    hasMore,
    goToNext,
    goToPrevious,
    updateReel,
    removeReel
  }
}

