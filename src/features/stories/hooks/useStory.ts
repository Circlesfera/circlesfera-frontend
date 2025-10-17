import { useState, useEffect, useCallback } from 'react'
import { Story } from '../types'
import { storyService } from '../services/storyService'
import logger from '@/utils/logger'

interface UseStoryOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

export const useStory = (id: string, options: UseStoryOptions = {}) => {
  const { autoRefresh = false, refreshInterval = 10000 } = options

  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStory = useCallback(async () => {
    try {
      const storyData = await storyService.getStory(id)
      setStory(storyData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading story')
      logger.error('Error fetching story', err)
    }
  }, [id])

  const viewStory = useCallback(async () => {
    if (!story) return

    try {
      await storyService.viewStory(id)
      setStory(prev => prev ? { ...prev, hasViewed: true, views: [...prev.views, 'current-user'] } : null)
    } catch (err) {
      logger.error('Error viewing story', err)
    }
  }, [id, story])

  const deleteStory = useCallback(async () => {
    try {
      await storyService.deleteStory(id)
      setStory(null)
    } catch (err) {
      logger.error('Error deleting story', err)
      throw err
    }
  }, [id])

  // Initial load
  useEffect(() => {
    const loadStory = async () => {
      setLoading(true)
      await fetchStory()
      setLoading(false)
    }

    loadStory()
  }, [fetchStory])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !story) return

    const interval = setInterval(() => {
      fetchStory()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchStory, story])

  return {
    story,
    loading,
    error,
    refresh: fetchStory,
    viewStory,
    deleteStory
  }
}
