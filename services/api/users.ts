import { logger } from '@/lib/logger';
import type { SessionUser } from '@/store/session';

import { apiClient } from './client';
import type { FeedCursorResponse } from './types/feed';

export interface PublicProfile extends SessionUser {
  readonly isVerified?: boolean;
}

export interface UserStats {
  readonly posts: number;
  readonly followers: number;
  readonly following: number;
}

export interface ProfileResponse {
  readonly user: PublicProfile;
  readonly stats: UserStats;
}

export type UserPostsResponse = FeedCursorResponse;

interface SearchUsersParams {
  readonly q: string;
  readonly limit?: number;
}

interface GetUserPostsParams {
  readonly handle: string;
  readonly cursor?: string | null;
  readonly limit?: number;
}

export const getProfileByHandle = async (handle: string): Promise<PublicProfile> => {
  const { data } = await apiClient.get<{ user: PublicProfile }>(`/users/${handle}`);
  return data.user;
};

/**
 * Busca usuarios por query (handle o displayName).
 */
export const searchUsers = async ({ q, limit = 20 }: SearchUsersParams): Promise<PublicProfile[]> => {
  try {
    const { data } = await apiClient.get<{ users: PublicProfile[] }>('/users/search', {
      params: { q, limit }
    });
    return data.users;
  } catch (error) {
    logger.error('Error buscando usuarios', error);
    throw error;
  }
};

/**
 * Obtiene los posts de un usuario por su handle.
 */
export const getUserPosts = async ({ handle, cursor, limit = 20 }: GetUserPostsParams): Promise<UserPostsResponse> => {
  try {
    const { data } = await apiClient.get<UserPostsResponse>(`/users/${handle}/posts`, {
      params: { cursor: cursor ?? undefined, limit }
    });
    return data;
  } catch (error) {
    logger.error('Error obteniendo posts de usuario', { error, handle });
    throw error;
  }
};

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  handle?: string;
}

export const updateProfile = async (payload: UpdateProfilePayload): Promise<PublicProfile> => {
  try {
    const { data } = await apiClient.patch<{ user: PublicProfile }>(`/users/me`, payload);
    return data.user;
  } catch (error) {
    logger.error('Error actualizando perfil', error);
    throw error;
  }
};

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  try {
    await apiClient.patch<{ message: string }>(`/users/me/password`, payload);
  } catch (error) {
    logger.error('Error cambiando contraseña', error);
    throw error;
  }
};

export const deleteAccount = async (): Promise<void> => {
  try {
    await apiClient.delete<{ message: string }>(`/users/me`);
  } catch (error) {
    logger.error('Error eliminando cuenta', error);
    throw error;
  }
};

