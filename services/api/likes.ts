import { apiClient } from './client';

export interface LikeResponse {
  message: string;
  liked: boolean;
}

export const likePost = async (postId: string): Promise<LikeResponse> => {
  const { data } = await apiClient.post<LikeResponse>(`/likes/posts/${postId}/like`);
  return data;
};

export const unlikePost = async (postId: string): Promise<LikeResponse> => {
  const { data } = await apiClient.delete<LikeResponse>(`/likes/posts/${postId}/like`);
  return data;
};

