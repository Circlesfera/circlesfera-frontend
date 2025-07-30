import api from './axios';
import { Post } from './postService';

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  followers: string[];
  following: string[];
  posts: Post[];
}

export const getUserProfile = async (username: string): Promise<UserProfile> => {
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
}

export const getSuggestions = async (token: string): Promise<UserSuggestion[]> => {
  const res = await api.get('/users/suggestions', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
