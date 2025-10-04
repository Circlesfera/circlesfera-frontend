import api from './axios';
import type { Notification } from '@/types';

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const res = await api.get('/api/notifications');
    
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
    
    console.warn('Formato de respuesta inesperado para notificaciones:', res.data);
    return [];
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return [];
  }
};

export const getUnreadCount = async (): Promise<number> => {
  try {
    const res = await api.get('/api/notifications/unread/count');
    
    if (res.data.success && typeof res.data.count === 'number') {
      return res.data.count;
    }
    
    console.warn('Formato de respuesta inesperado para conteo de notificaciones:', res.data);
    return 0;
  } catch (error) {
    console.error('Error al obtener conteo de notificaciones:', error);
    return 0;
  }
};

export const markNotificationAsRead = async (id: string) => {
  try {
    await api.put(`/api/notifications/${id}/read`, {});
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    await api.put('/api/notifications/read/all', {});
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    throw error;
  }
};
