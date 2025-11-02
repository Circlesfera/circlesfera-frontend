import { apiClient } from './client';
import type { FeedItem } from './types/feed';

export interface SaveResponse {
  message: string;
  saved: boolean;
}

export interface SavedPostsResponse {
  data: FeedItem[];
  nextCursor: string | null;
}

export const savePost = async (postId: string): Promise<SaveResponse> => {
  const { data } = await apiClient.post<SaveResponse>(`/posts/${postId}/save`);
  return data;
};

export const unsavePost = async (postId: string): Promise<SaveResponse> => {
  const { data } = await apiClient.delete<SaveResponse>(`/posts/${postId}/save`);
  return data;
};

export const fetchSavedPosts = async (cursor?: string | null, limit = 20): Promise<SavedPostsResponse> => {
  const { data } = await apiClient.get<SavedPostsResponse>('/saved', {
    params: { cursor: cursor ?? undefined, limit }
  });
  return data;
};

