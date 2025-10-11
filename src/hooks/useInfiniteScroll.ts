import { useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  threshold?: number
}

/**
 * Hook personalizado para implementar scroll infinito
 * @param options - Configuración del scroll infinito
 * @returns Ref para el elemento observador
 */
export function useInfiniteScroll({
  loading,
  hasMore,
  onLoadMore,
  threshold = 1.0
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<HTMLDivElement | null>(null)
  const observerInstance = useRef<IntersectionObserver | null>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry && entry.isIntersecting && hasMore && !loading) {
        onLoadMore()
      }
    },
    [hasMore, loading, onLoadMore]
  )

  useEffect(() => {
    const element = observerRef.current
    if (!element) return

    // Limpiar observador anterior si existe
    if (observerInstance.current) {
      observerInstance.current.disconnect()
    }

    // Crear nuevo observador
    observerInstance.current = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin: '100px' // Cargar antes de llegar al final
    })

    observerInstance.current.observe(element)

    // Cleanup
    return () => {
      if (observerInstance.current) {
        observerInstance.current.disconnect()
      }
    }
  }, [handleObserver, threshold])

  return observerRef
}

