import api from './axios';
import { Post } from './postService';

export interface UserSearchResult {
  _id: string;
  username: string;
  avatar?: string;
}

export const searchUsers = async (query: string): Promise<UserSearchResult[]> => {
  const res = await api.get(`/api/users/search?q=${encodeURIComponent(query)}`);
  return res.data;
};

export const getRecentPosts = async (): Promise<Post[]> => {
  console.log('🔍 exploreService - getRecentPosts llamada');
  try {
    const res = await api.get('/api/posts/recent');
    console.log('✅ exploreService - getRecentPosts respuesta:', res.data);
    return res.data.posts;
  } catch (error) {
    console.error('❌ exploreService - getRecentPosts error:', error);
    throw error;
  }
};
