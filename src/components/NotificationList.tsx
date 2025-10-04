"use client";

import React, { useEffect, useState } from 'react';
import { getNotifications, markNotificationAsRead } from '@/services/notificationService';
import type { Notification } from '@/types';

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para generar el mensaje de notificación basado en el tipo
  const getNotificationMessage = (notification: Notification): string => {
    const typeMessages = {
      like: 'le gustó tu publicación',
      comment: 'comentó en tu publicación',
      follow: 'empezó a seguirte',
      mention: 'te mencionó en un comentario',
      message: 'te envió un mensaje',
      story: 'vio tu story',
      post: 'publicó algo nuevo',
      reel: 'creó un nuevo reel'
    };
    return typeMessages[notification.type] || 'realizó una acción';
  };

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.error('getNotifications no devolvió un array:', data);
        setError('Error al cargar notificaciones');
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      setError('Error al cargar notificaciones');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Todas las notificaciones</h2>
        <p className="text-gray-600 text-sm mt-1">Gestiona tus notificaciones y mantente al día</p>
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando notificaciones...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error al cargar</h3>
            <p className="text-red-500">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V4a1 1 0 00-1-1H5a1 1 0 00-1 1v1zm0 6h6V9H4v2zm0 4h6v-2H4v2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes notificaciones</h3>
            <p className="text-gray-600">Cuando tengas actividad en tu cuenta, aparecerá aquí.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {notifications.map(n => (
              <li key={n._id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                n.isRead 
                  ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' 
                  : 'bg-blue-50 border-blue-200 shadow-sm hover:bg-blue-100'
              }`}>
                {n.from?.avatar ? (
                  <img src={n.from.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0" />
                ) : (
                  <span className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg border-2 border-white shadow-sm flex-shrink-0">
                    {n.from?.username?.[0]?.toUpperCase()}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">{n.from?.username}</span> {getNotificationMessage(n)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 ml-4 flex-shrink-0">
                      {new Date(n.createdAt).toLocaleString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {!n.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(n._id)} 
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full transition-colors font-medium shadow-sm"
                    >
                      Marcar como leída
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
