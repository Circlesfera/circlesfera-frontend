import { useState, useEffect, useCallback } from 'react'
import { Reel, ReelSearchOptions } from '../types'
import { reelService } from '../services/reelService'
import logger from '@/utils/logger'

interface UseReelsOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

export const useReels = (options: ReelSearchOptions = {}, hooksOptions: UseReelsOptions = {}) => {
  const { autoRefresh = false, refreshInterval = 30000 } = hooksOptions

  const [reels, setReels] = useState<Reel[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const fetchReels = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true)
      const searchOptions = {
        ...options,
        page: pageNum,
        limit: 20
      }

      let response
      if (options.query) {
        response = await reelService.searchReels(options.query, pageNum, 20)
      } else {
        response = await reelService.getReels(pageNum, 20)
      }

      if (append) {
        setReels(prev => [...prev, ...response.reels])
      } else {
        setReels(response.reels)
      }

      setTotal(response.pagination.total)
      setPage(response.pagination.page)
      setHasMore(response.pagination.page < response.pagination.pages)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading reels')
      logger.error('Error fetching reels', err)
    } finally {
      setLoading(false)
    }
  }, [options])

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return
    fetchReels(page + 1, true)
  }, [hasMore, loading, page, fetchReels])

  const refresh = useCallback(() => {
    fetchReels(1, false)
  }, [fetchReels])

  const updateReel = useCallback((updatedReel: Reel) => {
    setReels(prev => prev.map(reel =>
      reel.id === updatedReel.id ? updatedReel : reel
    ))
  }, [])

  const removeReel = useCallback((reelId: string) => {
    setReels(prev => prev.filter(reel => reel.id !== reelId))
  }, [])

  const likeReel = useCallback(async (reelId: string) => {
    try {
      await reelService.likeReel(reelId)
      setReels(prev => prev.map(reel =>
        reel.id === reelId
          ? { ...reel, isLiked: true, likes: [...reel.likes, 'current-user'] }
          : reel
      ))
    } catch (err) {
      logger.error('Error liking reel', err)
      throw err
    }
  }, [])

  const unlikeReel = useCallback(async (reelId: string) => {
    try {
      await reelService.unlikeReel(reelId)
      setReels(prev => prev.map(reel =>
        reel.id === reelId
          ? { ...reel, isLiked: false, likes: reel.likes.filter(id => id !== 'current-user') }
          : reel
      ))
    } catch (err) {
      logger.error('Error unliking reel', err)
      throw err
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchReels(1, false)
  }, [fetchReels])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchReels(1, false)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchReels])

  return {
    reels,
    total,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
    updateReel,
    removeReel,
    likeReel,
    unlikeReel
  }
}
