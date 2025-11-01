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

interface CreatePostResponse {
  readonly post: FeedItem;
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

