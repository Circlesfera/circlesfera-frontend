import api from './axios';
import type { Notification } from '@/types';

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const res = await api.get('/notifications');
    
    // El backend devuelve { success: true, notifications: [...] }
    if (res.data.success && Array.isArray(res.data.notifications)) {
      return res.data.notifications;
    }
    
    // Fallback para otros formatos posibles
    if (Array.isArray(res.data)) {
      return res.data;
    }
    
    if (res.data.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }

    return [];
  } catch (error) {

    return [];
  }
};

export const getUnreadCount = async (): Promise<number> => {
  try {
    const res = await api.get('/notifications/unread/count');
    
    if (res.data.success && typeof res.data.count === 'number') {
      return res.data.count;
    }

    return 0;
  } catch (error) {

    return 0;
  }
};

export const markNotificationAsRead = async (id: string) => {
  try {
    await api.put(`/notifications/${id}/read`, {});
  } catch (error) {

    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    await api.put('/notifications/read/all', {});
  } catch (error) {

    throw error;
  }
};
