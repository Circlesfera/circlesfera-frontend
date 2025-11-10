import { type InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { getSocketClient } from '@/lib/socket-client';
import { fetchMentionsFeed } from '@/services/api/feed';
import type { FeedCursorResponse, FeedItem } from '@/services/api/types/feed';
import { useSessionStore } from '@/store/session';

type MentionsQueryKey = ['feed', 'mentions'];

interface MentionEventPayload {
  readonly post: FeedItem;
}

interface UseMentionsResult {
  readonly items: FeedItem[];
  readonly isLoading: boolean;
  readonly hasNextPage: boolean;
  readonly fetchNextPage: () => Promise<unknown>;
  readonly isFetchingNextPage: boolean;
  readonly status: 'error' | 'pending' | 'success';
  readonly error: unknown;
}

/**
 * Hook para gestionar menciones con soporte para WebSocket en tiempo real.
 */
export const useMentions = (): UseMentionsResult => {
  const accessToken = useSessionStore((state) => state.accessToken);
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const queryClient = useQueryClient();
  const queryKey = useMemo<MentionsQueryKey>(() => ['feed', 'mentions'], []);

  // Query de menciones
  const mentionsQuery = useInfiniteQuery<
    FeedCursorResponse,
    Error,
    InfiniteData<FeedCursorResponse>,
    MentionsQueryKey,
    string | null
  >({
    queryKey,
    queryFn: async ({ pageParam }) => fetchMentionsFeed({ cursor: pageParam ?? null }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    enabled: isHydrated && Boolean(accessToken),
    staleTime: 30000
  });

  // Configurar WebSocket para nuevas menciones
  useEffect(() => {
    if (!isHydrated || !accessToken) {
      return;
    }

    const socket = getSocketClient();
    if (!socket) {
      return;
    }

    // Escuchar nuevas menciones
    const handleNewMention = (mention: MentionEventPayload): void => {
      queryClient.setQueryData<InfiniteData<FeedCursorResponse>>(queryKey, (old) => {
        if (!old) {
          return {
            pageParams: [null],
            pages: [
              {
                data: [mention.post],
                nextCursor: null
              }
            ]
          };
        }

        const [firstPage, ...restPages] = old.pages;
        if (!firstPage) {
          return old;
        }

        const alreadyExists = firstPage.data.some((item) => item.id === mention.post.id);
        if (alreadyExists) {
          return old;
        }

        const updatedFirstPage = {
          ...firstPage,
          data: [mention.post, ...firstPage.data]
        };

        return {
          ...old,
          pages: [updatedFirstPage, ...restPages]
        };
      });
    };

    socket.on('mention', handleNewMention);

    return () => {
      socket.off('mention', handleNewMention);
    };
  }, [isHydrated, accessToken, queryClient, queryKey]);

  const aggregatedItems = useMemo(
    () => mentionsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [mentionsQuery.data]
  );

  return {
    items: aggregatedItems,
    isLoading: mentionsQuery.isLoading,
    hasNextPage: mentionsQuery.hasNextPage,
    fetchNextPage: async () => mentionsQuery.fetchNextPage(),
    isFetchingNextPage: mentionsQuery.isFetchingNextPage,
    status: mentionsQuery.status,
    error: mentionsQuery.error
  };
};

