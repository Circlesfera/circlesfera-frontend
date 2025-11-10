import { type InfiniteData,useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { getSocketClient } from '@/lib/socket-client';
import { getTaggedPosts, type TaggedPost, type TaggedPostsResponse } from '@/services/api/tags';
import { useSessionStore } from '@/store/session';

type TaggedPostsQueryKey = ['tagged-posts'];

interface TaggedEventPayload {
  readonly taggedPost: TaggedPost;
}

interface UseTaggedPostsResult {
  readonly taggedPosts: TaggedPost[];
  readonly isLoading: boolean;
  readonly hasNextPage: boolean;
  readonly fetchNextPage: () => Promise<unknown>;
  readonly isFetchingNextPage: boolean;
}

/**
 * Hook para gestionar posts etiquetados con soporte para WebSocket en tiempo real.
 */
export const useTaggedPosts = (): UseTaggedPostsResult => {
  const accessToken = useSessionStore((state) => state.accessToken);
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const queryClient = useQueryClient();
  const queryKey = useMemo<TaggedPostsQueryKey>(() => ['tagged-posts'], []);

  // Query de posts etiquetados
  const taggedQuery = useInfiniteQuery<
    TaggedPostsResponse,
    Error,
    InfiniteData<TaggedPostsResponse>,
    TaggedPostsQueryKey,
    string | undefined
  >({
    queryKey,
    queryFn: async ({ pageParam }) => getTaggedPosts(20, pageParam ?? undefined),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isHydrated && Boolean(accessToken),
    staleTime: 30000
  });

  // Configurar WebSocket para nuevas etiquetas
  useEffect(() => {
    if (!isHydrated || !accessToken) {
      return;
    }

    const socket = getSocketClient();
    if (!socket) {
      return;
    }

    // Escuchar nuevas etiquetas
    const handleNewTag = (tagData: TaggedEventPayload): void => {
      queryClient.setQueryData<InfiniteData<TaggedPostsResponse>>(queryKey, (old) => {
        if (!old) {
          return {
            pages: [{ items: [tagData.taggedPost], nextCursor: null }],
            pageParams: [undefined]
          };
        }

        const [firstPage, ...restPages] = old.pages;
        if (!firstPage) {
          return old;
        }

        return {
          ...old,
          pages: [
            (() => {
              const exists = firstPage.items.some(
                (item) =>
                  item.postId === tagData.taggedPost.postId &&
                  item.mediaIndex === tagData.taggedPost.mediaIndex
              );

              if (exists) {
                return firstPage;
              }

              return {
                ...firstPage,
                items: [tagData.taggedPost, ...firstPage.items]
              };
            })(),
            ...restPages
          ]
        };
      });
    };

    socket.on('tagged', handleNewTag);

    return () => {
      socket.off('tagged', handleNewTag);
    };
  }, [isHydrated, accessToken, queryClient, queryKey]);

  const aggregatedTaggedPosts = useMemo(
    () => taggedQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [taggedQuery.data]
  );

  return {
    taggedPosts: aggregatedTaggedPosts,
    isLoading: taggedQuery.isLoading,
    hasNextPage: taggedQuery.hasNextPage,
    fetchNextPage: async () => taggedQuery.fetchNextPage(),
    isFetchingNextPage: taggedQuery.isFetchingNextPage
  };
};

