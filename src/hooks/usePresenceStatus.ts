import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { io, Socket } from 'socket.io-client';
import { config } from '@/config/env';
import logger from '@/utils/logger';

export interface PresenceStatus {
  isOnline: boolean;
  lastSeen?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
}

// Socket singleton para presencia
let presenceSocket: Socket | null = null;

/**
 * Hook para manejar el estado de presencia de usuarios
 * @param userId ID del usuario del cual obtener el estado
 * @returns Estado de presencia del usuario
 */
// Inicializar socket de presencia
const getPresenceSocket = (): Socket => {
  if (!presenceSocket) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    presenceSocket = io(config.apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    presenceSocket.on('connect', () => {
      logger.info('Presence socket connected');
    });

    presenceSocket.on('disconnect', () => {
      logger.info('Presence socket disconnected');
    });
  }

  return presenceSocket;
};

export function usePresenceStatus(userId?: string): PresenceStatus {
  const [presence, setPresence] = useState<PresenceStatus>({
    isOnline: false,
    status: 'offline'
  });
  const { user } = useAuth();

  useEffect(() => {
    // Si no hay userId o es el usuario actual, no hacer nada
    if (!userId || userId === user?.id) {
      setPresence({
        isOnline: true,
        status: 'online'
      });
      return;
    }

    // Conectar al WebSocket de presencia
    const socket = getPresenceSocket();

    // Pedir estado inicial
    socket.emit('presence:get', { userIds: [userId] });

    // Escuchar cambios de estado
    const handlePresenceChange = (data: { userId: string; status: string }) => {
      if (data.userId === userId) {
        setPresence({
          isOnline: data.status === 'online',
          status: data.status as 'online' | 'away' | 'offline'
        });
      }
    };

    // Escuchar respuesta bulk de presencia
    const handlePresenceBulk = (data: Record<string, string>) => {
      if (data[userId]) {
        setPresence({
          isOnline: data[userId] === 'online',
          status: data[userId] as 'online' | 'away' | 'offline'
        });
      }
    };

    socket.on('presence:change', handlePresenceChange);
    socket.on('presence:bulk', handlePresenceBulk);

    return () => {
      socket.off('presence:change', handlePresenceChange);
      socket.off('presence:bulk', handlePresenceBulk);
    };
  }, [userId, user?.id]);

  return presence;
}

/**
 * Hook para obtener el estado de presencia de múltiples usuarios
 * @param userIds Array de IDs de usuarios
 * @returns Mapa de estados de presencia
 */
export function useMultiplePresenceStatus(userIds: string[]): Record<string, PresenceStatus> {
  const [presenceMap, setPresenceMap] = useState<Record<string, PresenceStatus>>({});
  const { user } = useAuth();

  const updatePresenceStatus = useCallback((userId: string, status: string) => {
    setPresenceMap(prev => ({
      ...prev,
      [userId]: {
        isOnline: status === 'online',
        status: status as 'online' | 'away' | 'offline'
      }
    }));
  }, []);

  useEffect(() => {
    if (userIds.length === 0) {
      return;
    }

    // Inicializar presencia del usuario actual
    const initialMap: Record<string, PresenceStatus> = {};
    userIds.forEach(userId => {
      if (userId === user?.id) {
        initialMap[userId] = {
          isOnline: true,
          status: 'online'
        };
      } else {
        initialMap[userId] = {
          isOnline: false,
          status: 'offline'
        };
      }
    });
    setPresenceMap(initialMap);

    // Conectar al WebSocket
    const socket = getPresenceSocket();

    // Filtrar solo usuarios que no son el actual
    const otherUserIds = userIds.filter(id => id !== user?.id);

    if (otherUserIds.length > 0) {
      // Pedir estados iniciales
      socket.emit('presence:get', { userIds: otherUserIds });
    }

    // Escuchar cambios de estado
    const handlePresenceChange = (data: { userId: string; status: string }) => {
      if (userIds.includes(data.userId)) {
        updatePresenceStatus(data.userId, data.status);
      }
    };

    // Escuchar respuesta bulk
    const handlePresenceBulk = (data: Record<string, string>) => {
      Object.entries(data).forEach(([userId, status]) => {
        if (userIds.includes(userId)) {
          updatePresenceStatus(userId, status);
        }
      });
    };

    socket.on('presence:change', handlePresenceChange);
    socket.on('presence:bulk', handlePresenceBulk);

    return () => {
      socket.off('presence:change', handlePresenceChange);
      socket.off('presence:bulk', handlePresenceBulk);
    };
  }, [userIds, user?.id, updatePresenceStatus]);

  return presenceMap;
}
