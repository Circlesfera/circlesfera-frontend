import { useState, useCallback, useEffect, useRef } from 'react';
import { getMessages, sendTextMessage, Message } from '@/services/messageService';
import { useAuth } from '@/features/auth/useAuth';
import { useWebSocket } from './useWebSocket';
import logger from '@/utils/logger'

interface UseChatOptions {
  conversationId: string;
}

interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  sending: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  markAsRead: (messageId: string) => void;
  scrollToBottom: () => void;
}

/**
 * Hook personalizado para gestionar un chat en tiempo real
 * @param options - Opciones de configuración del chat
 * @returns Estado y funciones para gestionar el chat
 */
export function useChat({ conversationId }: UseChatOptions): UseChatReturn {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll al final del chat (definir PRIMERO, usado por otros callbacks)
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Configurar WebSocket para mensajes en tiempo real
  useWebSocket({
    onMessage: (wsMessage) => {
      if (wsMessage.type === 'new_message' && wsMessage.data && typeof wsMessage.data === 'object' && 'conversation' in wsMessage.data && (wsMessage.data as { conversation: string }).conversation === conversationId) {
        const messageData = wsMessage.data as Message;
        setMessages(prev => [...prev, messageData]);
        scrollToBottom();
      } else if (wsMessage.type === 'message_read' && wsMessage.data && typeof wsMessage.data === 'object' && 'conversation' in wsMessage.data && (wsMessage.data as { conversation: string }).conversation === conversationId) {
        const readData = wsMessage.data as { messageId: string; conversation: string };
        setMessages(prev =>
          prev.map(msg =>
            msg._id === readData.messageId
              ? { ...msg, read: true }
              : msg
          )
        );
      }
    }
  });

  // Declarar loadInitialMessages ANTES del useEffect que lo usa
  const loadInitialMessages = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await getMessages(conversationId, token, 1);
      setMessages(response.messages.reverse());
      setHasMore(response.pagination.page < response.pagination.pages);
      setPage(1);

      // Scroll al final después de cargar
      setTimeout(scrollToBottom, 100);
      logger.debug('Chat messages loaded:', { conversationId, count: response.messages.length });
    } catch (loadError) {
      logger.error('Error loading chat messages:', {
        error: loadError instanceof Error ? loadError.message : 'Unknown error',
        conversationId
      });
      setError('Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  }, [conversationId, token, scrollToBottom]);

  // Cargar mensajes iniciales
  useEffect(() => {
    loadInitialMessages();
  }, [loadInitialMessages]);

  // Cargar más mensajes (paginación hacia arriba)
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !token) return;

    const nextPage = page + 1;
    try {
      setLoading(true);
      const response = await getMessages(conversationId, token, nextPage);

      setMessages(prev => [...response.messages.reverse(), ...prev]);
      setHasMore(response.pagination.page < response.pagination.pages);
      setPage(nextPage);
      logger.debug('More chat messages loaded:', { conversationId, count: response.messages.length, page: nextPage });
    } catch (loadMoreError) {
      logger.error('Error loading more chat messages:', {
        error: loadMoreError instanceof Error ? loadMoreError.message : 'Unknown error',
        conversationId,
        page: nextPage
      });
      setError('Error al cargar más mensajes');
    } finally {
      setLoading(false);
    }
  }, [conversationId, token, loading, hasMore, page]);

  // Enviar mensaje
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !token || sending) return;

    try {
      setSending(true);
      const response = await sendTextMessage(conversationId, text, token);

      if (response.success) {
        // El mensaje se agregará vía WebSocket
        scrollToBottom();
        logger.info('Chat message sent:', { conversationId });
      }
    } catch (sendError) {
      logger.error('Error sending chat message:', {
        error: sendError instanceof Error ? sendError.message : 'Unknown error',
        conversationId
      });
      setError('Error al enviar mensaje');
      throw sendError;
    } finally {
      setSending(false);
    }
  }, [conversationId, token, sending, scrollToBottom]);

  // Marcar mensaje como leído
  const markAsRead = useCallback((messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === messageId ? { ...msg, read: true } : msg
      )
    );
  }, []);

  return {
    messages,
    loading,
    sending,
    hasMore,
    error,
    loadMore,
    sendMessage,
    markAsRead,
    scrollToBottom
  };
}

