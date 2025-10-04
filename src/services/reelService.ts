import api from './axios';

export interface Reel {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  video: {
    url: string;
    thumbnail?: string;
    duration: number;
    width: number;
    height: number;
  };
  audio?: {
    title: string;
    artist: string;
  };
  caption: string;
  hashtags: string[];
  location?: string;
  isPublic: boolean;
  allowComments: boolean;
  allowDuets: boolean;
  allowStitches: boolean;
  views: Array<{
    user: string;
    viewedAt: Date;
  }>;
  likes: Array<{
    user: string;
    createdAt: Date;
  }>;
  comments: Array<{
    user: string;
    content: string;
    createdAt: Date;
  }>;
  shares: Array<{
    user: string;
    sharedAt: Date;
    platform: string;
  }>;
  duets: Array<{
    user: string;
    createdAt: Date;
  }>;
  stitches: Array<{
    user: string;
    createdAt: Date;
  }>;
  isDeleted: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReelResponse {
  success: boolean;
  message: string;
  reel?: Reel;
}

export interface GetReelsResponse {
  success: boolean;
  reels: Reel[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  hasMore?: boolean;
}

export interface GetReelResponse {
  success: boolean;
  reel: Reel;
}

export interface LikeReelResponse {
  success: boolean;
  message: string;
  isLiked: boolean;
}

export interface CommentReelResponse {
  success: boolean;
  message: string;
  comment?: {
    _id: string;
    user: string;
    content: string;
    createdAt: Date;
  };
}

export interface DeleteReelResponse {
  success: boolean;
  message: string;
}

// Crear un nuevo reel
export const createReel = async (formData: FormData): Promise<CreateReelResponse> => {
  try {
    const response = await api.post('/api/reels', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: unknown) {
    console.error('Error creating reel:', error);
    throw error;
  }
};

// Obtener reels para el feed
export const getReelsForFeed = async (page: number = 1, limit: number = 10): Promise<GetReelsResponse> => {
  try {
    const response = await api.get(`/api/reels/feed?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching reels for feed:', error);
    throw error;
  }
};


// Obtener reels de un usuario específico
export const getUserReels = async (username: string, page: number = 1, limit: number = 10): Promise<GetReelsResponse> => {
  try {
    const url = `/api/reels/user/${username}?page=${page}&limit=${limit}`;
    const response = await api.get(url);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching user reels:', error);
    throw error;
  }
};

// Obtener un reel específico
export const getReel = async (reelId: string): Promise<GetReelResponse> => {
  try {
    const response = await api.get(`/api/reels/${reelId}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching reel:', error);
    throw error;
  }
};

// Dar like a un reel
export const likeReel = async (reelId: string): Promise<LikeReelResponse> => {
  try {
    const response = await api.post(`/api/reels/${reelId}/like`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error liking reel:', error);
    throw error;
  }
};

// Quitar like de un reel
export const unlikeReel = async (reelId: string): Promise<LikeReelResponse> => {
  try {
    const response = await api.delete(`/api/reels/${reelId}/like`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error unliking reel:', error);
    throw error;
  }
};

// Comentar un reel
export const commentReel = async (reelId: string, content: string): Promise<CommentReelResponse> => {
  try {
    const response = await api.post(`/api/reels/${reelId}/comment`, { content });
    return response.data;
  } catch (error: unknown) {
    console.error('Error commenting reel:', error);
    throw error;
  }
};

// Eliminar un reel
export const deleteReel = async (reelId: string): Promise<DeleteReelResponse> => {
  try {
    const response = await api.delete(`/api/reels/${reelId}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error deleting reel:', error);
    throw error;
  }
};

// Buscar reels por hashtag
export const searchReelsByHashtag = async (hashtag: string, page: number = 1, limit: number = 10): Promise<GetReelsResponse> => {
  try {
    const response = await api.get(`/api/reels/search/hashtag/${hashtag}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error searching reels by hashtag:', error);
    throw error;
  }
};

// Obtener reels trending
export const getTrendingReels = async (timeFrame: 'week' | 'month' = 'week', limit: number = 20): Promise<GetReelsResponse> => {
  try {
    const response = await api.get(`/api/reels/trending?timeFrame=${timeFrame}&limit=${limit}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching trending reels:', error);
    throw error;
  }
};

// Verificar si un usuario ha dado like a un reel
export const hasUserLikedReel = (reel: Reel, userId: string): boolean => {
  return reel.likes.some(like => like.user === userId);
};

// Obtener estadísticas de un reel
export const getReelStats = (reel: Reel) => {
  return {
    viewsCount: reel.views.length,
    likesCount: reel.likes.length,
    commentsCount: reel.comments.length,
    sharesCount: reel.shares.length,
    duetsCount: reel.duets.length,
    stitchesCount: reel.stitches.length,
  };
};
