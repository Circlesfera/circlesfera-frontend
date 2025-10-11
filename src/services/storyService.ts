import api from './axios';
import type { Story, UserWithStories } from '@/types';

// Re-exportar para compatibilidad con imports existentes
export type { Story, UserWithStories };

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

export interface UsersWithStoriesResponse {
  success: boolean;
  users: UserWithStories[];
  message?: string;
}

// Obtener historias para el feed
export const getStoriesForFeed = async (): Promise<StoryResponse> => {
  const res = await api.get('/stories/feed');
  return res.data;
};

// Obtener historias de un usuario específico
export const getUserStories = async (username: string): Promise<StoryResponse> => {
  const res = await api.get(`/${username}/stories`);
  return res.data;
};

// Obtener una historia específica
export const getStory = async (id: string): Promise<SingleStoryResponse> => {
  const res = await api.get(`/stories/${id}`);
  return res.data;
};

// Crear una nueva historia
export const createStory = async (formData: FormData): Promise<SingleStoryResponse> => {
  const res = await api.post('/stories', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Crear historia de imagen
export const createImageStory = async (file: File, caption?: string, location?: string): Promise<SingleStoryResponse> => {
  const formData = new FormData();
  formData.append('type', 'image');
  formData.append('image', file);
  if (caption) formData.append('caption', caption);
  if (location) formData.append('location', location);

  const res = await api.post('/stories', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Crear historia de video
export const createVideoStory = async (file: File, caption?: string, location?: string): Promise<SingleStoryResponse> => {
  const formData = new FormData();
  formData.append('type', 'video');
  formData.append('video', file);
  if (caption) formData.append('caption', caption);
  if (location) formData.append('location', location);

  const res = await api.post('/stories', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Crear historia de texto
export const createTextStory = async (content: string, caption?: string, location?: string, backgroundColor?: string, textColor?: string, fontSize?: number, fontFamily?: string): Promise<SingleStoryResponse> => {
  const formData = new FormData();
  formData.append('type', 'text');
  formData.append('textContent', content);
  if (caption) formData.append('caption', caption);
  if (location) formData.append('location', location);

  // Crear objeto textStyle
  const textStyle = {
    backgroundColor: backgroundColor || '#000000',
    textColor: textColor || '#ffffff',
    fontSize: fontSize || 24,
    fontFamily: fontFamily || 'Arial'
  };

  formData.append('textStyle', JSON.stringify(textStyle));

  const res = await api.post('/stories', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Agregar reacción a una historia
export const addReaction = async (storyId: string, reactionType: string): Promise<{ success: boolean; message: string; reactionsCount: number }> => {
  const res = await api.post(`/stories/${storyId}/reaction`, { reactionType });
  return res.data;
};

// Remover reacción de una historia
export const removeReaction = async (storyId: string): Promise<{ success: boolean; message: string; reactionsCount: number }> => {
  const res = await api.delete(`/stories/${storyId}/reaction`);
  return res.data;
};

// Agregar respuesta a una historia
export const addReply = async (storyId: string, content: string): Promise<{ success: boolean; message: string; repliesCount: number }> => {
  const res = await api.post(`/stories/${storyId}/reply`, { content });
  return res.data;
};

// Eliminar una historia
export const deleteStory = async (storyId: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.delete(`/stories/${storyId}`);
  return res.data;
};

// Obtener usuarios con stories para la barra de stories
export const getUsersWithStories = async (): Promise<UsersWithStoriesResponse> => {
  const res = await api.get('/stories/users');
  return res.data;
};

// Registrar visualización de una story
export const viewStory = async (storyId: string): Promise<{ success: boolean; viewsCount: number }> => {
  const res = await api.post(`/stories/${storyId}/view`);
  return res.data;
};
