import api from './axios';

export interface Story {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  type: 'image' | 'video' | 'text';
  content: {
    image?: {
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    };
    video?: {
      url: string;
      duration: number;
      thumbnail: string;
      width?: number;
      height?: number;
    };
    text?: {
      content: string;
      backgroundColor: string;
      textColor: string;
      fontSize: number;
      fontFamily: string;
    };
  };
  caption: string;
  location?: {
    name: string;
    coordinates?: {
      type: string;
      coordinates: number[];
    };
  };
  views: Array<{
    user: string;
    viewedAt: string;
  }>;
  reactions: Array<{
    user: string;
    type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
    createdAt: string;
  }>;
  replies: Array<{
    user: string;
    content: string;
    createdAt: string;
  }>;
  isPublic: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoryResponse {
  success: boolean;
  stories: Story[];
  message?: string;
}

export interface SingleStoryResponse {
  success: boolean;
  story: Story;
  message?: string;
}

// Obtener historias para el feed
export const getStoriesForFeed = async (token: string): Promise<StoryResponse> => {
  const res = await api.get('/stories/feed', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Obtener historias de un usuario específico
export const getUserStories = async (username: string): Promise<StoryResponse> => {
  const res = await api.get(`/stories/user/${username}`);
  return res.data;
};

// Obtener una historia específica
export const getStory = async (id: string, token: string): Promise<SingleStoryResponse> => {
  const res = await api.get(`/stories/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Crear una nueva historia
export const createStory = async (formData: FormData, token: string): Promise<SingleStoryResponse> => {
  const res = await api.post('/stories', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Crear historia de imagen
export const createImageStory = async (file: File, token: string, caption?: string, location?: string): Promise<SingleStoryResponse> => {
  const formData = new FormData();
  formData.append('type', 'image');
  formData.append('image', file);
  if (caption) formData.append('caption', caption);
  if (location) formData.append('location', location);
  
  const res = await api.post('/stories', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Crear historia de video
export const createVideoStory = async (file: File, token: string, caption?: string, location?: string): Promise<SingleStoryResponse> => {
  const formData = new FormData();
  formData.append('type', 'video');
  formData.append('video', file);
  if (caption) formData.append('caption', caption);
  if (location) formData.append('location', location);
  
  const res = await api.post('/stories', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Crear historia de texto
export const createTextStory = async (content: string, token: string, backgroundColor?: string, textColor?: string, fontSize?: number, fontFamily?: string): Promise<SingleStoryResponse> => {
  const formData = new FormData();
  formData.append('type', 'text');
  formData.append('textContent', content);
  if (backgroundColor) formData.append('textStyle[backgroundColor]', backgroundColor);
  if (textColor) formData.append('textStyle[textColor]', textColor);
  if (fontSize) formData.append('textStyle[fontSize]', fontSize.toString());
  if (fontFamily) formData.append('textStyle[fontFamily]', fontFamily);
  
  const res = await api.post('/stories', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Agregar reacción a una historia
export const addReaction = async (storyId: string, reactionType: string, token: string): Promise<{ success: boolean; message: string; reactionsCount: number }> => {
  const res = await api.post(`/stories/${storyId}/reaction`, { reactionType }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Remover reacción de una historia
export const removeReaction = async (storyId: string, token: string): Promise<{ success: boolean; message: string; reactionsCount: number }> => {
  const res = await api.delete(`/stories/${storyId}/reaction`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Agregar respuesta a una historia
export const addReply = async (storyId: string, content: string, token: string): Promise<{ success: boolean; message: string; repliesCount: number }> => {
  const res = await api.post(`/stories/${storyId}/reply`, { content }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Eliminar una historia
export const deleteStory = async (storyId: string, token: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.delete(`/stories/${storyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
