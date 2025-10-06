import { useState, useCallback, useEffect } from 'react'
import { getFeedPosts, Post } from '@/services/postService'

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

/**
 * Hook personalizado para gestionar el feed de posts
 * @returns Estado y funciones para gestionar el feed
 */
export function useFeed(): UseFeedReturn {
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

      if (response.success) {
        setPosts(response.posts || [])
        setHasMore(response.hasMore ?? (response.posts?.length === POSTS_PER_PAGE))
        setPage(1)
      }
    } catch (err) {
      setError('Error al cargar el feed')
      console.error('Error loading feed:', err)
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
    } catch (err) {
      setError('Error al cargar más posts')
      console.error('Error loading more posts:', err)
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

  // Cargar posts iniciales al montar
  useEffect(() => {
    loadInitialPosts()
  }, [loadInitialPosts])

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

