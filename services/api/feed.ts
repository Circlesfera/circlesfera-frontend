import { apiClient } from './client';
import type { FeedCursorResponse } from './types/feed';

interface FetchFeedParams {
  readonly cursor?: string | null;
  readonly limit?: number;
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

