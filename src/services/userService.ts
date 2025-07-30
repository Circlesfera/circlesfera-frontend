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
