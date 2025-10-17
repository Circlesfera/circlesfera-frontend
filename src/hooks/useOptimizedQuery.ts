"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useVirtualization';

interface QueryOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: number | boolean;
  retryDelay?: number;
}

interface QueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isStale: boolean;
}

/**
 * Hook optimizado para consultas de API
 * Incluye cache, retry automático y optimizaciones de rendimiento
 */
export const useOptimizedQuery = <T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
): QueryResult<T> => {
  const {
    enabled = true,
    refetchOnWindowFocus = true,
    staleTime = 5 * 60 * 1000, // 5 minutos
    cacheTime = 10 * 60 * 1000, // 10 minutos
    retry = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);

  const cacheRef = useRef<Map<string, { data: T; timestamp: number; staleTime: number }>>(new Map());
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const executeQuery = useCallback(async () => {
    if (!enabled) return;

    // Verificar cache
    const cached = cacheRef.current.get(queryKey);
    if (cached && Date.now() - cached.timestamp < cached.staleTime) {
      setData(cached.data);
      setIsStale(false);
      return;
    }

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await queryFn();

      // Guardar en cache
      cacheRef.current.set(queryKey, {
        data: result,
        timestamp: Date.now(),
        staleTime
      });

      setData(result);
      setIsStale(false);
      retryCountRef.current = 0;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';

      // Retry automático
      if (retryCountRef.current < (typeof retry === 'boolean' ? (retry ? 3 : 0) : retry)) {
        retryCountRef.current++;
        setTimeout(() => {
          executeQuery();
        }, retryDelay * retryCountRef.current);
        return;
      }

      setError(errorMessage);
      setIsStale(true);
    } finally {
      setLoading(false);
    }
  }, [queryKey, queryFn, enabled, staleTime, retry, retryDelay]);

  const refetch = useCallback(async () => {
    // Limpiar cache para forzar refetch
    cacheRef.current.delete(queryKey);
    await executeQuery();
  }, [executeQuery, queryKey]);

  // Efecto principal
  useEffect(() => {
    executeQuery();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [executeQuery]);

  // Refetch en focus de ventana
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      const cached = cacheRef.current.get(queryKey);
      if (cached && Date.now() - cached.timestamp > cached.staleTime) {
        setIsStale(true);
        refetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, queryKey, refetch]);

  // Limpiar cache expirado
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of cacheRef.current.entries()) {
        if (now - value.timestamp > cacheTime) {
          cacheRef.current.delete(key);
        }
      }
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, [cacheTime]);

  return {
    data,
    loading,
    error,
    refetch,
    isStale
  };
};

/**
 * Hook para consultas con paginación optimizada
 */
export const useOptimizedPaginatedQuery = <T>(
  queryKey: string,
  queryFn: (page: number, limit: number) => Promise<{ data: T[]; hasMore: boolean; total: number }>,
  initialLimit = 20
) => {
  const [allData, setAllData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const { data, loading, error, refetch } = useOptimizedQuery(
    `${queryKey}-page-${page}`,
    () => queryFn(page, initialLimit)
  );

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setAllData(data.data);
      } else {
        setAllData(prev => [...prev, ...data.data]);
      }
      setHasMore(data.hasMore);
      setTotal(data.total);
    }
  }, [data, page]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setPage(prev => prev + 1);
  }, [hasMore, loading]);

  const reset = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
    setTotal(0);
  }, []);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    total,
    loadMore,
    reset,
    refetch
  };
};

/**
 * Hook para búsquedas optimizadas con debounce
 */
export const useOptimizedSearch = <T>(
  queryKey: string,
  searchFn: (query: string) => Promise<T[]>,
  debounceDelay = 300
) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, debounceDelay);

  const { data, loading, error } = useOptimizedQuery(
    `${queryKey}-search-${debouncedQuery}`,
    () => searchFn(debouncedQuery),
    {
      enabled: debouncedQuery.length >= 2
    }
  );

  return {
    searchQuery,
    setSearchQuery,
    results: data || [],
    loading,
    error
  };
};
