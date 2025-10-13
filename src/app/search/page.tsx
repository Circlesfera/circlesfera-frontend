"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { searchUsers } from '@/services/userService';
import { useAuth } from '@/features/auth/useAuth';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import logger from '@/utils/logger';

interface SearchResult {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
  fullName?: string;
  isFollowing?: boolean;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { user } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const searchResults = await searchUsers(query);
        // Filtrar resultados para excluir al usuario actual si está logueado
        const filteredResults = user
          ? searchResults.filter(result => result._id !== user._id)
          : searchResults;
        setResults(filteredResults);
      } catch (searchError) {
        logger.error('Error searching users:', {
          error: searchError instanceof Error ? searchError.message : 'Unknown error',
          query
        });
        setError('Error al buscar usuarios');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, user]);

  if (!query.trim()) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 dark:from-gray-900 via-white dark:via-gray-900 to-gray-50 dark:to-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600 dark:text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">Búsqueda vacía</h3>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Ingresa un término de búsqueda para encontrar usuarios</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 dark:from-gray-900 via-white dark:via-gray-900 to-gray-50 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header de búsqueda */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">
              Resultados de búsqueda
            </h1>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Buscando: <span className="font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100">&quot;{query}&quot;</span>
            </p>
          </div>

          {/* Resultados */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 dark:bg-gray-700 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">Error en la búsqueda</h3>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">{error}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600 dark:text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">No se encontraron resultados</h3>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                No se encontraron usuarios que coincidan con &quot;{query}&quot;
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">
                {results.length} {results.length === 1 ? 'usuario encontrado' : 'usuarios encontrados'}
              </div>

              {results.map((user) => (
                <Link
                  key={user._id}
                  href={`/${user.username}`}
                  className="block bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt="avatar"
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 text-lg">
                          {user.username}
                        </span>
                        {user.isFollowing && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 px-2 py-1 rounded-full">
                            Siguiendo
                          </span>
                        )}
                      </div>

                      {user.fullName && (
                        <div className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                          {user.fullName}
                        </div>
                      )}

                      {user.bio && (
                        <div className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm line-clamp-2">
                          {user.bio}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 dark:from-gray-900 via-white dark:via-gray-900 to-gray-50 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Cargando búsqueda...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
