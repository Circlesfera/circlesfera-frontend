import api from './axios';
import { UserProfile } from './userService';

export interface Post {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
    isVerified?: boolean;
  };
  type: 'image' | 'video' | 'text';
  content: {
    images?: Array<{
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    }>;
    video?: {
      url: string;
      duration: number;
      thumbnail: string;
      width?: number;
      height?: number;
    };
    text?: string;
  };
  caption: string;
  location?: {
    name: string;
    coordinates?: {
      type: string;
      coordinates: number[];
    };
  };
  tags?: string[];
  likes: string[];
  comments: string[];
  views: number;
  shares: number;
  isPublic: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  post: string;
  content: string;
  parentComment?: string;
  replies?: Comment[];
  likes: string[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedResponse {
  success: boolean;
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  hasMore?: boolean;
}

export interface PostResponse {
  success: boolean;
  post: Post;
  message?: string;
}

export interface LikeResponse {
  success: boolean;
  liked: boolean;
  likesCount: number;
}

// Obtener el feed de publicaciones
export const getFeed = async (page = 1, limit = 10): Promise<FeedResponse> => {
  const res = await api.get('/api/posts/feed', {
    params: { page, limit },
  });
  return res.data;
};

// Alias para getFeedPosts (para compatibilidad)
export const getFeedPosts = async (options?: { offset?: number; limit?: number }): Promise<FeedResponse> => {
  const page = options?.offset ? Math.floor(options.offset / (options.limit || 10)) + 1 : 1;
  const limit = options?.limit || 10;
  return getFeed(page, limit);
};

// Obtener posts trending
export const getTrendingPosts = async (limit = 10): Promise<{ success: boolean; posts: Post[] }> => {
  const res = await api.get('/api/posts/trending', {
    params: { limit },
  });
  return res.data;
};

// Obtener posts de un usuario específico
export const getUserPosts = async (username: string, page = 1, limit = 10): Promise<FeedResponse> => {
  const res = await api.get(`/api/posts/user/${username}`, {
    params: { page, limit },
  });
  return res.data;
};

// Obtener un post específico
export const getPostById = async (id: string): Promise<PostResponse> => {
  const res = await api.get(`/api/posts/${id}`);
  return res.data;
};

// Crear una nueva publicación
export const createPost = async (formData: FormData): Promise<PostResponse> => {
  const res = await api.post('/api/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Crear publicación de imagen
export const createImagePost = async (files: File[], caption: string): Promise<PostResponse> => {
  const formData = new FormData();
  formData.append('type', 'image');
  files.forEach((file) => {
    formData.append('images', file);
  });
  formData.append('caption', caption);
  
  const res = await api.post('/api/posts/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Crear publicación de video
export const createVideoPost = async (file: File, caption: string): Promise<PostResponse> => {
  const formData = new FormData();
  formData.append('type', 'video');
  formData.append('video', file);
  formData.append('caption', caption);
  
  const res = await api.post('/api/posts/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Crear publicación de texto
export const createTextPost = async (text: string, caption?: string, location?: string, tags?: string): Promise<PostResponse> => {
  const formData = new FormData();
  formData.append('type', 'text');
  formData.append('text', text);
  if (caption) formData.append('caption', caption);
  if (location) formData.append('location', location);
  if (tags) formData.append('tags', tags);
  
  const res = await api.post('/api/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Dar/quitar like a un post
export const toggleLike = async (postId: string): Promise<LikeResponse> => {
  const res = await api.post(`/api/posts/${postId}/like`, {});
  return res.data;
};

// Obtener likes de un post
export const getPostLikes = async (postId: string): Promise<{ success: boolean; likes: UserProfile[] }> => {
  const res = await api.get(`/api/posts/${postId}/likes`);
  return res.data;
};

// Actualizar un post
export const updatePost = async (postId: string, data: { caption?: string; location?: string; tags?: string }): Promise<PostResponse> => {
  const res = await api.put(`/api/posts/${postId}`, data);
  return res.data;
};

// Eliminar un post
export const deletePost = async (postId: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.delete(`/api/posts/${postId}`);
  return res.data;
};

// Fijar/desfijar post
export const togglePinPost = async (postId: string): Promise<{ success: boolean; message: string; isPinned: boolean }> => {
  const res = await api.patch(`/api/posts/${postId}/pin`);
  return res.data;
};

// Obtener comentarios de un post
export const getComments = async (postId: string, page = 1, limit = 10): Promise<{
  success: boolean;
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> => {
  const res = await api.get(`/api/comments/post/${postId}`, {
    params: { page, limit },
  });
  return res.data;
};

// Obtener respuestas de un comentario
export const getCommentReplies = async (commentId: string, page = 1, limit = 5): Promise<{
  success: boolean;
  replies: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> => {
  const res = await api.get(`/api/comments/${commentId}/replies`, {
    params: { page, limit },
  });
  return res.data;
};

// Crear un comentario
export const createComment = async (postId: string, content: string, parentComment?: string): Promise<{ success: boolean; comment: Comment; message: string }> => {
  const res = await api.post(`/api/comments/post/${postId}`, { content, parentComment });
  return res.data;
};

// Actualizar un comentario
export const updateComment = async (commentId: string, content: string): Promise<{ success: boolean; comment: Comment; message: string }> => {
  const res = await api.put(`/api/comments/${commentId}`, { content });
  return res.data;
};

// Dar/quitar like a un comentario
export const toggleCommentLike = async (commentId: string): Promise<LikeResponse> => {
  const res = await api.post(`/api/comments/${commentId}/like`, {});
  return res.data;
};

// Eliminar un comentario
export const deleteComment = async (commentId: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.delete(`/api/comments/${commentId}`);
  return res.data;
};

// Obtener comentarios de un usuario
export const getUserComments = async (username: string, page = 1, limit = 10): Promise<{
  success: boolean;
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> => {
  const res = await api.get(`/api/comments/user/${username}`, {
    params: { page, limit },
  });
  return res.data;
};
