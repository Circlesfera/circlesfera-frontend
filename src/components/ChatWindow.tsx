import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getMessages, sendTextMessage, sendImageMessage, sendVideoMessage, sendLocationMessage, Message } from '@/services/messageService';
import { useAuth } from '@/features/auth/useAuth';
import MessageSkeleton from './MessageSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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
      const err = error as { response?: { data?: { message?: string } } };
      logger.error('Error sending message:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        conversationId
      });
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
    } catch (error) {

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
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden mr-2">
                {message.sender.avatar ? (
                  <img
                    src={message.sender.avatar}
                    alt="avatar"
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
          <div className={`px-3 sm:px-4 py-2 rounded-2xl shadow-sm ${
            isOwnMessage
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              : 'bg-white border border-gray-200'
          }`}>
            {isTextMessage && (
              <div className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content.text}</div>
            )}

            {isImageMessage && (
              <div className="space-y-2">
                <img
                  src={message.content.image?.url}
                  alt={message.content.image?.alt || "imagen"}
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
            <div className={`text-xs mt-1 ${
              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {new Date(message.createdAt).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </motion.li>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white rounded-none md:rounded-r-2xl shadow-md">
      {/* Header del chat - Optimizado para móvil */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0">
            {participants?.[0]?.avatar ? (
              <img
                src={participants[0].avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs sm:text-sm">
                {participants?.[0]?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
              {conversationName || participants?.map(p => p.username).join(', ')}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {participants?.length || 0} participantes
            </p>
          </div>
        </div>

        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0">
          <MoreIcon />
        </button>
      </div>

      {/* Área de mensajes - Optimizada para móvil */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50"
      >
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <MessageSkeleton key={i} align={i % 2 === 0 ? 'left' : 'right'} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-gray-600 font-medium mb-2 text-sm sm:text-base">No hay mensajes aún</h3>
              <p className="text-gray-400 text-xs sm:text-sm">¡Sé el primero en enviar un mensaje!</p>
            </div>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="text-center mb-4">
                <button
                  onClick={handleLoadMore}
                  className="text-blue-500 text-xs sm:text-sm hover:text-blue-700 transition-colors"
                >
                  Cargar mensajes anteriores
                </button>
              </div>
            )}

            <ul className="space-y-1">
              <AnimatePresence>
                {messages.map(renderMessage)}
              </AnimatePresence>
            </ul>

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Formulario de envío - Optimizado para móvil */}
      <div className="p-3 sm:p-4 border-t border-gray-100 bg-white rounded-none md:rounded-b-2xl">
        <form onSubmit={handleSend} className="flex items-end space-x-2 sm:space-x-3">
          {/* Botones de adjuntos */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowAttachments(!showAttachments)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            <AnimatePresence>
              {showAttachments && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 space-y-2 z-10"
                >
                  {/* Input oculto para imágenes */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="flex items-center space-x-2 w-full px-3 py-2 rounded hover:bg-gray-50 transition-colors cursor-pointer">
                    <ImageIcon />
                    <span className="text-sm">Imagen</span>
                  </label>

                  {/* Input oculto para videos */}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="flex items-center space-x-2 w-full px-3 py-2 rounded hover:bg-gray-50 transition-colors cursor-pointer">
                    <VideoIcon />
                    <span className="text-sm">Video</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleLocationShare}
                    disabled={sending}
                    className="flex items-center space-x-2 w-full px-3 py-2 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <LocationIcon />
                    <span className="text-sm">Ubicación</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input de texto */}
          <div className="flex-1 min-w-0">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm sm:text-base"
              rows={1}
              disabled={sending}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <EmojiIcon />
            </button>

            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2.5 sm:p-3 rounded-full hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <SendIcon />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
