import { apiClient } from './client';
import type { FeedCursorResponse } from './types/feed';

export interface Hashtag {
  id: string;
  tag: string;
  postCount: number;
  lastUsedAt: number;
  createdAt: string;
  updatedAt: string;
}

export interface HashtagsResponse {
  hashtags: Hashtag[];
}

export const getTrendingHashtags = async (limit = 20): Promise<HashtagsResponse> => {
  const { data } = await apiClient.get<HashtagsResponse>('/hashtags/trending', {
    params: { limit }
  });
  return data;
};

export const searchHashtags = async (query: string, limit = 20): Promise<HashtagsResponse> => {
  const { data } = await apiClient.get<HashtagsResponse>('/hashtags/search', {
    params: { q: query, limit }
  });
  return data;
};

export interface HashtagPostsParams {
  tag: string;
  cursor?: string | null;
  limit?: number;
}

export const getHashtagPosts = async ({ tag, cursor, limit = 20 }: HashtagPostsParams): Promise<FeedCursorResponse> => {
  const { data } = await apiClient.get<FeedCursorResponse>(`/hashtags/${tag}/posts`, {
    params: { cursor: cursor ?? undefined, limit }
  });
  return data;
};

export interface FollowHashtagResponse {
  followed: boolean;
  hashtag: string;
  followId?: string;
}

/**
 * Seguir un hashtag
 */
export const followHashtag = async (tag: string): Promise<FollowHashtagResponse> => {
  const { data } = await apiClient.post<FollowHashtagResponse>(`/hashtags/${tag}/follow`);
  return data;
};

/**
 * Dejar de seguir un hashtag
 */
export const unfollowHashtag = async (tag: string): Promise<FollowHashtagResponse> => {
  const { data } = await apiClient.delete<FollowHashtagResponse>(`/hashtags/${tag}/follow`);
  return data;
};

/**
 * Verificar si sigues un hashtag
 */
export const checkFollowingHashtag = async (tag: string): Promise<FollowHashtagResponse> => {
  const { data } = await apiClient.get<FollowHashtagResponse>(`/hashtags/${tag}/follow`);
  return data;
};

export interface FollowingHashtagsResponse {
  hashtags: Hashtag[];
  count: number;
}

/**
 * Obtener hashtags que sigues
 */
export const getFollowingHashtags = async (limit = 50): Promise<FollowingHashtagsResponse> => {
  const { data } = await apiClient.get<FollowingHashtagsResponse>('/hashtags/following', {
    params: { limit }
  });
  return data;
};

