import { apiClient } from './client';

export interface BlockResponse {
  message: string;
  blocked: boolean;
}

export interface BlockStatusResponse {
  isBlocked: boolean;
  hasBlockedYou: boolean;
  canInteract: boolean;
}

export const blockUser = async (handle: string): Promise<BlockResponse> => {
  const { data } = await apiClient.post<BlockResponse>(`/users/${handle}/block`);
  return data;
};

export const unblockUser = async (handle: string): Promise<BlockResponse> => {
  const { data } = await apiClient.delete<BlockResponse>(`/users/${handle}/block`);
  return data;
};

export const getBlockStatus = async (handle: string): Promise<BlockStatusResponse> => {
  const { data } = await apiClient.get<BlockStatusResponse>(`/users/${handle}/block-status`);
  return data;
};

