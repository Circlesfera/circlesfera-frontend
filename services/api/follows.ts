import { apiClient } from './client';

export interface FollowResponse {
  message: string;
  following: boolean;
}

export const followUser = async (handle: string): Promise<FollowResponse> => {
  const { data } = await apiClient.post<FollowResponse>(`/users/${handle}/follow`);
  return data;
};

export const unfollowUser = async (handle: string): Promise<FollowResponse> => {
  const { data } = await apiClient.delete<FollowResponse>(`/users/${handle}/follow`);
  return data;
};

