'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchHomeFeed } from '@/services/api/feed';
import type { FeedCursorResponse } from '@/services/api/types/feed';
import { useSessionStore } from '@/store/session';

const FEED_QUERY_KEY = ['feed', 'home'] as const;

interface UseFeedStreamOptions {
  readonly initialCursor?: string | null;
  readonly sortBy?: 'recent' | 'relevance';
}

/**
 * Hook que obtiene el feed principal del usuario con paginación infinita.
 */
export const useFeedStream = ({ initialCursor, sortBy = 'recent' }: UseFeedStreamOptions = {}) => {
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);

  return useInfiniteQuery<FeedCursorResponse>({
    queryKey: [...FEED_QUERY_KEY, { cursor: initialCursor ?? null, sortBy }],
    queryFn: ({ pageParam }) => fetchHomeFeed({ cursor: (pageParam as string | null) ?? null, sortBy }),
    initialPageParam: initialCursor ?? null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    staleTime: 15_000,
    enabled: isHydrated && Boolean(accessToken)
  });
};

