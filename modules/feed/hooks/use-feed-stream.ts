'use client';

import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
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
type FeedQueryKey = [...typeof FEED_QUERY_KEY, { readonly cursor: string | null }];

export const useFeedStream = ({ initialCursor }: UseFeedStreamOptions = {}): UseInfiniteQueryResult<InfiniteData<FeedCursorResponse>, Error> => {
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);
  const queryKey: FeedQueryKey = [...FEED_QUERY_KEY, { cursor: initialCursor ?? null }];

  return useInfiniteQuery<FeedCursorResponse, Error, InfiniteData<FeedCursorResponse>, FeedQueryKey, string | null>({
    queryKey,
    queryFn: async ({ pageParam }): Promise<FeedCursorResponse> =>
      fetchHomeFeed({ cursor: pageParam ?? null }),
    initialPageParam: initialCursor ?? null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    staleTime: 15_000,
    // Solo ejecutar cuando la sesión esté hidratada y haya un token
    enabled: isHydrated && !!accessToken
  });
};

