import { apiClient } from './client';

export interface StoryMedia {
  id: string;
  kind: 'image' | 'video';
  url: string;
  thumbnailUrl: string;
  durationMs?: number;
  width?: number;
  height?: number;
}

export interface StoryUser {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  isVerified: boolean;
}

export interface StoryItem {
  id: string;
  author: StoryUser;
  media: StoryMedia;
  viewCount: number;
  hasViewed: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface StoryGroup {
  author: StoryUser;
  stories: StoryItem[];
}

export interface CreateStoryPayload {
  media: StoryMedia;
}

export interface CreateStoryResponse {
  story: StoryItem;
}

export interface StoryFeedResponse {
  groups: StoryGroup[];
}

export interface UserStoriesResponse {
  stories: StoryItem[];
}

export interface StoryResponse {
  story: StoryItem;
}

/**
 * Crea una nueva story.
 */
export const createStory = async (payload: CreateStoryPayload): Promise<CreateStoryResponse> => {
  const { data } = await apiClient.post<CreateStoryResponse>('/stories', payload);
  return data;
};

/**
 * Obtiene el feed de stories (agrupadas por usuario).
 */
export const getStoryFeed = async (): Promise<StoryFeedResponse> => {
  const { data } = await apiClient.get<StoryFeedResponse>('/stories/feed');
  return data;
};

/**
 * Obtiene las stories de un usuario específico.
 */
export const getUserStories = async (userId: string): Promise<UserStoriesResponse> => {
  const { data } = await apiClient.get<UserStoriesResponse>(`/stories/user/${userId}`);
  return data;
};

/**
 * Obtiene una story específica por ID.
 */
export const getStoryById = async (storyId: string): Promise<StoryResponse> => {
  const { data } = await apiClient.get<StoryResponse>(`/stories/${storyId}`);
  return data;
};

/**
 * Marca una story como vista.
 */
export const viewStory = async (storyId: string): Promise<void> => {
  await apiClient.post(`/stories/${storyId}/view`);
};

export interface StoryViewersResponse {
  viewers: StoryUser[];
  count: number;
}

/**
 * Obtiene la lista de usuarios que vieron una story (solo para el autor).
 */
export const getStoryViewers = async (storyId: string, limit = 50): Promise<StoryViewersResponse> => {
  const { data } = await apiClient.get<StoryViewersResponse>(`/stories/${storyId}/viewers`, {
    params: { limit }
  });
  return data;
};

