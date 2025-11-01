import { apiClient } from './client';

import type { SessionUser } from '@/store/session';

interface AuthResponse {
  user: SessionUser;
  accessToken: string;
  expiresIn: number;
}

interface LoginPayload {
  identifier: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  handle: string;
}

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
  return data;
};

export const refreshSession = async (): Promise<{ accessToken: string; expiresIn: number }> => {
  const { data } = await apiClient.post<{ accessToken: string; expiresIn: number }>('/auth/refresh');
  return data;
};

export const fetchCurrentUser = async (accessToken?: string): Promise<{ user: SessionUser }> => {
  const { data } = await apiClient.get<{ user: SessionUser }>('/auth/me', {
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`
        }
      : undefined
  });
  return data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

