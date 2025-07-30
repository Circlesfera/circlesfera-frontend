"use client";

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
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">Notificaciones</h2>
      {loading ? (
        <div className="text-gray-400 text-sm">Cargando notificaciones...</div>
      ) : notifications.length === 0 ? (
        <div className="text-gray-400 text-sm">No tienes notificaciones.</div>
      ) : (
        <ul className="flex flex-col gap-3">
          {notifications.map(n => (
            <li key={n._id} className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${n.read ? 'bg-gray-100 border-gray-100' : 'bg-blue-50 border-[var(--accent)]/30 shadow-sm'}`}>
              {n.from?.avatar ? (
                <img src={n.from.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[var(--accent)] shadow-sm" />
              ) : (
                <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--accent)] to-blue-400 flex items-center justify-center font-bold text-white text-lg border-2 border-white shadow-sm">
                  {n.from?.username[0].toUpperCase()}
                </span>
              )}
              <span className="flex-1 text-base text-gray-700">
                <b>{n.from?.username}</b> {n.message}
                <span className="ml-2 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
              </span>
              {!n.read && (
                <button onClick={() => handleMarkAsRead(n._id)} className="text-xs bg-[var(--accent)] text-white px-3 py-1 rounded-full hover:bg-violet-700 transition-all font-semibold shadow-sm">Marcar como leída</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
