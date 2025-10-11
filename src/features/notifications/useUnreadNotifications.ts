"use client";
import { useEffect, useState, useCallback } from 'react';
import { getUnreadCount } from '@/services/notificationService';
import { useAuth } from '@/features/auth/useAuth';
import logger from '@/utils/logger';

export function useUnreadNotifications() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!user) {
      setUnread(0);
      return;
    }

    try {
      const unreadCount = await getUnreadCount();
      setUnread(unreadCount);
    } catch (error) {
      // ✅ IMPLEMENTADO: Logging de error al obtener notificaciones no leídas
      logger.error('Error fetching unread notifications count:', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      setUnread(0);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    fetchUnread();
    const interval = setInterval(fetchUnread, 60000); // Reducir frecuencia a 60s
    return () => clearInterval(interval);
  }, [user?._id]); // Solo depende del ID del usuario, no de fetchUnread

  return unread;
}
