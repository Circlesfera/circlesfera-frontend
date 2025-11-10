import { logger } from '@/lib/logger';

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
  try {
    const { data } = await apiClient.get<HashtagsResponse>('/hashtags/trending', {
      params: { limit }
    });
    return data;
  } catch (error) {
    logger.error('Error obteniendo hashtags trending', error);
    throw error;
  }
};

export const searchHashtags = async (query: string, limit = 20): Promise<HashtagsResponse> => {
  try {
    const { data } = await apiClient.get<HashtagsResponse>('/hashtags/search', {
      params: { q: query, limit }
    });
    return data;
  } catch (error) {
    logger.error('Error buscando hashtags', error);
    throw error;
  }
};

export interface HashtagPostsParams {
  tag: string;
  cursor?: string | null;
  limit?: number;
}

export const getHashtagPosts = async ({ tag, cursor, limit = 20 }: HashtagPostsParams): Promise<FeedCursorResponse> => {
  try {
    const { data } = await apiClient.get<FeedCursorResponse>(`/hashtags/${tag}/posts`, {
      params: { cursor: cursor ?? undefined, limit }
    });
    return data;
  } catch (error) {
    logger.error('Error obteniendo posts de hashtag', { error, tag });
    throw error;
  }
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
  try {
    const { data } = await apiClient.post<FollowHashtagResponse>(`/hashtags/${tag}/follow`);
    return data;
  } catch (error) {
    logger.error('Error siguiendo hashtag', { error, tag });
    throw error;
  }
};

/**
 * Dejar de seguir un hashtag
 */
export const unfollowHashtag = async (tag: string): Promise<FollowHashtagResponse> => {
  try {
    const { data } = await apiClient.delete<FollowHashtagResponse>(`/hashtags/${tag}/follow`);
    return data;
  } catch (error) {
    logger.error('Error dejando de seguir hashtag', { error, tag });
    throw error;
  }
};

/**
 * Verificar si sigues un hashtag
 */
export const checkFollowingHashtag = async (tag: string): Promise<FollowHashtagResponse> => {
  try {
    const { data } = await apiClient.get<FollowHashtagResponse>(`/hashtags/${tag}/follow`);
    return data;
  } catch (error) {
    logger.error('Error comprobando seguimiento de hashtag', { error, tag });
    throw error;
  }
};

export interface FollowingHashtagsResponse {
  hashtags: Hashtag[];
  count: number;
}

/**
 * Obtener hashtags que sigues
 */
export const getFollowingHashtags = async (limit = 50): Promise<FollowingHashtagsResponse> => {
  try {
    const { data } = await apiClient.get<FollowingHashtagsResponse>('/hashtags/following', {
      params: { limit }
    });
    return data;
  } catch (error) {
    logger.error('Error obteniendo hashtags seguidos', error);
    throw error;
  }
};

