import api from './axios';

export interface LongVideo {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  title: string;
  description: string;
  video: {
    url: string;
    thumbnail?: string;
    duration: number;
    width: number;
    height: number;
  };
  category: string;
  tags: string[];
  location?: {
    name: string;
    coordinates?: {
      type: string;
      coordinates: number[];
    };
  };
  isPublic: boolean;
  allowComments: boolean;
  allowDownloads: boolean;
  isMonetized: boolean;
  views: Array<{
    user: string;
    viewedAt: Date;
    watchTime: number;
  }>;
  likes: Array<{
    user: string;
    createdAt: Date;
  }>;
  comments: Array<{
    user: string;
    content: string;
    createdAt: Date;
    likes: Array<{
      user: string;
      createdAt: Date;
    }>;
    replies: Array<{
      user: string;
      content: string;
      createdAt: Date;
    }>;
  }>;
  shares: Array<{
    user: string;
    sharedAt: Date;
    platform: string;
  }>;
  downloads: Array<{
    user: string;
    downloadedAt: Date;
  }>;
  isDeleted: boolean;
  isArchived: boolean;
  isFeatured: boolean;
  metadata: {
    fileSize: number;
    mimeType: string;
    originalName: string;
    codec: string;
    bitrate: number;
    fps: number;
  };
  monetization: {
    isEnabled: boolean;
    adBreaks: Array<{
      time: number;
      duration: number;
    }>;
    sponsorships: Array<{
      sponsor: string;
      startTime: number;
      endTime: number;
      description: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLongVideoResponse {
  success: boolean;
  message: string;
  longVideo?: LongVideo;
}

export interface GetLongVideosResponse {
  success: boolean;
  longVideos: LongVideo[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GetLongVideoResponse {
  success: boolean;
  longVideo: LongVideo;
}

export interface LikeLongVideoResponse {
  success: boolean;
  message: string;
  isLiked: boolean;
}

export interface CommentLongVideoResponse {
  success: boolean;
  message: string;
  comment?: any;
}

export interface DeleteLongVideoResponse {
  success: boolean;
  message: string;
}

export interface GetCategoriesResponse {
  success: boolean;
  categories: string[];
}

export interface SearchLongVideosResponse {
  success: boolean;
  longVideos: LongVideo[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Crear un nuevo video largo
export const createLongVideo = async (formData: FormData): Promise<CreateLongVideoResponse> => {
  try {
    const response = await api.post('/api/long-videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating long video:', error);
    throw error;
  }
};

// Obtener videos largos para el feed
export const getLongVideosForFeed = async (
  page: number = 1, 
  limit: number = 10,
  category?: string,
  sortBy: 'newest' | 'popular' | 'trending' = 'newest'
): Promise<GetLongVideosResponse> => {
  try {
    let url = `/api/long-videos/feed?page=${page}&limit=${limit}&sortBy=${sortBy}`;
    if (category) {
      url += `&category=${category}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching long videos for feed:', error);
    throw error;
  }
};

// Obtener videos largos de un usuario específico
export const getUserLongVideos = async (
  username: string, 
  page: number = 1, 
  limit: number = 10
): Promise<GetLongVideosResponse> => {
  try {
    const response = await api.get(`/api/long-videos/user/${username}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user long videos:', error);
    throw error;
  }
};

// Obtener un video largo específico
export const getLongVideo = async (videoId: string): Promise<GetLongVideoResponse> => {
  try {
    const response = await api.get(`/api/long-videos/${videoId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching long video:', error);
    throw error;
  }
};

// Dar like a un video largo
export const likeLongVideo = async (videoId: string): Promise<LikeLongVideoResponse> => {
  try {
    const response = await api.post(`/api/long-videos/${videoId}/like`);
    return response.data;
  } catch (error: any) {
    console.error('Error liking long video:', error);
    throw error;
  }
};

// Quitar like de un video largo
export const unlikeLongVideo = async (videoId: string): Promise<LikeLongVideoResponse> => {
  try {
    const response = await api.delete(`/api/long-videos/${videoId}/like`);
    return response.data;
  } catch (error: any) {
    console.error('Error unliking long video:', error);
    throw error;
  }
};

// Comentar un video largo
export const commentLongVideo = async (videoId: string, content: string): Promise<CommentLongVideoResponse> => {
  try {
    const response = await api.post(`/api/long-videos/${videoId}/comment`, { content });
    return response.data;
  } catch (error: any) {
    console.error('Error commenting long video:', error);
    throw error;
  }
};

// Eliminar un video largo
export const deleteLongVideo = async (videoId: string): Promise<DeleteLongVideoResponse> => {
  try {
    const response = await api.delete(`/api/long-videos/${videoId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting long video:', error);
    throw error;
  }
};

// Obtener categorías disponibles
export const getCategories = async (): Promise<GetCategoriesResponse> => {
  try {
    const response = await api.get('/api/long-videos/categories');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Buscar videos largos
export const searchLongVideos = async (
  query: string,
  page: number = 1,
  limit: number = 10
): Promise<SearchLongVideosResponse> => {
  try {
    const response = await api.get(`/api/long-videos/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    console.error('Error searching long videos:', error);
    throw error;
  }
};

// Verificar si un usuario ha dado like a un video largo
export const hasUserLikedLongVideo = (longVideo: LongVideo, userId: string): boolean => {
  return longVideo.likes.some(like => like.user === userId);
};

// Obtener estadísticas de un video largo
export const getLongVideoStats = (longVideo: LongVideo) => {
  return {
    viewsCount: longVideo.views.length,
    likesCount: longVideo.likes.length,
    commentsCount: longVideo.comments.length,
    sharesCount: longVideo.shares.length,
    downloadsCount: longVideo.downloads.length,
    totalWatchTime: longVideo.views.reduce((total, view) => total + (view.watchTime || 0), 0),
    averageWatchTime: longVideo.views.length > 0 
      ? longVideo.views.reduce((total, view) => total + (view.watchTime || 0), 0) / longVideo.views.length 
      : 0,
    engagementRate: longVideo.views.length > 0 
      ? ((longVideo.likes.length + longVideo.comments.length + longVideo.shares.length) / longVideo.views.length) * 100 
      : 0
  };
};

// Formatear duración del video
export const formatVideoDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

// Formatear tamaño del archivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
