import axios from 'axios';

import { clientEnv } from '@/lib/env';
import { sessionStore } from '@/store/session';

/**
 * Cliente HTTP basado en Axios usado para consumir la API de CircleSfera.
 * Incluye envío automático de tokens y soporte para cookies httpOnly.
 */
export const apiClient = axios.create({
  baseURL: clientEnv.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 12_000
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      sessionStore.getState().clearSession();
    }
    return Promise.reject(error);
  }
);

