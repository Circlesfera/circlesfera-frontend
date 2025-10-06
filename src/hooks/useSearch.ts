import { useState, useCallback, useEffect } from 'react';
import { searchUsers } from '@/services/userService';
import { searchReelsByHashtag } from '@/services/reelService';
import { useDebounce } from './useDebounce';

export type SearchType = 'users' | 'reels' | 'all';

export interface SearchFilters {
  type: SearchType;
  hashtag?: string;
  verified?: boolean;
  sortBy?: 'relevance' | 'recent' | 'popular';
}

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  results: {
    users: any[];
    reels: any[];
  };
  loading: boolean;
  hasSearched: boolean;
  search: () => Promise<void>;
  clearResults: () => void;
}

/**
 * Hook personalizado para búsqueda avanzada con filtros
 * @returns Estado y funciones para gestionar búsquedas
 */
export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ type: 'all' });
  const [results, setResults] = useState<{ users: any[]; reels: any[] }>({
    users: [],
    reels: []
  });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Aplicar debounce al query
  const debouncedQuery = useDebounce(query, 300);

  const search = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setResults({ users: [], reels: [] });
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);

      const newResults: { users: any[]; reels: any[] } = {
        users: [],
        reels: []
      };

      // Buscar usuarios
      if (filters.type === 'users' || filters.type === 'all') {
        try {
          const usersResponse = await searchUsers(debouncedQuery);
          if (usersResponse.success) {
            newResults.users = usersResponse.users || [];
          }
        } catch (error) {
          console.error('Error searching users:', error);
        }
      }

      // Buscar reels por hashtag
      if (filters.type === 'reels' || filters.type === 'all') {
        try {
          // Si el query empieza con #, buscar por hashtag
          const searchQuery = debouncedQuery.startsWith('#')
            ? debouncedQuery.slice(1)
            : debouncedQuery;

          const reelsResponse = await searchReelsByHashtag(searchQuery);
          if (reelsResponse.success) {
            newResults.reels = reelsResponse.reels || [];
          }
        } catch (error) {
          console.error('Error searching reels:', error);
        }
      }

      setResults(newResults);
    } catch (error) {
      console.error('Error in search:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, filters]);

  const clearResults = useCallback(() => {
    setResults({ users: [], reels: [] });
    setQuery('');
    setHasSearched(false);
  }, []);

  // Ejecutar búsqueda automáticamente cuando cambia el query o filtros
  useEffect(() => {
    search();
  }, [search]);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    loading,
    hasSearched,
    search,
    clearResults
  };
}

