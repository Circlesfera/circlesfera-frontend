import api from '@/services/api'
import { CreateReelData, ReelResponse, ReelsResponse, ReelStats } from '../types'

export const reelService = {
  /**
   * Obtener feed de reels
   */
  async getReelsFeed(page = 1, limit = 20): Promise<ReelsResponse> {
    try {
      const response = await api.get(`/reels?page=${page}&limit=${limit}`)
      return response.data
    } catch (_error: unknown) {
      throw new Error('Error obteniendo feed de reels')
    }
  },

  /**
   * Obtener un reel específico
   */
  async getReel(reelId: string): Promise<ReelResponse> {
    try {
      const response = await api.get(`/reels/${reelId}`)
      return response.data
    } catch (_error: unknown) {
      throw new Error('Error obteniendo reel')
    }
  },

  /**
   * Crear un nuevo reel
   */
  async createReel(reelData: CreateReelData): Promise<ReelResponse> {
    try {
      const formData = new FormData()
      formData.append('video', reelData.video)

      if (reelData.caption) formData.append('caption', reelData.caption)
      if (reelData.hashtags) formData.append('hashtags', JSON.stringify(reelData.hashtags))
      if (reelData.location) formData.append('location', JSON.stringify(reelData.location))
      if (reelData.audioTitle) formData.append('audioTitle', reelData.audioTitle)
      if (reelData.audioArtist) formData.append('audioArtist', reelData.audioArtist)
      if (reelData.allowComments !== undefined) formData.append('allowComments', reelData.allowComments.toString())
      if (reelData.allowDuets !== undefined) formData.append('allowDuets', reelData.allowDuets.toString())
      if (reelData.allowStitches !== undefined) formData.append('allowStitches', reelData.allowStitches.toString())

      const response = await api.post('/reels', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (_error: unknown) {
      throw new Error('Error creando reel')
    }
  },

  /**
   * Actualizar un reel
   */
  async updateReel(reelId: string, updateData: { caption?: string; hashtags?: string[] }): Promise<ReelResponse> {
    try {
      const response = await api.put(`/reels/${reelId}`, updateData)
      return response.data
    } catch (_error: unknown) {
      throw new Error('Error actualizando reel')
    }
  },

  /**
   * Eliminar un reel
   */
  async deleteReel(reelId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/reels/${reelId}`)
      return response.data
    } catch (_error: unknown) {
      throw new Error('Error eliminando reel')
    }
  },

  /**
   * Like/Unlike un reel
   */
  async likeReel(reelId: string): Promise<{ success: boolean; data: { liked: boolean }; message: string }> {
    try {
      const response = await api.post(`/reels/${reelId}/like`)
      return response.data
    } catch (_error: unknown) {
      throw new Error('Error dando like al reel')
    }
  },

  /**
   * Obtener reels de un usuario
   */
  async getUserReels(userId: string, page = 1, limit = 20): Promise<ReelsResponse> {
    try {
      const response = await api.get(`/reels/user/${userId}?page=${page}&limit=${limit}`)
      return response.data
    } catch (_error: unknown) {
      throw new Error('Error obteniendo reels del usuario')
    }
  },

  /**
   * Buscar reels
   */
  async searchReels(query: string, page = 1, limit = 20): Promise<ReelsResponse> {
    try {
      const response = await api.get(`/reels/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
      return response.data
    } catch (_error: unknown) {
      throw new Error('Error buscando reels')
    }
  },

  /**
   * Obtener reels trending
   */
  async getTrendingReels(page = 1, limit = 20): Promise<ReelsResponse> {
    try {
      const response = await api.get(`/reels/trending?page=${page}&limit=${limit}`)
      return response.data
    } catch (_error: unknown) {
      throw new Error('Error obteniendo reels trending')
    }
  },

  /**
   * Obtener estadísticas de un reel
   */
  async getReelStats(reelId: string): Promise<{ success: boolean; data: ReelStats }> {
    try {
      const response = await api.get(`/reels/${reelId}/stats`)
      return response.data
    } catch (_error: unknown) {
      throw new Error('Error obteniendo estadísticas del reel')
    }
  }
}
