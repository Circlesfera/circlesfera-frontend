'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ReactElement } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotifications } from '../hooks/use-notifications';
import { markNotificationAsRead, markAllAsRead, type Notification } from '@/services/api/notifications';
import { formatRelativeTime } from '@/modules/feed/utils/formatters';
import { toast } from 'sonner';

/**
 * Renderiza el listado de notificaciones con soporte para marcar como leído.
 */
export function NotificationsShell(): ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { notifications, unreadCount, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useNotifications(false);

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: () => {
      toast.error('No se pudo marcar la notificación como leída');
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('Todas las notificaciones marcadas como leídas');
    },
    onError: () => {
      toast.error('No se pudieron marcar todas como leídas');
    }
  });

  const getNotificationMessage = (notification: Notification): string => {
    const actorName = notification.actor?.displayName ?? 'Alguien';

    switch (notification.type) {
      case 'like':
        return `${actorName} le dio like a tu publicación`;
      case 'comment':
        return `${actorName} comentó en tu publicación`;
      case 'follow':
        return `${actorName} empezó a seguirte`;
      case 'mention':
        return `${actorName} te mencionó`;
      case 'reply':
        return `${actorName} respondió a tu comentario`;
      default:
        return 'Nueva notificación';
    }
  };

  const getNotificationLink = (notification: Notification): string => {
    if (notification.postId) {
      return `/posts/${notification.postId}`;
    }
    if (notification.actor) {
      return `/${notification.actor.handle}`;
    }
    return '/feed';
  };

  const handleNotificationClick = (notification: Notification): void => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    router.push(getNotificationLink(notification));
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-400">Cargando notificaciones...</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-6">
        <svg className="size-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-300">No hay notificaciones</h2>
          <p className="mt-1 text-sm text-slate-500">Te avisaremos cuando tengas nuevas notificaciones</p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex w-full flex-col">
      {unreadCount > 0 ? (
        <div className="border-b border-white/10 px-6 py-3">
          <button
            type="button"
            onClick={() => {
              markAllAsReadMutation.mutate();
            }}
            disabled={markAllAsReadMutation.isPending}
            className="text-sm text-primary-400 hover:text-primary-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {markAllAsReadMutation.isPending ? 'Marcando...' : 'Marcar todas como leídas'}
          </button>
        </div>
      ) : null}

      <div className="divide-y divide-white/10">
        {notifications.map((notification: Notification) => (
          <button
            key={notification.id}
            type="button"
            onClick={() => {
              handleNotificationClick(notification);
            }}
            className={`flex w-full items-start gap-4 px-6 py-4 text-left transition hover:bg-white/5 ${
              notification.isRead ? 'opacity-60' : 'bg-primary-500/10'
            }`}
          >
            {notification.actor ? (
              <Image
                src={notification.actor.avatarUrl}
                alt={notification.actor.displayName}
                width={48}
                height={48}
                className="size-12 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="size-12 shrink-0 rounded-full bg-slate-700" />
            )}

            <div className="flex-1">
              <p className="text-sm text-slate-100">{getNotificationMessage(notification)}</p>
              <p className="mt-1 text-xs text-slate-400">{formatRelativeTime(notification.createdAt)}</p>
            </div>

            {!notification.isRead ? (
              <div className="size-2 shrink-0 rounded-full bg-primary-500" />
            ) : null}
          </button>
        ))}
      </div>

      {hasNextPage ? (
        <button
          type="button"
          onClick={() => {
            void fetchNextPage();
          }}
          disabled={isFetchingNextPage}
          className="mx-auto my-4 rounded-full bg-primary-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:bg-slate-700"
        >
          {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
        </button>
      ) : null}
    </section>
  );
}

