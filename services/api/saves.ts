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

export interface SavePostPayload {
  collectionId?: string;
}

export const savePost = async (postId: string, collectionId?: string): Promise<SaveResponse> => {
  const { data } = await apiClient.post<SaveResponse>(`/saves/posts/${postId}/save`, { collectionId });
  return data;
};

export const unsavePost = async (postId: string): Promise<SaveResponse> => {
  const { data } = await apiClient.delete<SaveResponse>(`/saves/posts/${postId}/save`);
  return data;
};

export const saveFrame = async (frameId: string, collectionId?: string): Promise<SaveResponse> => {
  const { data } = await apiClient.post<SaveResponse>(`/saves/frames/${frameId}/save`, { collectionId });
  return data;
};

export const unsaveFrame = async (frameId: string): Promise<SaveResponse> => {
  const { data } = await apiClient.delete<SaveResponse>(`/saves/frames/${frameId}/save`);
  return data;
};

export const fetchSavedPosts = async (cursor?: string | null, limit = 20, collectionId?: string): Promise<SavedPostsResponse> => {
  const { data } = await apiClient.get<SavedPostsResponse>('/saves/saved', {
    params: { cursor: cursor ?? undefined, limit, collectionId: collectionId ?? undefined }
  });
  return data;
};

export const fetchSavedFrames = async (cursor?: string | null, limit = 20, collectionId?: string): Promise<SavedPostsResponse> => {
  const { data } = await apiClient.get<SavedPostsResponse>('/saves/frames', {
    params: { cursor: cursor ?? undefined, limit, collectionId: collectionId ?? undefined }
  });
  return data;
};

