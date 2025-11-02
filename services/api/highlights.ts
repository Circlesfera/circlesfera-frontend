import { apiClient } from './client';

export interface HighlightItem {
  id: string;
  name: string;
  storyIds: string[];
  coverImageUrl?: string;
  storyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface HighlightStory {
  id: string;
  media: {
    id: string;
    kind: 'image' | 'video';
    url: string;
    thumbnailUrl: string;
    durationMs?: number;
    width?: number;
    height?: number;
  };
  viewCount: number;
  createdAt: string;
}

export interface HighlightWithStories {
  id: string;
  name: string;
  userId: string;
  stories: HighlightStory[];
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HighlightsResponse {
  highlights: HighlightItem[];
}

export interface CreateHighlightPayload {
  name: string;
}

export interface CreateHighlightResponse {
  highlight: HighlightItem;
}

export interface UpdateHighlightPayload {
  name?: string;
}

export interface UpdateHighlightResponse {
  highlight: HighlightItem;
}

export interface AddStoryToHighlightPayload {
  storyId: string;
}

export interface HighlightDetailResponse {
  highlight: HighlightWithStories;
}

/**
 * Obtiene todos los highlights del usuario autenticado.
 */
export const getHighlights = async (): Promise<HighlightsResponse> => {
  const { data } = await apiClient.get<HighlightsResponse>('/highlights');
  return data;
};

/**
 * Crea un nuevo highlight.
 */
export const createHighlight = async (payload: CreateHighlightPayload): Promise<CreateHighlightResponse> => {
  const { data } = await apiClient.post<CreateHighlightResponse>('/highlights', payload);
  return data;
};

/**
 * Obtiene un highlight específico con sus stories.
 */
export const getHighlightById = async (highlightId: string): Promise<HighlightDetailResponse> => {
  const { data } = await apiClient.get<HighlightDetailResponse>(`/highlights/${highlightId}`);
  return data;
};

/**
 * Actualiza un highlight existente.
 */
export const updateHighlight = async (highlightId: string, payload: UpdateHighlightPayload): Promise<UpdateHighlightResponse> => {
  const { data } = await apiClient.patch<UpdateHighlightResponse>(`/highlights/${highlightId}`, payload);
  return data;
};

/**
 * Elimina un highlight.
 */
export const deleteHighlight = async (highlightId: string): Promise<void> => {
  await apiClient.delete(`/highlights/${highlightId}`);
};

/**
 * Agrega una story a un highlight.
 */
export const addStoryToHighlight = async (highlightId: string, payload: AddStoryToHighlightPayload): Promise<void> => {
  await apiClient.post(`/highlights/${highlightId}/stories`, payload);
};

/**
 * Elimina una story de un highlight.
 */
export const removeStoryFromHighlight = async (highlightId: string, storyId: string): Promise<void> => {
  await apiClient.delete(`/highlights/${highlightId}/stories/${storyId}`);
};

