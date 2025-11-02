import { apiClient } from './client';
import type { FeedCursorResponse, FeedItem } from './types/feed';

interface FetchFeedParams {
  readonly cursor?: string | null;
  readonly limit?: number;
  readonly sortBy?: 'recent' | 'relevance';
}

interface CreatePostPayload {
  readonly caption: string;
  readonly media: File[];
}

interface CreatePostResponse {
  readonly post: FeedItem;
}

/**
 * Consulta el feed principal del usuario autenticado.
 */
export const fetchHomeFeed = async ({ cursor, limit = 20, sortBy = 'recent' }: FetchFeedParams): Promise<FeedCursorResponse> => {
  const response = await apiClient.get<FeedCursorResponse>('/feed', {
    params: { cursor: cursor ?? undefined, limit, sortBy }
  });

  return response.data;
};

/**
 * Consulta el feed de menciones (posts donde el usuario fue mencionado).
 */
export const fetchMentionsFeed = async ({ cursor, limit = 20 }: FetchFeedParams): Promise<FeedCursorResponse> => {
  const response = await apiClient.get<FeedCursorResponse>('/feed/mentions', {
    params: { cursor: cursor ?? undefined, limit }
  });

  return response.data;
};

/**
 * Consulta el feed de explorar (posts populares de usuarios no seguidos).
 */
export const fetchExploreFeed = async ({ cursor, limit = 20 }: FetchFeedParams): Promise<FeedCursorResponse> => {
  const response = await apiClient.get<FeedCursorResponse>('/feed/explore', {
    params: { cursor: cursor ?? undefined, limit }
  });

  return response.data;
};

/**
 * Obtiene un post individual por ID.
 */
export const getPostById = async (postId: string): Promise<CreatePostResponse> => {
  const { data } = await apiClient.get<CreatePostResponse>(`/feed/${postId}`);
  return data;
};

export interface UpdatePostPayload {
  readonly caption: string;
}

/**
 * Actualiza el caption de un post.
 */
export const updatePost = async (postId: string, payload: UpdatePostPayload): Promise<CreatePostResponse> => {
  const { data } = await apiClient.patch<CreatePostResponse>(`/feed/${postId}`, payload);
  return data;
};

/**
 * Elimina un post.
 */
export const deletePost = async (postId: string): Promise<void> => {
  await apiClient.delete(`/feed/${postId}`);
};

/**
 * Obtiene posts relacionados a un post específico.
 */
export const getRelatedPosts = async (postId: string, limit = 6): Promise<{ posts: FeedItem[] }> => {
  const { data } = await apiClient.get<{ posts: FeedItem[] }>(`/feed/${postId}/related`, {
    params: { limit }
  });
  return data;
};

export interface SearchPostsParams {
  q: string;
  limit?: number;
  cursor?: string | null;
}

/**
 * Busca posts por texto en caption o hashtags.
 */
export const searchPosts = async ({ q, limit = 20, cursor }: SearchPostsParams): Promise<FeedCursorResponse> => {
  const params: Record<string, string | number> = { q, limit };
  if (cursor) {
    params.cursor = cursor;
  }
  const { data } = await apiClient.get<FeedCursorResponse>('/feed/search', { params });
  return data;
};

/**
 * Crea una nueva publicación con media.
 */
export const createPost = async ({ caption, media }: CreatePostPayload): Promise<CreatePostResponse> => {
  const formData = new FormData();
  formData.append('caption', caption);
  media.forEach((file) => {
    formData.append('media', file);
  });

  const { data } = await apiClient.post<CreatePostResponse>('/feed', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return data;
};

