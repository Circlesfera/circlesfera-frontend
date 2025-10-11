"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/axios';
import type { User, ApiResponse, LoginResponse } from '@/types';
import logger from '@/utils/logger';

interface AuthContextProps {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Función para obtener datos del localStorage de forma segura
const getStoredAuthData = () => {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }

  try {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      return {
        token: storedToken,
      user: JSON.parse(storedUser)
    };
  }
} catch (initError) {
  logger.error('Error initializing auth state:', {
    error: initError instanceof Error ? initError.message : 'Unknown error'
  });
}

  return { token: null, user: null };
};

// Función para limpiar tokens de forma segura
const clearStoredAuthData = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (clearError) {
      logger.error('Error clearing invalid tokens:', {
        error: clearError instanceof Error ? clearError.message : 'Unknown error'
      });
    }
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para limpiar tokens inválidos
  const clearInvalidTokens = () => {
    setToken(null);
    setUser(null);
    clearStoredAuthData();
  };

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      const { token: storedToken, user: storedUser } = getStoredAuthData();
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {

      const res = await api.post<LoginResponse>('/auth/login', { email, password });

      if (res.data.success && res.data.token && res.data.user) {
        setToken(res.data.token);
        setUser(res.data.user);

        // Guardar en localStorage de forma segura
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            logger.info('User logged in successfully');
          } catch (storageError) {
            logger.error('Error storing login data:', {
              error: storageError instanceof Error ? storageError.message : 'Unknown error'
            });
          }
        }
      } else {

        throw new Error(res.data.message || 'Error en el login');
      }
    } catch (loginError) {
      logger.error('Login error:', {
        error: loginError instanceof Error ? loginError.message : 'Unknown error'
      });
      // Manejo detallado de errores de Axios
      if (loginError && typeof loginError === 'object' && 'response' in loginError) {
        const axiosError = loginError as { response?: { status?: number; statusText?: string; data?: unknown }; config?: { url?: string; method?: string; baseURL?: string } };

        // Si hay error de autenticación, limpiar tokens
        if (axiosError.response?.status === 401) {
          clearInvalidTokens();
        }
      }

      throw loginError;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    try {
      await api.post('/auth/register', { username, email, password });
      // Login automático tras registro
      await login(email, password);
      logger.info('User registered successfully');
    } catch (registerError) {
      logger.error('Register error:', {
        error: registerError instanceof Error ? registerError.message : 'Unknown error'
      });
      // Si hay error de autenticación, limpiar tokens
      if (registerError && typeof registerError === 'object' && 'response' in registerError) {
        const axiosError = registerError as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          clearInvalidTokens();
        }
      }
      throw registerError;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!token) return;

    try {
      const res = await api.get<ApiResponse<User>>('/auth/profile');
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(res.data.data));
        }
      }
    } catch (refreshError) {
      logger.error('Error refreshing user:', {
        error: refreshError instanceof Error ? refreshError.message : 'Unknown error'
      });
      // Si hay error, limpiar tokens
      clearInvalidTokens();
    }
  };

  const logout = () => {
    clearInvalidTokens();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  return ctx;
};
