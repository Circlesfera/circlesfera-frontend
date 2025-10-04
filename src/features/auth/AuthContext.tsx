"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/axios';
import type { User, ApiResponse, LoginResponse } from '@/types';

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
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  
  return { token: null, user: null };
};

// Función para limpiar tokens de forma segura
const clearStoredAuthData = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(typeof window === 'undefined');

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
      console.log('🔐 Intentando login con:', { email, apiUrl: process.env.NEXT_PUBLIC_API_URL });
      
      const res = await api.post<LoginResponse>('/api/auth/login', { email, password });
      
      console.log('✅ Respuesta del login:', { 
        success: res.data.success, 
        hasToken: !!res.data.token, 
        hasUser: !!res.data.user,
        message: res.data.message 
      });
      
      if (res.data.success && res.data.token && res.data.user) {
        setToken(res.data.token);
        setUser(res.data.user);
        
        // Guardar en localStorage de forma segura
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            console.log('✅ Datos guardados en localStorage');
          } catch (error) {
            console.error('❌ Error saving to localStorage:', error);
          }
        }
      } else {
        console.error('❌ Login falló:', res.data);
        throw new Error(res.data.message || 'Error en el login');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: error && typeof error === 'object' && 'response' in error ? (error as any).response?.data : 'No response',
        status: error && typeof error === 'object' && 'response' in error ? (error as any).response?.status : 'No status'
      });
      
      // Si hay error de autenticación, limpiar tokens
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          clearInvalidTokens();
        }
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    try {
      await api.post('/api/auth/register', { username, email, password });
      // Login automático tras registro
      await login(email, password);
    } catch (error) {
      // Si hay error de autenticación, limpiar tokens
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          clearInvalidTokens();
        }
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const res = await api.get<ApiResponse<User>>('/api/auth/profile');
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(res.data.data));
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
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
