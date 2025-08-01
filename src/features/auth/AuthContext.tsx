"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/axios';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  fullName?: string;
  website?: string;
  location?: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  isPrivate?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
  lastSeen?: string;
  followers: string[];
  following: string[];
  posts: string[];
  savedPosts: string[];
  blockedUsers: string[];
  preferences?: {
    notifications: {
      likes: boolean;
      comments: boolean;
      follows: boolean;
      mentions: boolean;
      messages: boolean;
    };
    privacy: {
      showEmail: boolean;
      showPhone: boolean;
      showBirthDate: boolean;
    };
  };
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
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
  const [loading, setLoading] = useState(true);

  // Función para limpiar tokens inválidos
  const clearInvalidTokens = () => {
    setToken(null);
    setUser(null);
    clearStoredAuthData();
  };

  useEffect(() => {
    const { token: storedToken, user: storedUser } = getStoredAuthData();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      
      // Guardar en localStorage de forma segura
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }
      }
    } catch (error: any) {
      // Si hay error de autenticación, limpiar tokens
      if (error?.response?.status === 401) {
        clearInvalidTokens();
      }
      throw error;
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
    } catch (error: any) {
      // Si hay error de autenticación, limpiar tokens
      if (error?.response?.status === 401) {
        clearInvalidTokens();
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearInvalidTokens();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  return ctx;
};
