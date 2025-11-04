import { useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import { getSocketClient } from '@/lib/socket-client';
import { fetchMentionsFeed } from '@/services/api/feed';
import type { FeedItem } from '@/services/api/types/feed';
import { useSessionStore } from '@/store/session';

/**
 * Hook para gestionar menciones con soporte para WebSocket en tiempo real.
 */
export const useMentions = () => {
  const queryClient = useQueryClient();
  const accessToken = useSessionStore((state) => state.accessToken);
  const isHydrated = useSessionStore((state) => state.isHydrated);

  // Query de menciones
  const mentionsQuery = useInfiniteQuery({
    queryKey: ['feed', 'mentions'],
    queryFn: ({ pageParam }: { pageParam: string | null }) => 
      fetchMentionsFeed({ cursor: pageParam }),
    initialPageParam: null as string | null,
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
    const handleNewMention = (mention: { post: FeedItem }) => {
      queryClient.setQueryData(['feed', 'mentions'], (old: any) => {
        if (!old) {
          return {
            pages: [{ data: [mention.post], nextCursor: null }],
            pageParams: [null as string | null]
          };
        }

        return {
          ...old,
          pages: old.pages.map((page: { data: FeedItem[]; nextCursor: string | null }, index: number) => {
            if (index === 0) {
              // Verificar si el post ya existe
              const exists = page.data.some((item) => item.id === mention.post.id);
              if (exists) {
                return page;
              }
              return {
                ...page,
                data: [mention.post, ...page.data]
              };
            }
            return page;
          })
        };
      });
    };

    socket.on('mention', handleNewMention);

    return () => {
      socket.off('mention', handleNewMention);
    };
  }, [isHydrated, accessToken, queryClient]);

  return {
    items: mentionsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    isLoading: mentionsQuery.isLoading,
    hasNextPage: mentionsQuery.hasNextPage,
    fetchNextPage: mentionsQuery.fetchNextPage,
    isFetchingNextPage: mentionsQuery.isFetchingNextPage,
    status: mentionsQuery.status,
    error: mentionsQuery.error
  };
};

