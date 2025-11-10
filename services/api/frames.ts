import { apiClient } from './client';
import type { FeedCursorResponse, FeedItem } from './types/feed';

interface FetchFramesParams {
  readonly cursor?: string | null;
  readonly limit?: number;
}

export const fetchFramesFeed = async ({ cursor, limit = 20 }: FetchFramesParams): Promise<FeedCursorResponse> => {
  const { data } = await apiClient.get<FeedCursorResponse>('/frames', {
    params: { cursor: cursor ?? undefined, limit }
  });
  return data;
};

export const getFramesByAuthor = async ({
  handle,
  cursor,
  limit = 20
}: {
  readonly handle: string;
  readonly cursor?: string | null;
  readonly limit?: number;
}): Promise<FeedCursorResponse> => {
  const { data } = await apiClient.get<FeedCursorResponse>(`/users/${handle}/frames`, {
    params: { cursor: cursor ?? undefined, limit }
  });
  return data;
};

export const getFrameById = async (frameId: string): Promise<{ frame: FeedItem }> => {
  const { data } = await apiClient.get<{ frame: FeedItem }>(`/frames/${frameId}`);
  return data;
};

interface CreateFramePayload {
  caption: string;
  media: File;
}

export const createFrame = async ({ caption, media }: CreateFramePayload): Promise<{ frame: FeedItem }> => {
  const formData = new FormData();
  formData.append('caption', caption);
  formData.append('media', media);

  const { data } = await apiClient.post<{ frame: FeedItem }>('/frames', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return data;
};
