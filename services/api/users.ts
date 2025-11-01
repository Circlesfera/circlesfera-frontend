import { apiClient } from './client';

import type { SessionUser } from '@/store/session';

export interface PublicProfile extends SessionUser {}

export const getProfileByHandle = async (handle: string): Promise<PublicProfile> => {
  const { data } = await apiClient.get<{ user: PublicProfile }>(`/users/${handle}`);
  return data.user;
};

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export const updateProfile = async (payload: UpdateProfilePayload): Promise<PublicProfile> => {
  const { data } = await apiClient.patch<{ user: PublicProfile }>(`/users/me`, payload);
  return data.user;
};

export interface SearchUsersParams {
  q: string;
  limit?: number;
}

export const searchUsers = async ({ q, limit = 20 }: SearchUsersParams): Promise<PublicProfile[]> => {
  const { data } = await apiClient.get<{ users: PublicProfile[] }>('/users/search', {
    params: { q, limit }
  });
  return data.users;
};

export interface UserStats {
  posts: number;
  followers: number;
  following: number;
}

export interface ProfileResponse {
  user: PublicProfile;
  stats: UserStats;
}

export const getProfile = async (handle: string): Promise<ProfileResponse> => {
  const { data } = await apiClient.get<ProfileResponse>(`/users/${handle}`);
  return data;
};

export interface UserPostsParams {
  handle: string;
  cursor?: string | null;
  limit?: number;
}

export interface UserPostsResponse {
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

export const getUserPosts = async ({ handle, cursor, limit = 20 }: UserPostsParams): Promise<UserPostsResponse> => {
  const { data } = await apiClient.get<UserPostsResponse>(`/users/${handle}/posts`, {
    params: { cursor: cursor ?? undefined, limit }
  });
  return data;
};

