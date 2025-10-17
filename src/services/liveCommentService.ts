import api from './api'
import {
  LiveComment,
  CreateLiveCommentData,
  LiveCommentFilters,
  LiveStreamStats
} from '@/types/live'
import logger from '@/utils/logger'

export const getComments = async (
  streamId: string,
  filters: LiveCommentFilters = {}
): Promise<{
  data: LiveComment[]
  pagination?: {
    page: number
    limit: number
    total: number
  }
}> => {
  try {
    const params = new URLSearchParams()

    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.since) params.append('since', filters.since)
    if (filters.userId) params.append('userId', filters.userId)
    if (filters.type) params.append('type', filters.type)

    const response = await api.get(`/live-streams/${streamId}/comments?${params.toString()}`)
    return response.data
  } catch (error) {
    logger.error('Error fetching live comments', error)
    throw new Error('Error fetching live comments')
  }
}

export const createComment = async (
  streamId: string,
  data: CreateLiveCommentData
): Promise<LiveComment> => {
  try {
    const response = await api.post(`/live-streams/${streamId}/comments`, data)
    return response.data.comment
  } catch (error) {
    logger.error('Error creating live comment', error)
    throw new Error('Error creating live comment')
  }
}

export const reactToComment = async (
  streamId: string,
  commentId: string,
  reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'angry'
): Promise<{ reactionCount: number; userReaction: string }> => {
  try {
    const response = await api.post(`/live-streams/${streamId}/comments/${commentId}/reactions`, {
      type: reactionType
    })
    return response.data
  } catch (error) {
    logger.error('Error reacting to live comment', error)
    throw new Error('Error reacting to live comment')
  }
}

export const removeReaction = async (
  streamId: string,
  commentId: string
): Promise<{ reactionCount: number; userReaction: null }> => {
  try {
    const response = await api.delete(`/live-streams/${streamId}/comments/${commentId}/reactions`)
    return response.data
  } catch (error) {
    logger.error('Error removing reaction from live comment', error)
    throw new Error('Error removing reaction from live comment')
  }
}

export const moderateComment = async (
  streamId: string,
  commentId: string,
  action: 'hide' | 'delete' | 'pin' | 'unpin',
  reason?: string
): Promise<{ success: boolean; data?: unknown; message?: string }> => {
  try {
    const response = await api.post(`/live-streams/${streamId}/comments/${commentId}/moderate`, {
      action,
      reason
    })
    return response.data
  } catch (error) {
    logger.error('Error moderating live comment', error)
    throw new Error('Error moderating live comment')
  }
}

export const getCommentStats = async (streamId: string): Promise<LiveStreamStats> => {
  try {
    const response = await api.get(`/live-streams/${streamId}/comments/stats`)
    return response.data.stats
  } catch (error) {
    logger.error('Error fetching live comment stats', error)
    throw new Error('Error fetching live comment stats')
  }
}

export const liveCommentService = {
  getComments,
  createComment,
  reactToComment,
  removeReaction,
  moderateComment,
  getCommentStats
}
