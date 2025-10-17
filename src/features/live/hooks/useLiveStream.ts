import { useState, useEffect, useCallback } from 'react'
import { LiveStream, LiveStreamStats, LiveChatMessage } from '../types'
import { liveStreamService } from '../services/liveStreamService'
import logger from '@/utils/logger'

interface UseLiveStreamOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

export const useLiveStream = (id: string, options: UseLiveStreamOptions = {}) => {
  const { autoRefresh = true, refreshInterval = 5000 } = options

  const [stream, setStream] = useState<LiveStream | null>(null)
  const [stats, setStats] = useState<LiveStreamStats | null>(null)
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStream = useCallback(async () => {
    try {
      const [streamData, statsData] = await Promise.all([
        liveStreamService.getLiveStream(id),
        liveStreamService.getLiveStreamStats(id)
      ])

      setStream(streamData)
      setStats(statsData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading stream')
      logger.error('Error fetching live stream', err)
    }
  }, [id])

  const fetchChat = useCallback(async () => {
    try {
      const messages = await liveStreamService.getLiveStreamChat(id)
      setChatMessages(messages)
    } catch (err) {
      logger.error('Error fetching chat messages', err)
    }
  }, [id])

  const sendMessage = useCallback(async (message: string) => {
    try {
      const newMessage = await liveStreamService.sendChatMessage(id, message)
      setChatMessages(prev => [...prev, newMessage])
    } catch (err) {
      logger.error('Error sending chat message', err)
      throw err
    }
  }, [id])

  const likeStream = useCallback(async () => {
    if (!stream) return

    try {
      await liveStreamService.likeLiveStream(id)
      setStream(prev => prev ? { ...prev, likeCount: (prev.likeCount || 0) + 1 } : null)
    } catch (err) {
      logger.error('Error liking stream', err)
      throw err
    }
  }, [id, stream])

  const unlikeStream = useCallback(async () => {
    if (!stream) return

    try {
      await liveStreamService.unlikeLiveStream(id)
      setStream(prev => prev ? { ...prev, likeCount: Math.max((prev.likeCount || 0) - 1, 0) } : null)
    } catch (err) {
      logger.error('Error unliking stream', err)
      throw err
    }
  }, [id, stream])

  const joinStream = useCallback(async () => {
    try {
      await liveStreamService.joinLiveStream(id)
      await fetchStream() // Refresh stream data
    } catch (err) {
      logger.error('Error joining stream', err)
      throw err
    }
  }, [id, fetchStream])

  const leaveStream = useCallback(async () => {
    try {
      await liveStreamService.leaveLiveStream(id)
    } catch (err) {
      logger.error('Error leaving stream', err)
      throw err
    }
  }, [id])

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchStream(), fetchChat()])
      setLoading(false)
    }

    loadData()
  }, [fetchStream, fetchChat])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !stream?.isLive) return

    const interval = setInterval(() => {
      fetchStream()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchStream, stream?.isLive])

  // Auto refresh chat
  useEffect(() => {
    if (!autoRefresh || !stream?.isLive) return

    const chatInterval = setInterval(() => {
      fetchChat()
    }, 2000) // Chat refreshes more frequently

    return () => clearInterval(chatInterval)
  }, [autoRefresh, fetchChat, stream?.isLive])

  return {
    stream,
    stats,
    chatMessages,
    loading,
    error,
    refresh: fetchStream,
    sendMessage,
    likeStream,
    unlikeStream,
    joinStream,
    leaveStream
  }
}
