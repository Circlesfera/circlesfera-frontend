import { useEffect, useRef, useCallback, useState } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  isFetching: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  reset: () => void;
}

/**
 * Hook para implementar scroll infinito de manera eficiente
 */
export function useInfiniteScroll(
  fetchNextPage: () => Promise<void> | void,
  hasNextPage: boolean = true,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    enabled = true,
  } = options;

  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);

  const handleFetch = useCallback(async () => {
    if (isLoadingRef.current || !hasNextPage) return;

    isLoadingRef.current = true;
    setIsFetching(true);

    try {
      await fetchNextPage();
    } catch (error) {
      console.error('Error fetching next page:', error);
    } finally {
      setIsFetching(false);
      isLoadingRef.current = false;
    }
  }, [fetchNextPage, hasNextPage]);

  const reset = useCallback(() => {
    setIsFetching(false);
    isLoadingRef.current = false;
    if (elementRef.current && observerRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !hasNextPage) return;

    const element = elementRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !isLoadingRef.current) {
          handleFetch();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, hasNextPage, threshold, rootMargin, handleFetch]);

  return {
    ref: elementRef,
    isFetching,
    hasNextPage,
    fetchNextPage: handleFetch,
    reset,
  };
}
