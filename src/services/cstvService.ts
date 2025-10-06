import api from './axios';
import type {
  CSTVVideo,
  CreateCSTVData,
  UpdateCSTVData,
  CSTVFilters,
  CSTVSearchFilters,
  CSTVResponse,
  CSTVSearchResponse,
} from '@/types/cstv';

export const cstvService = {
  // Crear un nuevo video CSTV
  async createVideo(data: CreateCSTVData): Promise<CSTVVideo> {
    const response = await api.post('/cstv', data);
    return response.data.data;
  },

  // Obtener videos CSTV
  async getVideos(filters: CSTVFilters = {}): Promise<CSTVResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.category) params.append('category', filters.category);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const response = await api.get(`/cstv?${params.toString()}`);
    return response.data;
  },

  // Obtener videos trending
  async getTrendingVideos(limit = 20): Promise<CSTVVideo[]> {
    const response = await api.get(`/cstv/trending?limit=${limit}`);
    return response.data.data;
  },

  // Buscar videos
  async searchVideos(filters: CSTVSearchFilters): Promise<CSTVSearchResponse> {
    const params = new URLSearchParams();

    params.append('q', filters.q);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/cstv/search?${params.toString()}`);
    return response.data;
  },

  // Obtener un video específico
  async getVideo(videoId: string): Promise<CSTVVideo> {
    const response = await api.get(`/cstv/${videoId}`);
    return response.data.data;
  },

  // Actualizar un video CSTV
  async updateVideo(videoId: string, data: UpdateCSTVData): Promise<CSTVVideo> {
    const response = await api.put(`/cstv/${videoId}`, data);
    return response.data.data;
  },

  // Eliminar un video CSTV
  async deleteVideo(videoId: string): Promise<void> {
    await api.delete(`/cstv/${videoId}`);
  },

  // Dar like a un video CSTV
  async likeVideo(videoId: string): Promise<{
    likesCount: number;
    isLiked: boolean;
  }> {
    const response = await api.post(`/cstv/${videoId}/like`);
    return response.data.data;
  },

  // Quitar like de un video CSTV
  async unlikeVideo(videoId: string): Promise<{
    likesCount: number;
    isLiked: boolean;
  }> {
    const response = await api.delete(`/cstv/${videoId}/like`);
    return response.data.data;
  },

  // Guardar un video CSTV
  async saveVideo(videoId: string): Promise<{
    savesCount: number;
    isSaved: boolean;
  }> {
    const response = await api.post(`/cstv/${videoId}/save`);
    return response.data.data;
  },

  // Quitar de guardados un video CSTV
  async unsaveVideo(videoId: string): Promise<{
    savesCount: number;
    isSaved: boolean;
  }> {
    const response = await api.delete(`/cstv/${videoId}/save`);
    return response.data.data;
  },

  // Toggle like (like/unlike)
  async toggleLike(videoId: string, isCurrentlyLiked: boolean): Promise<{
    likesCount: number;
    isLiked: boolean;
  }> {
    if (isCurrentlyLiked) {
      return this.unlikeVideo(videoId);
    } else {
      return this.likeVideo(videoId);
    }
  },

  // Toggle save (save/unsave)
  async toggleSave(videoId: string, isCurrentlySaved: boolean): Promise<{
    savesCount: number;
    isSaved: boolean;
  }> {
    if (isCurrentlySaved) {
      return this.unsaveVideo(videoId);
    } else {
      return this.saveVideo(videoId);
    }
  },
};
