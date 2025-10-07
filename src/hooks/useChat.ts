import { useState, useCallback, useEffect, useRef } from 'react';
import { getMessages, sendTextMessage, Message } from '@/services/messageService';
import { useAuth } from '@/features/auth/useAuth';
import { useWebSocket } from './useWebSocket';

interface UseChatOptions {
  conversationId: string;
}

interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  sending: boolean;
  hasMore: boolean;
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Cargar mensajes iniciales
  useEffect(() => {
    loadInitialMessages();
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, token]);

  // Cargar más mensajes (paginación hacia arriba)
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !token) return;

    try {
      setLoading(true);
      const nextPage = page + 1;
      const response = await getMessages(conversationId, token, nextPage);

      setMessages(prev => [...response.messages.reverse(), ...prev]);
      setHasMore(response.pagination.page < response.pagination.pages);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more messages:', error);
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
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setSending(false);
    }
  }, [conversationId, token, sending]);

  // Marcar mensaje como leído
  const markAsRead = useCallback((messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === messageId ? { ...msg, read: true } : msg
      )
    );
  }, []);

  // Scroll al final del chat
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return {
    messages,
    loading,
    sending,
    hasMore,
    loadMore,
    sendMessage,
    markAsRead,
    scrollToBottom
  };
}

