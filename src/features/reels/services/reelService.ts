import api from '@/services/api'
import logger from '@/utils/logger'

export interface ReelData {
  caption: string
  hashtags: string[]
  location?: { name: string; coordinates: [number, number] }
  audioTitle?: string
  video: File
}

export interface Reel {
  id: string
  userId: string
  caption: string
  videoUrl: string
  thumbnailUrl: string
  hashtags: string[]
  location?: {
    name: string
    coordinates: [number, number]
  }
  audioTitle?: string
  duration: number
  likes: string[]
  comments: any[]
  views: number
  shares: number
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    username: string
    avatar?: string
  }
  isLiked?: boolean
}

export interface CreateReelResponse {
  success: boolean
  reel: Reel
}

export interface ReelsResponse {
  success: boolean
  reels: Reel[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const createReel = async (reelData: ReelData): Promise<Reel> => {
  try {
    const formData = new FormData()

    formData.append('caption', reelData.caption)
    formData.append('video', reelData.video)

    if (reelData.hashtags.length > 0) {
      formData.append('hashtags', JSON.stringify(reelData.hashtags))
    }

    if (reelData.location) {
      formData.append('location', JSON.stringify(reelData.location))
    }

    if (reelData.audioTitle) {
      formData.append('audioTitle', reelData.audioTitle)
    }

    const response = await api.post('/reels', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data.reel
  } catch (error) {
    logger.error('Error creating reel', error)
    throw new Error('Error creating reel')
  }
}

export const getReels = async (page = 1, limit = 20): Promise<ReelsResponse> => {
  try {
    const response = await api.get(`/reels?page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    logger.error('Error fetching reels', error)
    throw new Error('Error fetching reels')
  }
}

export const getReel = async (id: string): Promise<Reel> => {
  try {
    const response = await api.get(`/reels/${id}`)
    return response.data.reel
  } catch (error) {
    logger.error('Error fetching reel', error)
    throw new Error('Error fetching reel')
  }
}

export const likeReel = async (id: string): Promise<void> => {
  try {
    await api.post(`/reels/${id}/like`)
  } catch (error) {
    logger.error('Error liking reel', error)
    throw new Error('Error liking reel')
  }
}

export const unlikeReel = async (id: string): Promise<void> => {
  try {
    await api.delete(`/reels/${id}/like`)
  } catch (error) {
    logger.error('Error unliking reel', error)
    throw new Error('Error unliking reel')
  }
}

export const deleteReel = async (id: string): Promise<void> => {
  try {
    await api.delete(`/reels/${id}`)
  } catch (error) {
    logger.error('Error deleting reel', error)
    throw new Error('Error deleting reel')
  }
}

export const getUserReels = async (userId: string, page = 1, limit = 20): Promise<ReelsResponse> => {
  try {
    const response = await api.get(`/users/${userId}/reels?page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    logger.error('Error fetching user reels', error)
    throw new Error('Error fetching user reels')
  }
}

export const searchReels = async (query: string, page = 1, limit = 20): Promise<ReelsResponse> => {
  try {
    const response = await api.get(`/reels/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    logger.error('Error searching reels', error)
    throw new Error('Error searching reels')
  }
}

export const getTrendingReels = async (page = 1, limit = 20): Promise<ReelsResponse> => {
  try {
    const response = await api.get(`/reels/trending?page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    logger.error('Error fetching trending reels', error)
    throw new Error('Error fetching trending reels')
  }
}

export const reelService = {
  createReel,
  getReels,
  getReel,
  likeReel,
  unlikeReel,
  deleteReel,
  getUserReels,
  searchReels,
  getTrendingReels
}
