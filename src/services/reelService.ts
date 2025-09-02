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

// Función de prueba para debuggear
export const testReelsAPI = async (username: string) => {
  try {
    console.log('🧪 TEST: Probando API de reels directamente');
    
    // Probar con fetch nativo
    const fetchUrl = `http://localhost:5001/api/reels/user/${username}`;
    console.log('🧪 TEST: Probando con fetch a:', fetchUrl);
    
    const fetchResponse = await fetch(fetchUrl);
    console.log('🧪 TEST: Fetch response status:', fetchResponse.status);
    console.log('🧪 TEST: Fetch response ok:', fetchResponse.ok);
    
    if (fetchResponse.ok) {
      const fetchData = await fetchResponse.json();
      console.log('🧪 TEST: Fetch data:', fetchData);
    } else {
      console.log('🧪 TEST: Fetch error:', fetchResponse.statusText);
    }
    
    // Probar con axios
    console.log('🧪 TEST: Probando con axios');
    const axiosResponse = await api.get(`/api/reels/user/${username}`);
    console.log('🧪 TEST: Axios response status:', axiosResponse.status);
    console.log('🧪 TEST: Axios data:', axiosResponse.data);
    
    return { success: true, fetch: fetchResponse.status, axios: axiosResponse.status };
  } catch (error: any) {
    console.error('🧪 TEST: Error en test:', error);
    console.error('🧪 TEST: Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL
    });
    return { success: false, error: error.message };
  }
};

// Obtener reels de un usuario específico
export const getUserReels = async (username: string, page: number = 1, limit: number = 10): Promise<GetReelsResponse> => {
  try {
    const url = `/api/reels/user/${username}?page=${page}&limit=${limit}`;
    console.log('🔄 getUserReels llamando a:', url);
    console.log('🔄 Base URL configurada:', 'http://localhost:5001/api');
    console.log('🔄 URL completa sería:', `http://localhost:5001${url}`);
    
    // Verificar la configuración de axios
    console.log('🔄 Configuración de axios:', {
      baseURL: (api as any).defaults?.baseURL,
      timeout: (api as any).defaults?.timeout,
      headers: (api as any).defaults?.headers
    });
    
    const response = await api.get(url);
    console.log('✅ getUserReels respuesta exitosa:', response.status);
    return response.data;
  } catch (error: unknown) {
    console.error('❌ Error fetching user reels:', error);
    console.error('❌ Error details:', {
      message: (error as any).message,
      status: (error as any).response?.status,
      statusText: (error as any).response?.statusText,
      url: (error as any).config?.url,
      method: (error as any).config?.method,
      baseURL: (error as any).config?.baseURL
    });
    
    // Loggear el error completo de forma expandida
    console.error('❌ Error completo expandido:');
    console.error('Error object:', JSON.stringify(error, null, 2));
    console.error('Error response:', JSON.stringify((error as any).response, null, 2));
    console.error('Error config:', JSON.stringify((error as any).config, null, 2));
    
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
  } catch (error: any) {
    console.error('Error searching reels by hashtag:', error);
    throw error;
  }
};

// Obtener reels trending
export const getTrendingReels = async (timeFrame: 'week' | 'month' = 'week', limit: number = 20): Promise<GetReelsResponse> => {
  try {
    const response = await api.get(`/api/reels/trending?timeFrame=${timeFrame}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
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
