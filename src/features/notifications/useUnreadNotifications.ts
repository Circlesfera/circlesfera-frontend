import { useEffect, useState } from 'react';
import { getNotifications } from '@/services/notificationService';
import { useAuth } from '@/features/auth/useAuth';

export function useUnreadNotifications() {
  const { token } = useAuth();
  const [unread, setUnread] = useState(0);

  const fetchUnread = async () => {
    if (!token) return;
    const notifications = await getNotifications(token);
    setUnread(notifications.filter(n => !n.read).length);
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Actualiza cada 30s
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [token]);

  return unread;
}
