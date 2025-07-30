import api from './axios';
import { Post } from './postService';

export interface UserSearchResult {
  _id: string;
  username: string;
  avatar?: string;
}

export const searchUsers = async (query: string): Promise<UserSearchResult[]> => {
  const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
  return res.data;
};

export const getRecentPosts = async (): Promise<Post[]> => {
  const res = await api.get('/posts'); // Puedes cambiar a /posts/recent si tienes endpoint
  return res.data;
};
