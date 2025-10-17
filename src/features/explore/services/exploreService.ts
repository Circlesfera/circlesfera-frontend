import api from '@/services/api'
import { ExplorePost, ExploreUser, ExploreSearchOptions } from '../types'
import logger from '@/utils/logger'

export interface ExploreResponse {
  posts: ExplorePost[]
  users: ExploreUser[]
  total: number
  page: number
  limit: number
}

export const getExploreContent = async (options: ExploreSearchOptions = {}): Promise<ExploreResponse> => {
  try {
    const params = new URLSearchParams()

    if (options.query) params.append('query', options.query)
    if (options.page) params.append('page', options.page.toString())
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.filters?.type) params.append('type', options.filters.type)
    if (options.filters?.sortBy) params.append('sortBy', options.filters.sortBy)
    if (options.filters?.hashtags?.length) {
      options.filters.hashtags.forEach(tag => params.append('hashtags', tag))
    }

    const response = await api.get(`/explore?${params.toString()}`)
    return response.data
  } catch (error) {
    logger.error('Error fetching explore content', error)
    throw new Error('Error fetching explore content')
  }
}

export const getTrendingPosts = async (page = 1, limit = 20): Promise<{
  posts: ExplorePost[]
  total: number
  page: number
  limit: number
}> => {
  try {
    const response = await api.get(`/explore/trending?page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    logger.error('Error fetching trending posts', error)
    throw new Error('Error fetching trending posts')
  }
}

export const getUserSuggestions = async (limit = 10): Promise<ExploreUser[]> => {
  try {
    const response = await api.get(`/explore/suggestions?limit=${limit}`)
    return response.data.users
  } catch (error) {
    logger.error('Error fetching user suggestions', error)
    throw new Error('Error fetching user suggestions')
  }
}

export const searchContent = async (query: string, page = 1, limit = 20): Promise<ExploreResponse> => {
  try {
    const response = await api.get(`/explore/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    logger.error('Error searching content', error)
    throw new Error('Error searching content')
  }
}

export const exploreService = {
  getExploreContent,
  getTrendingPosts,
  getUserSuggestions,
  searchContent
}
