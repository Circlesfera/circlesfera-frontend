import api from './axios';
import type {
  LiveStream,
  CreateLiveStreamData,
  StartLiveStreamData,
  EndLiveStreamData,
  LiveStreamFilters,
  LiveComment,
  CreateLiveCommentData,
  LiveCommentFilters,
  LiveStreamStats,
} from '@/types/live';
import type { CSTVVideo } from '@/types/cstv';

export const liveStreamService = {
  // Crear una nueva transmisión en vivo
  async createLiveStream(data: CreateLiveStreamData): Promise<LiveStream> {
    const response = await api.post('/live-streams', data);
    return response.data.data;
  },

  // Obtener transmisiones en vivo
  async getLiveStreams(filters: LiveStreamFilters = {}): Promise<{
    data: LiveStream[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/live-streams?${params.toString()}`);
    return response.data;
  },

  // Obtener una transmisión específica
  async getLiveStream(streamId: string): Promise<LiveStream> {
    const response = await api.get(`/live-streams/${streamId}`);
    return response.data.data;
  },

  // Iniciar una transmisión en vivo
  async startLiveStream(
    streamId: string,
    data: StartLiveStreamData
  ): Promise<LiveStream> {
    const response = await api.put(`/live-streams/${streamId}/start`, data);
    return response.data.data;
  },

  // Terminar una transmisión en vivo
  async endLiveStream(
    streamId: string,
    data: EndLiveStreamData = {}
  ): Promise<{ liveStream: LiveStream; cstvVideo?: CSTVVideo }> {
    const response = await api.put(`/live-streams/${streamId}/end`, data);
    return response.data.data;
  },

  // Agregar viewer a la transmisión
  async addViewer(streamId: string): Promise<{
    currentViewers: number;
    totalViewers: number;
    peakViewers: number;
  }> {
    const response = await api.post(`/live-streams/${streamId}/viewer`);
    return response.data.data;
  },

  // Remover viewer de la transmisión
  async removeViewer(streamId: string): Promise<{
    currentViewers: number;
    totalViewers: number;
    peakViewers: number;
  }> {
    const response = await api.delete(`/live-streams/${streamId}/viewer`);
    return response.data.data;
  },

  // Invitar co-host
  async inviteCoHost(streamId: string, userId: string): Promise<LiveStream> {
    const response = await api.post(`/live-streams/${streamId}/invite-cohost`, {
      userId,
    });
    return response.data.data;
  },
};

export const liveCommentService = {
  // Crear un comentario en transmisión en vivo
  async createComment(
    streamId: string,
    data: CreateLiveCommentData
  ): Promise<LiveComment> {
    const response = await api.post(`/live-streams/${streamId}/comments`, data);
    return response.data.data;
  },

  // Obtener comentarios de una transmisión
  async getComments(
    streamId: string,
    filters: LiveCommentFilters = {}
  ): Promise<{
    data: LiveComment[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  }> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.since) params.append('since', filters.since);
    if (filters.type) params.append('type', filters.type);
    if (filters.sortByPinned !== undefined) {
      params.append('sortByPinned', filters.sortByPinned.toString());
    }

    const response = await api.get(
      `/live-streams/${streamId}/comments?${params.toString()}`
    );
    return response.data;
  },

  // Reaccionar a un comentario
  async reactToComment(
    streamId: string,
    commentId: string,
    reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'angry'
  ): Promise<{
    reactionCount: number;
    userReaction: string;
  }> {
    const response = await api.post(
      `/live-streams/${streamId}/comments/${commentId}/react`,
      { reactionType }
    );
    return response.data.data;
  },

  // Remover reacción de un comentario
  async removeReaction(
    streamId: string,
    commentId: string
  ): Promise<{
    reactionCount: number;
    userReaction: null;
  }> {
    const response = await api.delete(
      `/live-streams/${streamId}/comments/${commentId}/react`
    );
    return response.data.data;
  },

  // Moderar un comentario
  async moderateComment(
    streamId: string,
    commentId: string,
    action: 'hide' | 'delete' | 'pin' | 'unpin',
    reason?: string
  ): Promise<{ success: boolean; data?: unknown; message?: string }> {
    const response = await api.put(
      `/live-streams/${streamId}/comments/${commentId}/moderate`,
      { action, reason }
    );
    return response.data.data;
  },

  // Obtener estadísticas de comentarios
  async getCommentStats(streamId: string): Promise<LiveStreamStats> {
    const response = await api.get(`/live-streams/${streamId}/comments/stats`);
    return response.data.data;
  },

  // Obtener transmisiones en vivo de un usuario específico
  async getUserLiveStreams(username: string, page = 1, limit = 20, status?: string): Promise<{
    data: LiveStream[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const response = await api.get(`/${username}/live?${params.toString()}`);
    return response.data;
  },
};
