import { useEffect, useRef } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';

import { getSocketClient } from '@/lib/socket-client';
import { fetchNotifications, getUnreadCount, type Notification } from '@/services/api/notifications';
import { useSessionStore } from '@/store/session';

/**
 * Hook para gestionar notificaciones con soporte para WebSocket en tiempo real.
 */
export const useNotifications = (unreadOnly = false) => {
  const queryClient = useQueryClient();
  const accessToken = useSessionStore((state) => state.accessToken);
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const socketRef = useRef<ReturnType<typeof getSocketClient> | null>(null);

  // Query de notificaciones
  const notificationsQuery = useInfiniteQuery({
    queryKey: ['notifications', unreadOnly],
    queryFn: ({ pageParam }: { pageParam: string | null }) => fetchNotifications(pageParam, 20, unreadOnly),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: isHydrated && Boolean(accessToken),
    staleTime: 30000
  });

  // Query de contador de no leídas
  const unreadCountQuery = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    enabled: isHydrated && Boolean(accessToken),
    refetchInterval: 60000 // Refrescar cada minuto
  });

  // Configurar WebSocket
  useEffect(() => {
    if (!isHydrated || !accessToken) {
      return;
    }

    const socket = getSocketClient();
    if (!socket) {
      return;
    }

    socketRef.current = socket;

    // Escuchar nuevas notificaciones
    const handleNotification = (notification: Notification) => {
      queryClient.setQueryData(['notifications', false], (old: any) => {
        if (!old) {
          return {
            pages: [{ data: [notification], nextCursor: null, unreadCount: 1 }],
            pageParams: [null as string | null]
          };
        }

        return {
          ...old,
          pages: old.pages.map((page: { data: Notification[]; nextCursor: string | null; unreadCount: number }, index: number) => {
            if (index === 0) {
              return {
                ...page,
                data: [notification, ...page.data],
                unreadCount: (page.unreadCount ?? 0) + 1
              };
            }
            return page;
          })
        };
      });

      // Invalidar contador
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    };

    // Escuchar actualizaciones del contador
    const handleUnreadCount = ({ unreadCount }: { unreadCount: number }) => {
      queryClient.setQueryData(['notifications', 'unread-count'], { unreadCount });
    };

    socket.on('notification', handleNotification);
    socket.on('unread-count', handleUnreadCount);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('unread-count', handleUnreadCount);
    };
  }, [isHydrated, accessToken, queryClient]);

  // Nota: No desconectamos el socket aquí porque puede ser usado por otros componentes.
  // El socket se desconectará automáticamente cuando no haya más referencias o cuando
  // el usuario cierre sesión.

  return {
    notifications: notificationsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    unreadCount: unreadCountQuery.data?.unreadCount ?? 0,
    isLoading: notificationsQuery.isLoading,
    hasNextPage: notificationsQuery.hasNextPage,
    fetchNextPage: notificationsQuery.fetchNextPage,
    isFetchingNextPage: notificationsQuery.isFetchingNextPage
  };
};

