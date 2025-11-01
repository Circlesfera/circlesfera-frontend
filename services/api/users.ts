import { apiClient } from './client';

import type { SessionUser } from '@/store/session';

export interface PublicProfile extends SessionUser {}

export const getProfileByHandle = async (handle: string): Promise<PublicProfile> => {
  const { data } = await apiClient.get<{ user: PublicProfile }>(`/users/${handle}`);
  return data.user;
};

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export const updateProfile = async (payload: UpdateProfilePayload): Promise<PublicProfile> => {
  const { data } = await apiClient.patch<{ user: PublicProfile }>(`/users/me`, payload);
  return data.user;
};

