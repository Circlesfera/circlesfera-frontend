import { useState, useEffect, useCallback } from 'react'
import { Story, StorySearchOptions } from '../types'
import { storyService } from '../services/storyService'
import logger from '@/utils/logger'

interface UseStoriesOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

export const useStories = (options: StorySearchOptions = {}, hooksOptions: UseStoriesOptions = {}) => {
  const { autoRefresh = true, refreshInterval = 30000 } = hooksOptions

  const [stories, setStories] = useState<Story[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const fetchStories = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true)
      const searchOptions = {
        ...options,
        page: pageNum,
        limit: 20
      }

      const response = await storyService.getStories(searchOptions)

      if (append) {
        setStories(prev => [...prev, ...response.stories])
      } else {
        setStories(response.stories)
      }

      setTotal(response.total)
      setPage(response.page)
      setHasMore(response.stories.length === 20)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading stories')
      logger.error('Error fetching stories', err)
    } finally {
      setLoading(false)
    }
  }, [options])

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return
    fetchStories(page + 1, true)
  }, [hasMore, loading, page, fetchStories])

  const refresh = useCallback(() => {
    fetchStories(1, false)
  }, [fetchStories])

  const updateStory = useCallback((updatedStory: Story) => {
    setStories(prev => prev.map(story =>
      story.id === updatedStory.id ? updatedStory : story
    ))
  }, [])

  const removeStory = useCallback((storyId: string) => {
    setStories(prev => prev.filter(story => story.id !== storyId))
  }, [])

  const markAsViewed = useCallback(async (storyId: string) => {
    try {
      await storyService.viewStory(storyId)
      setStories(prev => prev.map(story =>
        story.id === storyId
          ? { ...story, hasViewed: true, views: [...story.views, 'current-user'] }
          : story
      ))
    } catch (err) {
      logger.error('Error marking story as viewed', err)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchStories(1, false)
  }, [fetchStories])

  // Auto refresh for active stories
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Only refresh if showing active stories
      if (options.filters?.isActive === undefined || options.filters.isActive === true) {
        fetchStories(1, false)
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, options.filters?.isActive, fetchStories])

  return {
    stories,
    total,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
    updateStory,
    removeStory,
    markAsViewed
  }
}
