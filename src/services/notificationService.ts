import api from './axios';

export interface Notification {
  _id: string;
  type: 'like' | 'comment' | 'follow' | 'story';
  from: {
    _id: string;
    username: string;
    avatar?: string;
  };
  post?: string;
  story?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const getNotifications = async (token: string): Promise<Notification[]> => {
  const res = await api.get('/notifications', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const markNotificationAsRead = async (id: string, token: string) => {
  await api.put(`/notifications/${id}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
