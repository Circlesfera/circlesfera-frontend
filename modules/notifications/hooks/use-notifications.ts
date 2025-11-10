import { type InfiniteData, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';

import { getSocketClient } from '@/lib/socket-client';
import {
  fetchNotifications,
  getUnreadCount,
  type Notification,
  type NotificationCursorResponse,
  type UnreadCountResponse
} from '@/services/api/notifications';
import { useSessionStore } from '@/store/session';

type NotificationsQueryKey = ['notifications', boolean];

interface UseNotificationsResult {
  readonly notifications: Notification[];
  readonly unreadCount: number;
  readonly isLoading: boolean;
  readonly hasNextPage: boolean;
  readonly fetchNextPage: () => Promise<unknown>;
  readonly isFetchingNextPage: boolean;
}

/**
 * Hook para gestionar notificaciones con soporte para WebSocket en tiempo real.
 */
export const useNotifications = (unreadOnly = false): UseNotificationsResult => {
  const queryClient = useQueryClient();
  const accessToken = useSessionStore((state) => state.accessToken);
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const socketRef = useRef<ReturnType<typeof getSocketClient> | null>(null);
  const notificationsQueryKey = useMemo<NotificationsQueryKey>(
    () => ['notifications', unreadOnly],
    [unreadOnly]
  );

  // Query de notificaciones
  const notificationsQuery = useInfiniteQuery<
    NotificationCursorResponse,
    Error,
    InfiniteData<NotificationCursorResponse>,
    NotificationsQueryKey,
    string | null
  >({
    queryKey: notificationsQueryKey,
    queryFn: async ({ pageParam }) => fetchNotifications(pageParam ?? null, 20, unreadOnly),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    enabled: isHydrated && Boolean(accessToken),
    staleTime: 30000
  });

  const aggregatedNotifications = useMemo(
    () => notificationsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [notificationsQuery.data]
  );

  // Query de contador de no leídas
  const unreadCountQuery = useQuery<UnreadCountResponse>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => getUnreadCount(),
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
    const handleNotification = (notification: Notification): void => {
      queryClient.setQueryData<InfiniteData<NotificationCursorResponse>>(['notifications', false], (old) => {
        if (!old) {
          return {
            pageParams: [null],
            pages: [
              {
                data: [notification],
                nextCursor: null,
                unreadCount: 1
              }
            ]
          };
        }

        return {
          ...old,
          pages: old.pages.map((page, index) =>
            index === 0
              ? {
                  ...page,
                  data: [notification, ...page.data],
                  unreadCount: (page.unreadCount ?? 0) + 1
                }
              : page
          )
        };
      });

      // Invalidar contador
      void queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    };

    // Escuchar actualizaciones del contador
    const handleUnreadCount = ({ unreadCount }: { unreadCount: number }): void => {
      queryClient.setQueryData<UnreadCountResponse>(['notifications', 'unread-count'], { unreadCount });
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
    notifications: aggregatedNotifications,
    unreadCount: unreadCountQuery.data?.unreadCount ?? 0,
    isLoading: notificationsQuery.isLoading,
    hasNextPage: notificationsQuery.hasNextPage ?? false,
    fetchNextPage: async () => notificationsQuery.fetchNextPage(),
    isFetchingNextPage: notificationsQuery.isFetchingNextPage
  };
};

