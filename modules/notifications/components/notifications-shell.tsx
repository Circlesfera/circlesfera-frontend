'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type ReactElement } from 'react';
import { toast } from 'sonner';

import { fadeUpVariants, staggerContainer, staggerItem } from '@/lib/motion-config';
import { formatRelativeTime } from '@/modules/feed/utils/formatters';
import { markAllAsRead, markNotificationAsRead, type Notification } from '@/services/api/notifications';

import { useNotifications } from '../hooks/use-notifications';

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
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: () => {
      toast.error('No se pudo marcar la notificación como leída');
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('Todas las notificaciones marcadas como leídas');
    },
    onError: () => {
      toast.error('No se pudieron marcar todas como leídas');
    }
  });

  const getNotificationMessage = (notification: Notification): string => {
    const actorName = notification.actor?.displayName ?? 'Alguien';
    const targetLabel = notification.targetModel === 'Frame' ? 'frame' : 'publicación';

    switch (notification.type) {
      case 'like':
        return `${actorName} le dio like a tu ${targetLabel}`;
      case 'comment':
        return `${actorName} comentó en tu ${targetLabel}`;
      case 'follow':
        return `${actorName} empezó a seguirte`;
      case 'mention':
        return `${actorName} te mencionó`;
      case 'reply':
        return `${actorName} respondió a tu comentario`;
      case 'tagged':
        return `${actorName} te etiquetó en una publicación`;
      case 'share':
        return `${actorName} compartió tu publicación`;
      default:
        return 'Nueva notificación';
    }
  };

  const getNotificationLink = (notification: Notification): string => {
    if (notification.targetModel === 'Frame' && notification.targetId) {
      return `/frames/${notification.targetId}`;
    }
    if (notification.targetModel === 'Post' && (notification.targetId ?? notification.postId)) {
      return `/posts/${notification.targetId ?? notification.postId}`;
    }
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
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="size-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="flex min-h-[500px] flex-col items-center justify-center gap-6 p-8"
      >
        <div className="rounded-2xl glass-card p-12 text-center max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mx-auto mb-6"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 via-primary-400/20 to-accent-500/20 blur-2xl" />
            <div className="relative size-24 rounded-2xl border border-primary-500/30 bg-gradient-to-br from-slate-100 dark:from-slate-900/50 to-white dark:to-black/50 backdrop-blur-sm flex items-center justify-center shadow-elegant">
              <svg className="size-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No hay notificaciones</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Te avisaremos cuando tengas nuevas notificaciones</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <section className="flex w-full flex-col">
      {unreadCount > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 rounded-2xl glass-card p-4 border border-slate-200/50 dark:border-white/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {unreadCount} {unreadCount === 1 ? 'notificación no leída' : 'notificaciones no leídas'}
              </p>
            </div>
            <motion.button
              type="button"
              onClick={() => {
                markAllAsReadMutation.mutate();
              }}
              disabled={markAllAsReadMutation.isPending}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
            >
              {markAllAsReadMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Marcando...
                </span>
              ) : (
                'Marcar todas como leídas'
              )}
            </motion.button>
          </div>
        </motion.div>
      ) : null}

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <AnimatePresence>
          {notifications.map((notification: Notification) => (
            <motion.button
              key={notification.id}
              variants={staggerItem}
              type="button"
              onClick={() => {
                handleNotificationClick(notification);
              }}
              className={`group flex w-full items-start gap-4 rounded-xl glass-card p-4 text-left transition-all duration-300 hover:scale-[1.01] hover:shadow-elegant-lg ${
                notification.isRead 
                  ? 'opacity-70' 
                  : 'bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent border-l-2 border-primary-500'
              }`}
            >
            {notification.actor ? (
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
              <Image
                src={notification.actor.avatarUrl || `https://api.dicebear.com/7.x/thumbs/svg?seed=${notification.actor.handle}`}
                alt={notification.actor.displayName}
                width={48}
                height={48}
                  className="relative size-12 shrink-0 rounded-full object-cover ring-2 ring-slate-300 dark:ring-slate-800/50 group-hover:ring-primary-500/30 transition-all duration-300"
              />
              </div>
            ) : (
              <div className="size-12 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 ring-2 ring-slate-300 dark:ring-slate-800/50" />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-primary-300 transition-colors duration-200">
                {getNotificationMessage(notification)}
              </p>
              <p className="mt-1 text-xs text-slate-500">{formatRelativeTime(notification.createdAt)}</p>
            </div>

              {!notification.isRead ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="size-2.5 shrink-0 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 shadow-lg shadow-primary-500/50" />
              ) : null}
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {hasNextPage ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center pt-6"
        >
          <motion.button
            type="button"
            onClick={() => {
              void fetchNextPage();
            }}
            disabled={isFetchingNextPage}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
          >
            {isFetchingNextPage ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Cargando...
              </span>
            ) : (
              'Cargar más'
            )}
          </motion.button>
        </motion.div>
      ) : null}
    </section>
  );
}

