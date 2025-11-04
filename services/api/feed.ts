import { apiClient } from './client';
import type { FeedCursorResponse, FeedItem } from './types/feed';

interface FetchFeedParams {
  readonly cursor?: string | null;
  readonly limit?: number;
}

interface CreatePostPayload {
  readonly caption: string;
  readonly media: File[];
}

interface UpdatePostPayload {
  readonly caption: string;
}

interface SearchPostsParams extends FetchFeedParams {
  readonly q: string;
}

/**
 * Consulta el feed principal del usuario autenticado.
 */
export const fetchHomeFeed = async ({ cursor, limit = 20 }: FetchFeedParams): Promise<FeedCursorResponse> => {
  const response = await apiClient.get<FeedCursorResponse>('/feed', {
    params: { cursor: cursor ?? undefined, limit }
  });

  return response.data;
};

/**
 * Consulta el feed de exploración (posts populares).
 */
export const fetchExploreFeed = async ({ cursor, limit = 20 }: FetchFeedParams): Promise<FeedCursorResponse> => {
  const response = await apiClient.get<FeedCursorResponse>('/feed/explore', {
    params: { cursor: cursor ?? undefined, limit }
  });

  return response.data;
};

/**
 * Consulta el feed de reels (videos cortos).
 */
export const getReelsFeed = async ({ cursor, limit = 20 }: FetchFeedParams): Promise<FeedCursorResponse> => {
  const response = await apiClient.get<FeedCursorResponse>('/feed/reels', {
    params: { cursor: cursor ?? undefined, limit }
  });

  return response.data;
};

/**
 * Consulta posts archivados del usuario autenticado.
 */
export const getArchivedPosts = async ({ cursor, limit = 20 }: FetchFeedParams): Promise<FeedCursorResponse> => {
  const response = await apiClient.get<FeedCursorResponse>('/feed/archived', {
    params: { cursor: cursor ?? undefined, limit }
  });

  return response.data;
};

/**
 * Consulta el feed de menciones del usuario autenticado.
 */
export const fetchMentionsFeed = async ({ cursor, limit = 20 }: FetchFeedParams): Promise<FeedCursorResponse> => {
  const response = await apiClient.get<FeedCursorResponse>('/feed/mentions', {
    params: { cursor: cursor ?? undefined, limit }
  });

  return response.data;
};

/**
 * Busca posts por texto.
 */
export const searchPosts = async ({ q, cursor, limit = 20 }: SearchPostsParams): Promise<FeedCursorResponse> => {
  const response = await apiClient.get<FeedCursorResponse>('/feed/search', {
    params: { q, cursor: cursor ?? undefined, limit }
  });

  return response.data;
};

/**
 * Obtiene un post por ID.
 */
export const getPostById = async (postId: string): Promise<{ post: FeedItem }> => {
  const response = await apiClient.get<{ post: FeedItem }>(`/feed/${postId}`);

  return response.data;
};

/**
 * Obtiene posts relacionados.
 */
export const getRelatedPosts = async (postId: string, limit = 6): Promise<{ posts: FeedItem[] }> => {
  const response = await apiClient.get<{ posts: FeedItem[] }>(`/feed/${postId}/related`, {
    params: { limit }
  });

  return response.data;
};

/**
 * Crea un nuevo post.
 */
export const createPost = async (payload: CreatePostPayload): Promise<{ post: FeedItem }> => {
  const formData = new FormData();
  formData.append('caption', payload.caption);

  payload.media.forEach((file) => {
    formData.append('media', file);
  });

  const response = await apiClient.post<{ post: FeedItem }>('/feed', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

/**
 * Actualiza el caption de un post.
 */
export const updatePost = async (postId: string, payload: UpdatePostPayload): Promise<{ post: FeedItem }> => {
  const response = await apiClient.patch<{ post: FeedItem }>(`/feed/${postId}`, payload);

  return response.data;
};

/**
 * Elimina un post.
 */
export const deletePost = async (postId: string): Promise<void> => {
  await apiClient.delete(`/feed/${postId}`);
};

/**
 * Archiva un post.
 */
export const archivePost = async (postId: string): Promise<void> => {
  await apiClient.post(`/feed/${postId}/archive`);
};

/**
 * Desarchiva un post.
 */
export const unarchivePost = async (postId: string): Promise<void> => {
  await apiClient.delete(`/feed/${postId}/archive`);
};
