"use client";
import { useEffect, useState, useCallback } from 'react';
import { getUnreadCount } from '@/services/notificationService';
import { useAuth } from '@/features/auth/useAuth';

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

      setUnread(0);
    }
  }, [user]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Actualiza cada 30s
    return () => clearInterval(interval);
  }, [fetchUnread]);

  return unread;
}
