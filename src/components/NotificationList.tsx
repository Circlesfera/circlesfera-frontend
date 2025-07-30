import React, { useEffect, useState } from 'react';
import { getNotifications, markNotificationAsRead, Notification } from '@/services/notificationService';
import { useAuth } from '@/features/auth/useAuth';

export default function NotificationList() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    getNotifications(token!).then(data => {
      setNotifications(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id, token!);
    fetchNotifications();
  };

  return (
    <div className="max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Notificaciones</h2>
      {loading ? (
        <div className="text-gray-400 text-sm">Cargando notificaciones...</div>
      ) : notifications.length === 0 ? (
        <div className="text-gray-400 text-sm">No tienes notificaciones.</div>
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map(n => (
            <li key={n._id} className={`flex items-center gap-3 p-3 rounded ${n.read ? 'bg-gray-100' : 'bg-blue-50'}`}>
              {n.from?.avatar ? (
                <img src={n.from.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                  {n.from?.username[0].toUpperCase()}
                </span>
              )}
              <span className="flex-1 text-sm">
                <b>{n.from?.username}</b> {n.message}
                <span className="ml-2 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
              </span>
              {!n.read && (
                <button onClick={() => handleMarkAsRead(n._id)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Marcar como leída</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
