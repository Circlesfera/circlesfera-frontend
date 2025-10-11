import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';

export interface PresenceStatus {
  isOnline: boolean;
  lastSeen?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
}

/**
 * Hook para manejar el estado de presencia de usuarios
 * @param userId ID del usuario del cual obtener el estado
 * @returns Estado de presencia del usuario
 */
export function usePresenceStatus(userId?: string): PresenceStatus {
  const [presence, setPresence] = useState<PresenceStatus>({
    isOnline: false,
    status: 'offline'
  });
  const { user } = useAuth();

  useEffect(() => {
    // Si no hay userId o es el usuario actual, no hacer nada
    if (!userId || userId === user?._id) {
      setPresence({
        isOnline: true,
        status: 'online'
      });
      return;
    }

    // TODO: Implementar WebSocket para estado de presencia en tiempo real
    // Por ahora, simular estado basado en actividad reciente
    const checkPresence = async () => {
      try {
        // Aquí iría la lógica para obtener el estado real del usuario
        // Por ejemplo, desde un endpoint de API o WebSocket
        // const response = await api.get(`/users/${userId}/presence`);
        // setPresence(response.data);

        // Simulación temporal - en producción esto vendría del backend
        setPresence({
          isOnline: Math.random() > 0.5, // Simulación aleatoria
          status: Math.random() > 0.5 ? 'online' : 'offline',
          lastSeen: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error checking presence status:', error);
        setPresence({
          isOnline: false,
          status: 'offline'
        });
      }
    };

    checkPresence();

    // Actualizar cada 30 segundos (en producción sería WebSocket)
    const interval = setInterval(checkPresence, 30000);

    return () => clearInterval(interval);
  }, [userId, user?._id]);

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

  useEffect(() => {
    const updatePresenceMap = async () => {
      const newMap: Record<string, PresenceStatus> = {};

      for (const userId of userIds) {
        if (userId === user?._id) {
          newMap[userId] = {
            isOnline: true,
            status: 'online'
          };
        } else {
          // TODO: Implementar consulta real de presencia
          newMap[userId] = {
            isOnline: Math.random() > 0.5,
            status: Math.random() > 0.5 ? 'online' : 'offline',
            lastSeen: new Date().toISOString()
          };
        }
      }

      setPresenceMap(newMap);
    };

    if (userIds.length > 0) {
      updatePresenceMap();

      // Actualizar cada 30 segundos
      const interval = setInterval(updatePresenceMap, 30000);
      return () => clearInterval(interval);
    }

    // Retornar undefined explícitamente cuando no hay userIds
    return undefined;
  }, [userIds, user?._id]);

  return presenceMap;
}
