"use client";
import { useEffect, useState } from 'react';
import { getNotifications } from '@/services/notificationService';
import { useAuth } from '@/features/auth/useAuth';

export function useUnreadNotifications() {
  const { token } = useAuth();
  const [unread, setUnread] = useState(0);

  const fetchUnread = async () => {
    if (!token) return;
    try {
      const notifications = await getNotifications(token);
      if (Array.isArray(notifications)) {
        setUnread(notifications.filter(n => !n.read).length);
      } else {
        console.error('getNotifications no devolvió un array:', notifications);
        setUnread(0);
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      setUnread(0);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Actualiza cada 30s
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [token]);

  return unread;
}
