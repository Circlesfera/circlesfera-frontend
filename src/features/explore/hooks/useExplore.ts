import { useState, useEffect, useCallback } from 'react'
import { ExplorePost, ExploreUser, ExploreSearchOptions } from '../types'
import { exploreService } from '../services/exploreService'
import logger from '@/utils/logger'

interface UseExploreOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

export const useExplore = (options: ExploreSearchOptions = {}, hooksOptions: UseExploreOptions = {}) => {
  const { autoRefresh = true, refreshInterval = 30000 } = hooksOptions

  const [posts, setPosts] = useState<ExplorePost[]>([])
  const [users, setUsers] = useState<ExploreUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const fetchContent = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true)
      const searchOptions = {
        ...options,
        page: pageNum,
        limit: 20
      }

      const response = await exploreService.getExploreContent(searchOptions)

      if (append) {
        setPosts(prev => [...prev, ...response.posts])
      } else {
        setPosts(response.posts)
      }

      setUsers(response.users)
      setTotal(response.total)
      setPage(response.page)
      setHasMore(response.posts.length === 20)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading explore content')
      logger.error('Error fetching explore content', err)
    } finally {
      setLoading(false)
    }
  }, [options])

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return
    fetchContent(page + 1, true)
  }, [hasMore, loading, page, fetchContent])

  const refresh = useCallback(() => {
    fetchContent(1, false)
  }, [fetchContent])

  const updatePost = useCallback((updatedPost: ExplorePost) => {
    setPosts(prev => prev.map(post =>
      post.id === updatedPost.id ? updatedPost : post
    ))
  }, [])

  const removePost = useCallback((postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId))
  }, [])

  const updateUser = useCallback((updatedUser: ExploreUser) => {
    setUsers(prev => prev.map(user =>
      user.id === updatedUser.id ? updatedUser : user
    ))
  }, [])

  // Initial load
  useEffect(() => {
    fetchContent(1, false)
  }, [fetchContent])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchContent(1, false)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchContent])

  return {
    posts,
    users,
    total,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
    updatePost,
    removePost,
    updateUser
  }
}
