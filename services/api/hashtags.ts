import { apiClient } from './client';

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

export interface HashtagPostsResponse {
  data: Array<{
    id: string;
    caption: string;
    media: Array<{
      id: string;
      kind: 'image' | 'video';
      url: string;
      thumbnailUrl: string;
    }>;
    stats: {
      likes: number;
      comments: number;
      saves: number;
      shares: number;
      views: number;
    };
    createdAt: string;
  }>;
  nextCursor: string | null;
}

export const getHashtagPosts = async ({ tag, cursor, limit = 20 }: HashtagPostsParams): Promise<HashtagPostsResponse> => {
  const { data } = await apiClient.get<HashtagPostsResponse>(`/hashtags/${tag}/posts`, {
    params: { cursor: cursor ?? undefined, limit }
  });
  return data;
};

