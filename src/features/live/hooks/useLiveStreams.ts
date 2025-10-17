import { useState, useEffect, useCallback } from 'react'
import { LiveStream, LiveStreamSearchOptions } from '../types'
import { liveStreamService } from '../services/liveStreamService'
import logger from '@/utils/logger'

interface UseLiveStreamsOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

export const useLiveStreams = (options: LiveStreamSearchOptions = {}, hooksOptions: UseLiveStreamsOptions = {}) => {
  const { autoRefresh = true, refreshInterval = 30000 } = hooksOptions

  const [streams, setStreams] = useState<LiveStream[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const fetchStreams = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true)
      const searchOptions = {
        ...options,
        page: pageNum,
        limit: 20
      }

      const response = await liveStreamService.getLiveStreams(searchOptions)

      if (append) {
        setStreams(prev => [...prev, ...response.liveStreams])
      } else {
        setStreams(response.liveStreams)
      }

      setTotal(response.total)
      setPage(response.page)
      setHasMore(response.liveStreams.length === 20)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading streams')
      logger.error('Error fetching live streams', err)
    } finally {
      setLoading(false)
    }
  }, [options])

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return
    fetchStreams(page + 1, true)
  }, [hasMore, loading, page, fetchStreams])

  const refresh = useCallback(() => {
    fetchStreams(1, false)
  }, [fetchStreams])

  const updateStream = useCallback((updatedStream: LiveStream) => {
    setStreams(prev => prev.map(stream =>
      stream.id === updatedStream.id ? updatedStream : stream
    ))
  }, [])

  const removeStream = useCallback((streamId: string) => {
    setStreams(prev => prev.filter(stream => stream.id !== streamId))
  }, [])

  // Initial load
  useEffect(() => {
    fetchStreams(1, false)
  }, [fetchStreams])

  // Auto refresh for live streams
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Only refresh if we're on the first page and showing live streams
      if (page === 1 && (options.filters?.isLive === undefined || options.filters.isLive === true)) {
        fetchStreams(1, false)
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, page, options.filters?.isLive, fetchStreams])

  return {
    streams,
    total,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
    updateStream,
    removeStream
  }
}
