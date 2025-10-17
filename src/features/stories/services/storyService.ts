import api from '@/services/api'
import { CreateStoryData, StoryResponse, StoriesResponse, StoryStats } from '../types'

// Tipos adicionales necesarios
export interface UserWithStories {
  id: string
  username: string
  avatar?: string
  stories: any[] // TODO: Tipar correctamente
  hasViewed: boolean
  latestStory?: any // TODO: Tipar correctamente
}

export interface UsersWithStoriesResponse {
  success: boolean
  users: UserWithStories[]
}

export const getUsersWithStories = async (): Promise<UsersWithStoriesResponse> => {
  try {
    const response = await api.get('/stories/users')
    return response.data
  } catch (_error: unknown) {
    throw new Error('Error obteniendo usuarios con stories')
  }
}

export const storyService = {
  /**
   * Obtener todas las stories activas
   */
  async getStories(): Promise<StoriesResponse> {
    try {
      const response = await api.get('/stories')
      return response.data
    } catch (_error: unknown) {
      throw new Error('Error obteniendo stories')
    }
  },

  /**
   * Obtener stories de un usuario específico
   */
  async getUserStories(userId: string): Promise<StoriesResponse> {
    try {
      const response = await api.get(`/stories/user/${userId}`)
      return response.data
    } catch (_error: unknown) {
      throw new Error('Error obteniendo stories del usuario')
    }
  },

  /**
   * Obtener una story específica
   */
  async getStory(storyId: string): Promise<StoryResponse> {
    try {
      const response = await api.get(`/stories/${storyId}`)
      return response.data
    } catch (_error: unknown) {
      throw new Error('Error obteniendo story')
    }
  },

  /**
   * Crear una nueva story
   */
  async createStory(storyData: CreateStoryData): Promise<StoryResponse> {
    try {
      const formData = new FormData()
      formData.append('type', storyData.type)
      formData.append('media', storyData.media)
      if (storyData.caption) {
        formData.append('caption', storyData.caption)
      }

      const response = await api.post('/stories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (_error: unknown) {
      throw new Error('Error creando story')
    }
  },

  /**
   * Eliminar una story
   */
  async deleteStory(storyId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/stories/${storyId}`)
      return response.data
    } catch (_error: unknown) {
      throw new Error('Error eliminando story')
    }
  },

  /**
   * Marcar story como vista
   */
  async viewStory(storyId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/stories/${storyId}/view`)
      return response.data
    } catch (_error: unknown) {
      throw new Error('Error marcando story como vista')
    }
  },

  /**
   * Obtener estadísticas de una story
   */
  async getStoryStats(storyId: string): Promise<{ success: boolean; data: StoryStats }> {
    try {
      const response = await api.get(`/stories/${storyId}/stats`)
      return response.data
    } catch (_error: unknown) {
      throw new Error('Error obteniendo estadísticas de story')
    }
  },

  /**
   * Obtener feed de stories
   */
  async getStoriesFeed(): Promise<StoriesResponse> {
    try {
      const response = await api.get('/stories/feed')
      return response.data
    } catch (_error: unknown) {
      throw new Error('Error obteniendo feed de stories')
    }
  }
}
