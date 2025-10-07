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
  console.log('🔍 exploreService - getRecentPosts llamada');
  console.log('🔍 exploreService - baseURL configurado:', api.defaults.baseURL);
  console.log('🔍 exploreService - URL completa será:', `${api.defaults.baseURL}/posts/recent`);
  try {
    const res = await api.get('/posts/recent');
    console.log('✅ exploreService - getRecentPosts respuesta:', res.data);
    return res.data.posts;
  } catch (error) {
    console.error('❌ exploreService - getRecentPosts error:', error);
    throw error;
  }
};
