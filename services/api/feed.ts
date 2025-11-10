import { apiClient } from './client';
import { logger } from '@/lib/logger';
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
  try {
    const response = await apiClient.get<FeedCursorResponse>('/feed', {
      params: { cursor: cursor ?? undefined, limit }
    });

    return response.data;
  } catch (error) {
    logger.error('Error obteniendo feed principal', error);
    throw error;
  }
};

/**
 * Consulta el feed de exploración (posts populares).
 */
export const fetchExploreFeed = async ({ cursor, limit = 20 }: FetchFeedParams): Promise<FeedCursorResponse> => {
  try {
    const response = await apiClient.get<FeedCursorResponse>('/feed/explore', {
      params: { cursor: cursor ?? undefined, limit }
    });

    return response.data;
  } catch (error) {
    logger.error('Error obteniendo feed de exploración', error);
    throw error;
  }
};

/**
 * Consulta el feed de frames (videos cortos).
 */
export const getFramesFeed = async ({ cursor, limit = 20 }: FetchFeedParams): Promise<FeedCursorResponse> => {
  try {
    const response = await apiClient.get<FeedCursorResponse>('/frames', {
      params: { cursor: cursor ?? undefined, limit }
    });

    return response.data;
  } catch (error) {
    logger.error('Error obteniendo feed de frames', error);
    throw error;
  }
};

/**
 * Consulta posts archivados del usuario autenticado.
 */
export const getArchivedPosts = async ({ cursor, limit = 20 }: FetchFeedParams): Promise<FeedCursorResponse> => {
  try {
    const response = await apiClient.get<FeedCursorResponse>('/feed/archived', {
      params: { cursor: cursor ?? undefined, limit }
    });

    return response.data;
  } catch (error) {
    logger.error('Error obteniendo posts archivados', error);
    throw error;
  }
};

/**
 * Consulta el feed de menciones del usuario autenticado.
 */
export const fetchMentionsFeed = async ({ cursor, limit = 20 }: FetchFeedParams): Promise<FeedCursorResponse> => {
  try {
    const response = await apiClient.get<FeedCursorResponse>('/feed/mentions', {
      params: { cursor: cursor ?? undefined, limit }
    });

    return response.data;
  } catch (error) {
    logger.error('Error obteniendo feed de menciones', error);
    throw error;
  }
};

/**
 * Busca posts por texto.
 */
export const searchPosts = async ({ q, cursor, limit = 20 }: SearchPostsParams): Promise<FeedCursorResponse> => {
  try {
    const response = await apiClient.get<FeedCursorResponse>('/feed/search', {
      params: { q, cursor: cursor ?? undefined, limit }
    });

    return response.data;
  } catch (error) {
    logger.error('Error buscando publicaciones', { error, q });
    throw error;
  }
};

/**
 * Obtiene un post por ID.
 */
export const getPostById = async (postId: string): Promise<{ post: FeedItem }> => {
  try {
    const response = await apiClient.get<{ post: FeedItem }>(`/feed/${postId}`);

    return response.data;
  } catch (error) {
    logger.error('Error obteniendo post por ID', { error, postId });
    throw error;
  }
};

/**
 * Obtiene posts relacionados.
 */
export const getRelatedPosts = async (postId: string, limit = 6): Promise<{ posts: FeedItem[] }> => {
  try {
    const response = await apiClient.get<{ posts: FeedItem[] }>(`/feed/${postId}/related`, {
      params: { limit }
    });

    return response.data;
  } catch (error) {
    logger.error('Error obteniendo posts relacionados', { error, postId });
    throw error;
  }
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

  try {
    const response = await apiClient.post<{ post: FeedItem }>('/feed', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    logger.error('Error creando post', error);
    throw error;
  }
};

/**
 * Actualiza el caption de un post.
 */
export const updatePost = async (postId: string, payload: UpdatePostPayload): Promise<{ post: FeedItem }> => {
  try {
    const response = await apiClient.patch<{ post: FeedItem }>(`/feed/${postId}`, payload);

    return response.data;
  } catch (error) {
    logger.error('Error actualizando post', { error, postId });
    throw error;
  }
};

/**
 * Elimina un post.
 */
export const deletePost = async (postId: string): Promise<void> => {
  try {
    await apiClient.delete(`/feed/${postId}`);
  } catch (error) {
    logger.error('Error eliminando post', { error, postId });
    throw error;
  }
};

/**
 * Archiva un post.
 */
export const archivePost = async (postId: string): Promise<void> => {
  try {
    await apiClient.post(`/feed/${postId}/archive`);
  } catch (error) {
    logger.error('Error archivando post', { error, postId });
    throw error;
  }
};

/**
 * Desarchiva un post.
 */
export const unarchivePost = async (postId: string): Promise<void> => {
  try {
    await apiClient.delete(`/feed/${postId}/archive`);
  } catch (error) {
    logger.error('Error desarchivando post', { error, postId });
    throw error;
  }
};
