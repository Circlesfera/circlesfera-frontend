import { useState, useCallback, useEffect } from 'react'
import { getFeedPosts } from '@/services/postService'
import { Post } from '@/types'

interface UseFeedReturn {
  posts: Post[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  updatePost: (postId: string, updates: Partial<Post>) => void
  removePost: (postId: string) => void
}

interface UseFeedOptions {
  isAuthenticated?: boolean
}

/**
 * Hook personalizado para gestionar el feed de posts
 * @param options - Opciones del hook, incluyendo estado de autenticación
 * @returns Estado y funciones para gestionar el feed
 */
export function useFeed(options: UseFeedOptions = {}): UseFeedReturn {
  const { isAuthenticated = true } = options
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const POSTS_PER_PAGE = 10

  // Cargar posts iniciales
  const loadInitialPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getFeedPosts({ offset: 0, limit: POSTS_PER_PAGE })

      console.log('🔍 useFeed - Respuesta del backend:', {
        success: response.success,
        postsCount: response.posts?.length || 0,
        posts: response.posts?.map(p => ({ id: p._id, username: p.user?.username })) || [],
        hasMore: response.hasMore
      })

      if (response.success) {
        setPosts(response.posts || [])
        setHasMore(response.hasMore ?? (response.posts?.length === POSTS_PER_PAGE))
        setPage(1)

        console.log('🔍 useFeed - Posts establecidos en estado:', response.posts?.length || 0)
      } else {
        console.error('🔍 useFeed - Error en respuesta:', response)
      }
    } catch {
      setError('Error al cargar el feed')

    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar más posts
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return

    try {
      setLoadingMore(true)
      setError(null)

      const nextPage = page + 1
      const response = await getFeedPosts({
        offset: (nextPage - 1) * POSTS_PER_PAGE,
        limit: POSTS_PER_PAGE
      })

      if (response.success && response.posts) {
        setPosts(prev => {
          // Evitar duplicados
          const newPosts = response.posts.filter(
            newPost => !prev.some(existingPost => existingPost._id === newPost._id)
          )
          return [...prev, ...newPosts]
        })
        setHasMore(response.hasMore ?? (response.posts.length === POSTS_PER_PAGE))
        setPage(nextPage)
      }
    } catch {
      setError('Error al cargar más posts')

    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, page])

  // Refrescar feed
  const refresh = useCallback(async () => {
    setPage(1)
    setHasMore(true)
    await loadInitialPosts()
  }, [loadInitialPosts])

  // Actualizar un post específico
  const updatePost = useCallback((postId: string, updates: Partial<Post>) => {
    setPosts(prev =>
      prev.map(post =>
        post._id === postId ? { ...post, ...updates } : post
      )
    )
  }, [])

  // Eliminar un post
  const removePost = useCallback((postId: string) => {
    setPosts(prev => prev.filter(post => post._id !== postId))
  }, [])

  // Cargar posts iniciales solo si está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadInitialPosts()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]) // Omitir loadInitialPosts intencionalmente para evitar bucle infinito

  return {
    posts,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    updatePost,
    removePost
  }
}

