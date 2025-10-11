import api from './axios';
import { Post } from './postService';
import logger from '@/utils/logger';
import type { Story } from '@/types';

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  fullName?: string;
  website?: string;
  location?: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  isPrivate?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
  lastSeen?: string;
  followers: string[];
  following: string[];
  posts: Post[];
  savedPosts: Post[];
  blockedUsers: string[];
  preferences?: {
    notifications: {
      likes: boolean;
      comments: boolean;
      follows: boolean;
      mentions: boolean;
      messages: boolean;
    };
    privacy: {
      showEmail: boolean;
      showPhone: boolean;
      showBirthDate: boolean;
    };
  };
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  fullName?: string;
  website?: string;
  location?: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  isPrivate?: boolean;
  followers: string[];
  following: string[];
  posts: Post[];
  stories?: Story[];
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  storiesCount?: number;
  reelsCount?: number;
  totalLikes?: number;
  totalComments?: number;
  isFollowing?: boolean;
}

export const getUserProfile = async (): Promise<User> => {
  const res = await api.get('/auth/profile');
  return res.data.user;
};

export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  try {
    // Limpiar campos vacíos/null antes de enviar
    const cleanedData: Record<string, unknown> = {};
    Object.keys(userData).forEach(key => {
      const value = userData[key as keyof User];
      // Solo incluir campos que no sean undefined
      if (value !== undefined) {
        cleanedData[key] = value === '' ? null : value;
      }
    });

    logger.debug('Enviando datos de perfil:', cleanedData);

    const res = await api.put('/auth/profile', cleanedData);
    return res.data.user;
  } catch (error: unknown) {
    logger.error('Error en updateUserProfile:', {
      message: (error as Error)?.message || 'Error desconocido',
      userData
    });

    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string; errors?: unknown[] } } };
      if (apiError.response?.data) {
        logger.error('Detalles del error del servidor:', apiError.response.data);
      }
    }
    throw error;
  }
};

export const getUserProfileByUsername = async (username: string): Promise<UserProfile> => {

  const res = await api.get(`/users/profile/${username}`);

  return res.data.user;
};

export const followUser = async (userId: string) => {
  await api.post(`/users/${userId}/follow`, {});
};

export const unfollowUser = async (userId: string) => {
  await api.delete(`/users/${userId}/follow`);
};

export const editProfile = async (formData: FormData) => {
  const res = await api.put('/auth/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export interface UserSuggestion {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
  fullName?: string;
  isFollowing?: boolean;
}

export const getSuggestions = async (): Promise<UserSuggestion[]> => {
  const res = await api.get('/users/suggestions');
  return res.data.suggestions;
};

export const getFollowers = async (userId: string): Promise<UserSuggestion[]> => {
  const res = await api.get(`/users/${userId}/followers`);
  return res.data.followers;
};

export const getFollowing = async (userId: string): Promise<UserSuggestion[]> => {
  const res = await api.get(`/users/${userId}/following`);
  return res.data.following;
};

export const searchUsers = async (query: string): Promise<UserSuggestion[]> => {
  const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
  return res.data.users;
};

export const blockUser = async (userId: string) => {
  await api.post(`/users/${userId}/block`, {});
};

export const unblockUser = async (userId: string) => {
  await api.post(`/users/${userId}/unblock`, {});
};

export const muteUser = async (userId: string) => {
  await api.post(`/users/${userId}/mute`, {});
};

export const unmuteUser = async (userId: string) => {
  await api.delete(`/users/${userId}/mute`);
};

export const restrictUser = async (userId: string) => {
  await api.post(`/users/${userId}/restrict`, {});
};

export const unrestrictUser = async (userId: string) => {
  await api.delete(`/users/${userId}/restrict`);
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const res = await api.put('/auth/change-password', {
    currentPassword,
    newPassword
  });
  return res.data;
};

export const checkUsernameAvailability = async (username: string): Promise<{ available: boolean; username: string }> => {
  const res = await api.get(`/auth/check-username/${encodeURIComponent(username)}`);
  return res.data;
};
