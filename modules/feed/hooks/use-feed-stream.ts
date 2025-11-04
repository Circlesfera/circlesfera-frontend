'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchHomeFeed } from '@/services/api/feed';
import type { FeedCursorResponse } from '@/services/api/types/feed';
import { useSessionStore } from '@/store/session';

const FEED_QUERY_KEY = ['feed', 'home'] as const;

interface UseFeedStreamOptions {
  readonly initialCursor?: string | null;
}

/**
 * Hook que obtiene el feed principal del usuario con paginación infinita.
 * Solo ejecuta la query cuando la sesión está hidratada y hay un token válido.
 */
export const useFeedStream = ({ initialCursor }: UseFeedStreamOptions = {}) => {
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);

  return useInfiniteQuery<FeedCursorResponse>({
    queryKey: [...FEED_QUERY_KEY, { cursor: initialCursor ?? null }],
    queryFn: ({ pageParam }) => fetchHomeFeed({ cursor: (pageParam as string | null) ?? null }),
    initialPageParam: initialCursor ?? null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    staleTime: 15_000,
    // Solo ejecutar cuando la sesión esté hidratada y haya un token
    enabled: isHydrated && !!accessToken
  });
};

