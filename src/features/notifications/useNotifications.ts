"use client";
import { useEffect, useState, useCallback } from 'react';
import { getNotifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notificationService';
import { useAuth } from '@/features/auth/useAuth';
import type { Notification } from '@/types';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [notificationsData, unreadCountData] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);

      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (err) {

      setError('Error al cargar notificaciones');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);

      // Actualizar el estado local
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Actualizar el conteo
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {

      setError('Error al marcar notificación como leída');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();

      // Actualizar el estado local
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );

      setUnreadCount(0);
    } catch (err) {

      setError('Error al marcar todas las notificaciones como leídas');
    }
  }, []);

  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Actualizar cada 60 segundos (reducir frecuencia)
    const interval = setInterval(fetchNotifications, 60000);

    return () => clearInterval(interval);
  }, [user?._id]); // Solo depende del ID del usuario

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
}
