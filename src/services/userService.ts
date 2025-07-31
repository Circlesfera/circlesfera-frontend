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
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
}

export const getUserProfile = async (token: string): Promise<User> => {
  const res = await api.get('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.user;
};

export const updateUserProfile = async (token: string, userData: Partial<User>): Promise<User> => {
  const res = await api.put('/auth/profile', userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.user;
};

export const getUserProfileByUsername = async (username: string): Promise<UserProfile> => {
  const res = await api.get(`/users/profile/${username}`);
  return res.data;
};

export const followUser = async (userId: string, token: string) => {
  await api.post(`/users/${userId}/follow`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const unfollowUser = async (userId: string, token: string) => {
  await api.post(`/users/${userId}/unfollow`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const editProfile = async (formData: FormData, token: string) => {
  const res = await api.put('/users/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
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

export const getSuggestions = async (token: string): Promise<UserSuggestion[]> => {
  const res = await api.get('/users/suggestions', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getFollowers = async (userId: string): Promise<UserSuggestion[]> => {
  const res = await api.get(`/users/${userId}/followers`);
  return res.data;
};

export const getFollowing = async (userId: string): Promise<UserSuggestion[]> => {
  const res = await api.get(`/users/${userId}/following`);
  return res.data;
};

export const searchUsers = async (query: string, token: string): Promise<UserSuggestion[]> => {
  const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const blockUser = async (userId: string, token: string) => {
  await api.post(`/users/${userId}/block`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const unblockUser = async (userId: string, token: string) => {
  await api.post(`/users/${userId}/unblock`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const changePassword = async (currentPassword: string, newPassword: string, token: string) => {
  const res = await api.put('/auth/change-password', {
    currentPassword,
    newPassword
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
