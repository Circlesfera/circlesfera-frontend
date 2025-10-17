import { useState, useEffect, useCallback } from 'react'
import { Reel } from '../types'
import { reelService } from '../services/reelService'
import logger from '@/utils/logger'

interface UseReelOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

export const useReel = (id: string, options: UseReelOptions = {}) => {
  const { autoRefresh = false, refreshInterval = 10000 } = options

  const [reel, setReel] = useState<Reel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReel = useCallback(async () => {
    try {
      const reelData = await reelService.getReel(id)
      setReel(reelData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading reel')
      logger.error('Error fetching reel', err)
    }
  }, [id])

  const likeReel = useCallback(async () => {
    if (!reel) return

    try {
      await reelService.likeReel(id)
      setReel(prev => prev ? { ...prev, isLiked: true, likes: [...prev.likes, 'current-user'] } : null)
    } catch (err) {
      logger.error('Error liking reel', err)
      throw err
    }
  }, [id, reel])

  const unlikeReel = useCallback(async () => {
    if (!reel) return

    try {
      await reelService.unlikeReel(id)
      setReel(prev => prev ? { ...prev, isLiked: false, likes: prev.likes.filter(likeId => likeId !== 'current-user') } : null)
    } catch (err) {
      logger.error('Error unliking reel', err)
      throw err
    }
  }, [id, reel])

  const deleteReel = useCallback(async () => {
    try {
      await reelService.deleteReel(id)
      setReel(null)
    } catch (err) {
      logger.error('Error deleting reel', err)
      throw err
    }
  }, [id])

  // Initial load
  useEffect(() => {
    const loadReel = async () => {
      setLoading(true)
      await fetchReel()
      setLoading(false)
    }

    loadReel()
  }, [fetchReel])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !reel) return

    const interval = setInterval(() => {
      fetchReel()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchReel, reel])

  return {
    reel,
    loading,
    error,
    refresh: fetchReel,
    likeReel,
    unlikeReel,
    deleteReel
  }
}
