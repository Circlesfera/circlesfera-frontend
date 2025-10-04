"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { searchUsers } from '@/services/userService';
import { useAuth } from '@/features/auth/useAuth';

interface UserSearchProps {
  query: string;
  onResultClick: () => void;
}

interface SearchResult {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
  fullName?: string;
  isFollowing?: boolean;
}

export default function UserSearch({ query, onResultClick }: UserSearchProps) {
  const { token } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const searchUsersData = async () => {
      if (!query.trim() || !token) return;

      setLoading(true);
      setError('');

      try {
        const searchResults = await searchUsers(query);
        setResults(searchResults);
      } catch (err) {
        console.error('Error searching users:', err);
        setError('Error al buscar usuarios');
      } finally {
        setLoading(false);
      }
    };

    // Debounce para evitar demasiadas llamadas
    const timeoutId = setTimeout(searchUsersData, 300);
    return () => clearTimeout(timeoutId);
  }, [query, token]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  if (results.length === 0 && query.trim()) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-500 text-sm">No se encontraron usuarios</div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="space-y-1">
        {results.map((user) => (
          <Link
            key={user._id}
            href={`/${user.username}`}
            onClick={onResultClick}
            className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt="avatar" 
                className="w-10 h-10 rounded-full object-cover" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
                {user?.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 truncate">
                  {user.username}
                </span>
                {user.isFollowing && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Siguiendo
                  </span>
                )}
              </div>
              {user.fullName && (
                <div className="text-sm text-gray-500 truncate">
                  {user.fullName}
                </div>
              )}
              {user.bio && (
                <div className="text-sm text-gray-500 truncate">
                  {user.bio}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
      
      {results.length > 0 && (
        <div className="border-t border-gray-200 mt-2 pt-2">
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={onResultClick}
            className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2"
          >
            Ver todos los resultados
          </Link>
        </div>
      )}
    </div>
  );
}
