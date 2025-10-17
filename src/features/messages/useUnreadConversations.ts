"use client";
import { useEffect, useState, useCallback } from 'react';
import { getConversations } from '@/services/conversationService';
import { useAuth } from '@/features/auth/useAuth';
import logger from '@/utils/logger';

export function useUnreadConversations() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadConversations = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await getConversations(1, 100); // Obtener más conversaciones para un conteo preciso
      if (response && response.conversations) {
        // Contar conversaciones que tienen mensajes sin leer
        // Una conversación tiene mensajes sin leer si:
        // 1. Tiene un lastMessage
        // 2. El lastMessage no fue enviado por el usuario actual
        // 3. El mensaje fue enviado después del último acceso del usuario a esa conversación

        const unreadConversations = response.conversations.filter(conversation => {
          // Si no hay mensaje, no hay nada sin leer
          if (!conversation.lastMessage) {
            return false;
          }

          // Si el último mensaje fue enviado por el usuario actual, no hay nada sin leer
          if (conversation.lastMessage.sender.id === user.id) {
            return false;
          }

          // Usar el unreadCount directamente de la conversación si está disponible
          if (conversation.unreadCount && conversation.unreadCount > 0) {
            return true;
          }

          // Si el usuario no ha accedido a esta conversación, considerar como sin leer
          // o si el último mensaje es más reciente que el último acceso
          const lastRead = conversation.settings?.userSettings?.lastRead;
          const messageDate = new Date(conversation.lastMessage.createdAt);

          if (!lastRead) {
            return true; // Nunca ha leído, está sin leer
          }

          const readDate = new Date(lastRead);
          return messageDate > readDate;
        });

        setUnreadCount(unreadConversations.length);

        logger.debug('Unread conversations count:', {
          total: response.conversations.length,
          unread: unreadConversations.length,
          userId: user.id
        });
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      logger.error('Error fetching unread conversations count:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: user.id
      });
      setUnreadCount(0);
    }
  }, [user]);

  // Cargar el conteo inicial
  useEffect(() => {
    fetchUnreadConversations();
  }, [fetchUnreadConversations]);

  // Actualizar el conteo periódicamente (cada 30 segundos)
  useEffect(() => {
    const interval = setInterval(fetchUnreadConversations, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadConversations]);

  return {
    unreadCount,
    refreshUnreadCount: fetchUnreadConversations
  };
}
