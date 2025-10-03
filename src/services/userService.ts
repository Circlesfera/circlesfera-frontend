import api from './axios';
import { Post } from './postService';

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
  stories?: any[];
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
    const res = await api.put('/auth/profile', userData);
    return res.data.user;
  } catch (error: any) {
    console.error('Error en updateUserProfile:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('Errores de validación:', error.response.data.errors);
    }
    throw error;
  }
};

export const getUserProfileByUsername = async (username: string): Promise<UserProfile> => {
  const res = await api.get(`/users/profile/${username}`);
  return res.data.user;
};

export const followUser = async (userId: string) => {
  console.log('🔍 userService - followUser llamada:', {
    userId,
    url: `/users/${userId}/follow`,
    method: 'POST'
  });
  
  try {
    const response = await api.post(`/users/${userId}/follow`, {});
    console.log('✅ userService - followUser respuesta:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ userService - followUser error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      method: error.config?.method
    });
    throw error;
  }
};

export const unfollowUser = async (userId: string) => {
  console.log('🔍 userService - unfollowUser llamada:', {
    userId,
    url: `/users/${userId}/follow`,
    method: 'DELETE'
  });
  
  try {
    const response = await api.delete(`/users/${userId}/follow`);
    console.log('✅ userService - unfollowUser respuesta:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ userService - unfollowUser error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      method: error.config?.method
    });
    throw error;
  }
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
