import { useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import { getSocketClient } from '@/lib/socket-client';
import { getTaggedPosts, type TaggedPost } from '@/services/api/tags';
import { useSessionStore } from '@/store/session';

/**
 * Hook para gestionar posts etiquetados con soporte para WebSocket en tiempo real.
 */
export const useTaggedPosts = () => {
  const queryClient = useQueryClient();
  const accessToken = useSessionStore((state) => state.accessToken);
  const isHydrated = useSessionStore((state) => state.isHydrated);

  // Query de posts etiquetados
  const taggedQuery = useInfiniteQuery({
    queryKey: ['tagged-posts'],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => 
      getTaggedPosts(20, pageParam),
    initialPageParam: undefined as string | undefined,
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
    const handleNewTag = (tagData: { taggedPost: TaggedPost }) => {
      queryClient.setQueryData(['tagged-posts'], (old: any) => {
        if (!old) {
          return {
            pages: [{ items: [tagData.taggedPost], nextCursor: null }],
            pageParams: [undefined]
          };
        }

        return {
          ...old,
          pages: old.pages.map((page: { items: TaggedPost[]; nextCursor: string | null }, index: number) => {
            if (index === 0) {
              // Verificar si el post ya existe
              const exists = page.items.some(
                (item) => item.postId === tagData.taggedPost.postId && 
                         item.mediaIndex === tagData.taggedPost.mediaIndex
              );
              if (exists) {
                return page;
              }
              return {
                ...page,
                items: [tagData.taggedPost, ...page.items]
              };
            }
            return page;
          })
        };
      });
    };

    socket.on('tagged', handleNewTag);

    return () => {
      socket.off('tagged', handleNewTag);
    };
  }, [isHydrated, accessToken, queryClient]);

  return {
    taggedPosts: taggedQuery.data?.pages.flatMap((page) => page.items) ?? [],
    isLoading: taggedQuery.isLoading,
    hasNextPage: taggedQuery.hasNextPage,
    fetchNextPage: taggedQuery.fetchNextPage,
    isFetchingNextPage: taggedQuery.isFetchingNextPage
  };
};

