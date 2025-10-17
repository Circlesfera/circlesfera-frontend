"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualizationResult {
  visibleItems: number[];
  totalHeight: number;
  offsetY: number;
  scrollToIndex: (index: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook para virtualización de listas grandes
 * Optimiza el rendimiento renderizando solo los elementos visibles
 */
export const useVirtualization = (
  itemCount: number,
  options: VirtualizationOptions
): VirtualizationResult => {
  const { itemHeight, containerHeight, overscan = 5 } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Calcular elementos visibles
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = Array.from(
    { length: endIndex - startIndex + 1 },
    (_, i) => startIndex + i
  );

  const totalHeight = itemCount * itemHeight;
  const offsetY = startIndex * itemHeight;

  // Función para hacer scroll a un índice específico
  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      const targetScrollTop = index * itemHeight;
      containerRef.current.scrollTop = targetScrollTop;
    }
  }, [itemHeight]);

  // Manejar scroll
  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  // Agregar event listener de scroll
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
    return undefined;
  }, [handleScroll]);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    scrollToIndex,
    containerRef
  };
};

/**
 * Hook para lazy loading de datos
 * Carga datos de manera incremental para mejorar el rendimiento
 */
export const useLazyData = <T>(
  fetchFunction: (page: number, limit: number) => Promise<T[]>,
  initialLimit = 20
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newData = await fetchFunction(page, initialLimit);

      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setData(prev => [...prev, ...newData]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, initialLimit, fetchFunction]);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    hasMore,
    loadMore,
    reset
  };
};

/**
 * Hook para debounce de búsquedas
 * Evita hacer demasiadas peticiones mientras el usuario escribe
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook para throttling de eventos
 * Limita la frecuencia de ejecución de funciones
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};
