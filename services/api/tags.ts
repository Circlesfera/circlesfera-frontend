import { apiClient } from './client';

export interface Tag {
  id: string;
  userId: string;
  user: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl: string;
  };
  mediaIndex: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  isNormalized: boolean;
}

export interface TaggedPost {
  postId: string;
  mediaIndex: number;
  x: number;
  y: number;
  createdAt: string;
}

export interface CreateTagPayload {
  userId: string;
  mediaIndex: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  isNormalized?: boolean;
}

export interface TagsResponse {
  tags: Tag[];
}

export interface TaggedPostsResponse {
  items: TaggedPost[];
  nextCursor: string | null;
}

export const getTagsByPostId = async (postId: string): Promise<TagsResponse> => {
  const { data } = await apiClient.get<TagsResponse>(`/feed/${postId}/tags`);
  return data;
};

export const createTag = async (postId: string, payload: CreateTagPayload): Promise<{ tag: Tag }> => {
  const { data } = await apiClient.post<{ tag: Tag }>(`/feed/${postId}/tags`, payload);
  return data;
};

export const deleteTag = async (tagId: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.delete<{ success: boolean }>(`/feed/tags/${tagId}`);
  return data;
};

export const getTaggedPosts = async (limit = 20, cursor?: string): Promise<TaggedPostsResponse> => {
  const params: Record<string, string | number> = { limit };
  if (cursor) {
    params.cursor = cursor;
  }
  const { data } = await apiClient.get<TaggedPostsResponse>('/feed/tagged', { params });
  return data;
};

