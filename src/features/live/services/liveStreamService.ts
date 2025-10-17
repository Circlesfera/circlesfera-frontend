import api from '@/services/api'
import {
  LiveStream,
  CreateLiveStreamData,
  LiveStreamStats,
  LiveChatMessage,
  LiveStreamSearchOptions
} from '../types'

export const createLiveStream = async (data: CreateLiveStreamData): Promise<LiveStream> => {
  try {
    const response = await api.post('/live-streams', data)
    return response.data.liveStream
  } catch (error) {
    throw new Error('Error creating live stream')
  }
}

export const getLiveStream = async (id: string): Promise<LiveStream> => {
  try {
    const response = await api.get(`/live-streams/${id}`)
    return response.data.liveStream
  } catch (error) {
    throw new Error('Error fetching live stream')
  }
}

export const updateLiveStream = async (id: string, data: Partial<CreateLiveStreamData>): Promise<LiveStream> => {
  try {
    const response = await api.put(`/live-streams/${id}`, data)
    return response.data.liveStream
  } catch (error) {
    throw new Error('Error updating live stream')
  }
}

export const deleteLiveStream = async (id: string): Promise<void> => {
  try {
    await api.delete(`/live-streams/${id}`)
  } catch (error) {
    throw new Error('Error deleting live stream')
  }
}

export const startLiveStream = async (id: string): Promise<LiveStream> => {
  try {
    const response = await api.post(`/live-streams/${id}/start`)
    return response.data.liveStream
  } catch (error) {
    throw new Error('Error starting live stream')
  }
}

export const endLiveStream = async (id: string): Promise<LiveStream> => {
  try {
    const response = await api.post(`/live-streams/${id}/end`)
    return response.data.liveStream
  } catch (error) {
    throw new Error('Error ending live stream')
  }
}

export const joinLiveStream = async (id: string): Promise<void> => {
  try {
    await api.post(`/live-streams/${id}/join`)
  } catch (error) {
    throw new Error('Error joining live stream')
  }
}

export const leaveLiveStream = async (id: string): Promise<void> => {
  try {
    await api.post(`/live-streams/${id}/leave`)
  } catch (error) {
    throw new Error('Error leaving live stream')
  }
}

export const likeLiveStream = async (id: string): Promise<void> => {
  try {
    await api.post(`/live-streams/${id}/like`)
  } catch (error) {
    throw new Error('Error liking live stream')
  }
}

export const unlikeLiveStream = async (id: string): Promise<void> => {
  try {
    await api.delete(`/live-streams/${id}/like`)
  } catch (error) {
    throw new Error('Error unliking live stream')
  }
}

export const getLiveStreams = async (options: LiveStreamSearchOptions = {}): Promise<{
  liveStreams: LiveStream[]
  total: number
  page: number
  limit: number
}> => {
  try {
    const params = new URLSearchParams()

    if (options.query) params.append('query', options.query)
    if (options.page) params.append('page', options.page.toString())
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.filters?.category) params.append('category', options.filters.category)
    if (options.filters?.isLive !== undefined) params.append('isLive', options.filters.isLive.toString())
    if (options.filters?.sortBy) params.append('sortBy', options.filters.sortBy)
    if (options.filters?.tags?.length) {
      options.filters.tags.forEach(tag => params.append('tags', tag))
    }

    const response = await api.get(`/live-streams?${params.toString()}`)
    return response.data
  } catch (error) {
    throw new Error('Error fetching live streams')
  }
}

export const getUserLiveStreams = async (userId: string): Promise<LiveStream[]> => {
  try {
    const response = await api.get(`/users/${userId}/live-streams`)
    return response.data.liveStreams
  } catch (error) {
    throw new Error('Error fetching user live streams')
  }
}

export const getLiveStreamStats = async (id: string): Promise<LiveStreamStats> => {
  try {
    const response = await api.get(`/live-streams/${id}/stats`)
    return response.data.stats
  } catch (error) {
    throw new Error('Error fetching live stream stats')
  }
}

export const getLiveStreamChat = async (id: string): Promise<LiveChatMessage[]> => {
  try {
    const response = await api.get(`/live-streams/${id}/chat`)
    return response.data.messages
  } catch (error) {
    throw new Error('Error fetching live stream chat')
  }
}

export const sendChatMessage = async (id: string, message: string): Promise<LiveChatMessage> => {
  try {
    const response = await api.post(`/live-streams/${id}/chat`, { message })
    return response.data.message
  } catch (error) {
    throw new Error('Error sending chat message')
  }
}

export const liveStreamService = {
  createLiveStream,
  getLiveStream,
  updateLiveStream,
  deleteLiveStream,
  startLiveStream,
  endLiveStream,
  joinLiveStream,
  leaveLiveStream,
  likeLiveStream,
  unlikeLiveStream,
  getLiveStreams,
  getUserLiveStreams,
  getLiveStreamStats,
  getLiveStreamChat,
  sendChatMessage
}
