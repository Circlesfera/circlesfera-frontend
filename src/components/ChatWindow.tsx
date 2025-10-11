import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getMessages, sendTextMessage, sendImageMessage, sendVideoMessage, sendLocationMessage, Message } from '@/services/messageService';
import { getConversations } from '@/services/conversationService';
import { useAuth } from '@/features/auth/useAuth';
import MessageSkeleton from './MessageSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { getMessageSocketService } from '@/services/messageSocketService';
import logger from '@/utils/logger';

// Iconos SVG
const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const VideoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EmojiIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MoreIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

interface ChatWindowProps {
  conversationId: string;
  conversationName?: string;
  participants?: Array<{
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  }>;
}

export default function ChatWindow({ conversationId, conversationName, participants }: ChatWindowProps) {
  const { token, user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [conversationInfo, setConversationInfo] = useState<any>(null);
  const [isUserOnline, setIsUserOnline] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [messageMenuOpen, setMessageMenuOpen] = useState<string | null>(null);
  const messageSocketService = getMessageSocketService();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Obtener información de la conversación
  const fetchConversationInfo = useCallback(async () => {
    if (!token) return;

    try {
      const response = await getConversations();
      if (response && response.conversations) {
        const conversation = response.conversations.find((c: any) => c._id === conversationId);
        if (conversation) {
          setConversationInfo(conversation);
        }
      }
    } catch (error) {
      logger.error('Error fetching conversation info:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        conversationId
      });
    }
  }, [conversationId, token]);

  // Obtener el otro participante (no el usuario actual)
  const getOtherParticipant = () => {
    // Si tenemos participants como prop, usarlos
    if (participants && participants.length > 0) {
      return participants.find(p => p._id !== user?._id) || participants[0];
    }

    // Si no, usar la información de la conversación
    if (conversationInfo && conversationInfo.participants) {
      return conversationInfo.participants.find((p: any) => p._id !== user?._id) || conversationInfo.participants[0];
    }

    return null;
  };

  // Manejar click en el header para ir al perfil
  const handleHeaderClick = () => {
    const otherParticipant = getOtherParticipant();
    if (otherParticipant && otherParticipant.username) {
      router.push(`/${otherParticipant.username}`);
    }
  };

  const fetchMessages = useCallback(async (pageNum = 1, append = false) => {
    if (!token) return;

    try {
      const response = await getMessages(conversationId, token, pageNum);

      if (append) {
        setMessages(prev => [...response.messages, ...prev]);
      } else {
        setMessages(response.messages);
      }

      setHasMore(pageNum < response.pagination.pages);
      setPage(pageNum);
      logger.debug('Chat messages fetched:', { conversationId, page: pageNum, count: response.messages.length });
    } catch (fetchError) {
      logger.error('Error fetching messages:', {
        error: fetchError instanceof Error ? fetchError.message : 'Unknown error',
        conversationId,
        page: pageNum
      });
    } finally {
      setLoading(false);
    }
  }, [conversationId, token]);

  useEffect(() => {
    fetchMessages(1, false);
  }, [fetchMessages]);

  useEffect(() => {
    fetchConversationInfo();
  }, [fetchConversationInfo]);

  // Socket.IO: Unirse a la conversación y escuchar eventos
  useEffect(() => {
    if (!conversationId) return;

    // Unirse a la conversación
    messageSocketService.joinConversation(conversationId);

    // Listener para nuevos mensajes
    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
      // Scroll automático al nuevo mensaje
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };

    // Listener para mensaje editado
    const handleMessageEdited = (data: { messageId: string; content: string }) => {
      setMessages(prev => prev.map(msg =>
        msg._id === data.messageId ? { ...msg, content: { ...msg.content, text: data.content }, isEdited: true } : msg
      ));
    };

    // Listener para mensaje eliminado
    const handleMessageDeleted = (data: { messageId: string; deletedFor: 'me' | 'everyone' }) => {
      if (data.deletedFor === 'everyone') {
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      } else {
        // Marcar como eliminado solo para mí
        setMessages(prev => prev.map(msg =>
          msg._id === data.messageId ? { ...msg, deletedForMe: true } : msg
        ));
      }
    };

    // Listener para typing
    const handleUserTyping = (data: { userId: string; username: string; conversationId: string }) => {
      if (data.conversationId === conversationId && data.userId !== user?._id) {
        setTypingUsers(prev => new Set(prev).add(data.username));
      }
    };

    const handleUserStoppedTyping = (data: { userId: string; conversationId: string }) => {
      if (data.conversationId === conversationId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          // Necesitamos el username para eliminarlo, usaremos el userId por ahora
          return newSet;
        });
      }
    };

    // Listener para estado online/offline
    const handleUserOnline = (data: { userId: string }) => {
      const otherParticipant = getOtherParticipant();
      if (otherParticipant && otherParticipant._id === data.userId) {
        setIsUserOnline(true);
      }
    };

    const handleUserOffline = (data: { userId: string }) => {
      const otherParticipant = getOtherParticipant();
      if (otherParticipant && otherParticipant._id === data.userId) {
        setIsUserOnline(false);
      }
    };

    // Registrar listeners
    messageSocketService.on('new_message', handleNewMessage);
    messageSocketService.on('message:edited', handleMessageEdited);
    messageSocketService.on('message:deleted', handleMessageDeleted);
    messageSocketService.on('user_typing', handleUserTyping);
    messageSocketService.on('user_stopped_typing', handleUserStoppedTyping);
    messageSocketService.on('user_online', handleUserOnline);
    messageSocketService.on('user_offline', handleUserOffline);

    // Verificar estado inicial
    const otherParticipant = getOtherParticipant();
    if (otherParticipant) {
      setIsUserOnline(messageSocketService.isUserOnline(otherParticipant._id));
    }

    // Cleanup
    return () => {
      messageSocketService.leaveConversation(conversationId);
      messageSocketService.off('new_message', handleNewMessage);
      messageSocketService.off('message:edited', handleMessageEdited);
      messageSocketService.off('message:deleted', handleMessageDeleted);
      messageSocketService.off('user_typing', handleUserTyping);
      messageSocketService.off('user_stopped_typing', handleUserStoppedTyping);
      messageSocketService.off('user_online', handleUserOnline);
      messageSocketService.off('user_offline', handleUserOffline);
    };
  }, [conversationId, messageSocketService, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !token) return;

    setSending(true);
    try {
      await sendTextMessage(conversationId, text.trim(), token);
      setText('');
      // Agregar el mensaje optimísticamente
      const newMessage: Message = {
        _id: Date.now().toString(),
        conversation: conversationId,
        sender: {
          _id: user!._id,
          username: user!.username,
          ...(user!.avatar && { avatar: user!.avatar }),
          ...(user!.fullName && { fullName: user!.fullName })
        },
        type: 'text',
        content: {
          text: text.trim()
        },
        status: 'sent',
        isEdited: false,
        isDeleted: false,
        isForwarded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);
      logger.debug('Message sent:', { conversationId });
    } catch (error: unknown) {
      // Logging detallado para debug
      logger.error('Error sending message:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        type: typeof error,
        isAxiosError: error && typeof error === 'object' && 'isAxiosError' in error,
        response: error && typeof error === 'object' && 'response' in error ? {
          status: (error as { response?: { status?: number } }).response?.status,
          data: (error as { response?: { data?: unknown } }).response?.data
        } : undefined,
        conversationId
      });

      // Mostrar mensaje al usuario
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al enviar mensaje'
        : error instanceof Error ? error.message : 'Error al enviar mensaje';

      // TODO: Mostrar toast/notification con errorMessage
      console.error('Error visible al usuario:', errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as React.FormEvent);
    }
  };

  // Funciones para envío multimedia
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setSending(true);
    try {
      await sendImageMessage(conversationId, file, token, text.trim() || undefined);
      setText('');
      setShowAttachments(false);
      // Recargar mensajes para mostrar el nuevo
      fetchMessages(1, false);
      logger.info('Image sent successfully:', { conversationId });
    } catch (sendImageError) {
      logger.error('Error sending image:', {
        error: sendImageError instanceof Error ? sendImageError.message : 'Unknown error',
        conversationId
      });
    } finally {
      setSending(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setSending(true);
    try {
      await sendVideoMessage(conversationId, file, token, text.trim() || undefined);
      setText('');
      setShowAttachments(false);
      // Recargar mensajes para mostrar el nuevo
      fetchMessages(1, false);
      logger.info('Video sent successfully:', { conversationId });
    } catch (sendVideoError) {
      logger.error('Error sending video:', {
        error: sendVideoError instanceof Error ? sendVideoError.message : 'Unknown error',
        conversationId
      });
    } finally {
      setSending(false);
    }
  };

  const handleLocationShare = async () => {
    if (!navigator.geolocation || !token) return;

    setSending(true);
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await sendLocationMessage(conversationId, latitude, longitude, token);
          setShowAttachments(false);
          // Recargar mensajes para mostrar el nuevo
          fetchMessages(1, false);
        },
        (uploadError) => {
          logger.error('File upload progress error:', {
            error: uploadError instanceof Error ? uploadError.message : 'Unknown error'
          });
        }
      );
      logger.info('File sent successfully:', { conversationId });
    } catch (fileError) {
      logger.error('Error sending file:', {
        error: fileError instanceof Error ? fileError.message : 'Unknown error',
        conversationId
      });
    } finally {
      setSending(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchMessages(page + 1, true);
    }
  };

  // Funciones para editar y borrar mensajes
  const handleEditMessage = (messageId: string, currentText: string) => {
    setEditingMessageId(messageId);
    setEditingText(currentText);
    setMessageMenuOpen(null);
  };

  const handleSaveEdit = () => {
    if (editingMessageId && editingText.trim()) {
      messageSocketService.editMessage(editingMessageId, editingText.trim());
      setEditingMessageId(null);
      setEditingText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleDeleteMessage = (messageId: string, deleteFor: 'me' | 'everyone') => {
    messageSocketService.deleteMessage(messageId, deleteFor);
    setMessageMenuOpen(null);
  };

  // Manejar indicador de escritura
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    // Enviar evento de typing
    if (e.target.value.trim()) {
      messageSocketService.startTyping(conversationId);

      // Detener typing después de 3 segundos de inactividad
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        messageSocketService.stopTyping(conversationId);
      }, 3000);
    } else {
      messageSocketService.stopTyping(conversationId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.sender._id === user?._id;
    const isTextMessage = message.type === 'text';
    const isImageMessage = message.type === 'image';
    const isVideoMessage = message.type === 'video';
    const isLocationMessage = message.type === 'location';

    return (
      <motion.li
        key={message._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2 sm:mb-3`}
      >
        <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
          {/* Avatar del remitente - Optimizado para móvil */}
          {!isOwnMessage && (
            <div className="flex items-end mb-1">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden mr-2 relative">
                {message.sender.avatar ? (
                  <Image
                    src={message.sender.avatar}
                    alt={`Avatar de ${message.sender.username}`}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs sm:text-sm">
                    {message.sender.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contenido del mensaje - Optimizado para móvil */}
          <div className={`relative group ${isOwnMessage ? 'ml-auto' : 'mr-auto'}`}>
            {/* Menú de opciones del mensaje */}
            {isOwnMessage && isTextMessage && (
              <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setMessageMenuOpen(messageMenuOpen === message._id ? null : message._id)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  title="Opciones"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                {/* Dropdown de opciones */}
                <AnimatePresence>
                  {messageMenuOpen === message._id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[160px]"
                    >
                      <button
                        onClick={() => handleEditMessage(message._id, message.content.text || '')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message._id, 'me')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Borrar para mí</span>
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message._id, 'everyone')}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Borrar para todos</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className={`px-3 sm:px-4 py-2 rounded-2xl shadow-sm ${isOwnMessage
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              : 'bg-white border border-gray-200'
              }`}>
              {isTextMessage && (
                <div>
                  {editingMessageId === message._id ? (
                    // Modo de edición
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full px-2 py-1 text-xs sm:text-sm border border-white/20 rounded bg-white/10 text-white placeholder-white/60"
                        placeholder="Editar mensaje..."
                        autoFocus
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-2 py-1 bg-white text-blue-600 text-xs rounded hover:bg-gray-100"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-2 py-1 bg-white/20 text-white text-xs rounded hover:bg-white/30"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                      {message.content.text}
                      {message.isEdited && (
                        <span className="ml-2 text-xs opacity-70 italic">(editado)</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isImageMessage && (
                <div className="space-y-2">
                  <Image
                    src={message.content.image?.url || '/default-image.png'}
                    alt={message.content.image?.alt || "imagen"}
                    width={300}
                    height={300}
                    className="rounded-lg max-w-full h-auto"
                  />
                  {message.content.image?.alt && (
                    <div className="text-xs opacity-80">{message.content.image.alt}</div>
                  )}
                </div>
              )}

              {isVideoMessage && (
                <div className="space-y-2">
                  <video
                    src={message.content.video?.url}
                    poster={message.content.video?.thumbnail}
                    controls
                    className="rounded-lg max-w-full h-auto"
                  />
                </div>
              )}

              {isLocationMessage && (
                <div className="space-y-2">
                  <div className="bg-gray-100 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                      <LocationIcon />
                      <span className="font-medium text-xs sm:text-sm">
                        {message.content.location?.name || 'Ubicación'}
                      </span>
                    </div>
                    {message.content.location?.address && (
                      <div className="text-xs text-gray-600">
                        {message.content.location.address}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamp - Optimizado para móvil */}
              <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                }`}>
                {new Date(message.createdAt).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.li>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white rounded-none md:rounded-r-2xl shadow-lg">
      {/* Header mejorado del chat */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-gradient-to-r from-white to-gray-50/50 backdrop-blur-sm">
        <button
          onClick={handleHeaderClick}
          className="flex items-center space-x-3 hover:bg-gray-50 rounded-xl p-2 -m-2 transition-colors duration-200 group cursor-pointer"
          title="Ver perfil"
        >
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all relative">
              {(() => {
                const otherParticipant = getOtherParticipant();
                return otherParticipant?.avatar ? (
                  <Image
                    src={otherParticipant.avatar}
                    alt={`Avatar de ${otherParticipant.username}`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-base">
                    {otherParticipant?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-base truncate group-hover:text-blue-600 transition-colors">
              {conversationName || (() => {
                const otherParticipant = getOtherParticipant();
                return otherParticipant?.fullName || otherParticipant?.username || 'Usuario';
              })()}
            </h3>
            <p className="text-xs flex items-center space-x-1">
              <motion.span
                className={`w-2 h-2 rounded-full ${isUserOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                animate={isUserOnline ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className={isUserOnline ? 'text-green-600 font-medium' : 'text-gray-500'}>
                {isUserOnline ? 'En línea' : 'Desconectado'}
              </span>
            </p>
          </div>

          {/* Indicador visual de que es clickeable */}
          <div className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <div className="flex items-center space-x-1 flex-shrink-0">
          <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>

          <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-blue-600">
            <MoreIcon />
          </button>
        </div>
      </div>

      {/* Área de mensajes mejorada */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50/50 to-white/50"
      >
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <MessageSkeleton key={i} align={i % 2 === 0 ? 'left' : 'right'} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6 max-w-sm">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full blur-2xl opacity-20"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">¡Comienza la conversación!</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Envía un mensaje para iniciar el chat</p>
            </div>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="text-center mb-4">
                <button
                  onClick={handleLoadMore}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl font-medium transition-all"
                >
                  Cargar mensajes anteriores
                </button>
              </div>
            )}

            <ul className="space-y-2">
              <AnimatePresence>
                {messages.map(renderMessage)}
              </AnimatePresence>
            </ul>

            {/* Indicador de "escribiendo..." */}
            {typingUsers.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center space-x-2 px-4 py-2"
              >
                <div className="flex space-x-1">
                  <motion.span
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.span
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.span
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
                <span className="text-sm text-gray-500">
                  {Array.from(typingUsers).join(', ')} {typingUsers.size > 1 ? 'están' : 'está'} escribiendo...
                </span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Formulario de envío mejorado */}
      <div className="p-4 border-t border-gray-200/50 bg-gradient-to-t from-white to-gray-50/50 backdrop-blur-sm">
        <form onSubmit={handleSend} className="flex items-end space-x-3">
          {/* Botón de adjuntos mejorado */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowAttachments(!showAttachments)}
              className={`p-3 rounded-xl transition-all duration-200 ${showAttachments
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
            >
              <svg className={`w-5 h-5 transition-transform duration-200 ${showAttachments ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            <AnimatePresence>
              {showAttachments && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-0 mb-3 bg-white rounded-2xl shadow-2xl border border-gray-200/50 p-2 space-y-1 z-10 min-w-[180px]"
                >
                  {/* Input oculto para imágenes */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer group">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <ImageIcon />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Imagen</span>
                  </label>

                  {/* Input oculto para videos */}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer group">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <VideoIcon />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Video</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleLocationShare}
                    disabled={sending}
                    className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl hover:bg-green-50 transition-colors disabled:opacity-50 group"
                  >
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <LocationIcon />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Ubicación</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input de texto mejorado */}
          <div className="flex-1 min-w-0 relative">
            <textarea
              value={text}
              onChange={handleTextChange}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none text-base bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-500"
              rows={1}
              disabled={sending}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>

          {/* Botones de acción mejorados */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              type="button"
              className="p-3 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all"
            >
              <EmojiIcon />
            </button>

            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
            >
              <SendIcon />
            </button>
          </div>
        </form>
      </div>
    </div >
  );
}
