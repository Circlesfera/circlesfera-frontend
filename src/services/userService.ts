import api from './axios';
import logger from '@/utils/logger';
import type { User, Story } from '@/types';
import type { Post } from './postService';

// Re-exportar User para compatibilidad con imports existentes
export type { User };

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
  createdAt?: string;
  updatedAt?: string;
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

    logger.info('🔍 userService - Enviando datos de perfil:', cleanedData);

    const res = await api.put('/auth/profile', cleanedData);

    logger.info('🔍 userService - Respuesta del servidor:', {
      status: res.status,
      data: res.data
    });

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

// Funciones específicas para administración de usuarios
export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  fullName?: string;
  bio?: string;
  role: 'user' | 'moderator' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  banExpiresAt?: string;
  createdAt: string;
  lastLoginAt?: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  reportsCount: number;
  violationsCount: number;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const getAdminUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<AdminUsersResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.role) queryParams.append('role', params.role);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const res = await api.get(`/admin/users?${queryParams.toString()}`);
  return res.data;
};

export const updateUserRole = async (userId: string, role: 'user' | 'moderator' | 'admin'): Promise<AdminUser> => {
  const res = await api.put(`/admin/users/${userId}/role`, { role });
  return res.data.user;
};

export const banUser = async (userId: string, reason: string, duration?: number): Promise<AdminUser> => {
  const res = await api.post(`/admin/users/${userId}/ban`, {
    reason,
    duration // duración en días, opcional (permanente si no se especifica)
  });
  return res.data.user;
};

export const unbanUser = async (userId: string): Promise<AdminUser> => {
  const res = await api.delete(`/admin/users/${userId}/ban`);
  return res.data.user;
};

export const verifyUser = async (userId: string): Promise<AdminUser> => {
  const res = await api.post(`/admin/users/${userId}/verify`);
  return res.data.user;
};

export const unverifyUser = async (userId: string): Promise<AdminUser> => {
  const res = await api.delete(`/admin/users/${userId}/verify`);
  return res.data.user;
};

export const suspendUser = async (userId: string, reason: string, duration: number): Promise<AdminUser> => {
  const res = await api.post(`/admin/users/${userId}/suspend`, {
    reason,
    duration // duración en días
  });
  return res.data.user;
};

export const unsuspendUser = async (userId: string): Promise<AdminUser> => {
  const res = await api.delete(`/admin/users/${userId}/suspend`);
  return res.data.user;
};

export const getUserDetails = async (userId: string): Promise<AdminUser> => {
  const res = await api.get(`/admin/users/${userId}`);
  return res.data.user;
};

export const getUserActivity = async (userId: string): Promise<{
  recentPosts: Record<string, unknown>[];
  recentReports: Record<string, unknown>[];
  loginHistory: Record<string, unknown>[];
}> => {
  const res = await api.get(`/admin/users/${userId}/activity`);
  return res.data;
};
