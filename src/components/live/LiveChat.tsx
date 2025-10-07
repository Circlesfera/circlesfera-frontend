'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Eye, Wifi, WifiOff } from 'lucide-react';
import { LiveComment } from './LiveComment';
import { useLiveSocket } from '@/hooks/useLiveSocket';

interface LiveChatProps {
  streamId: string;
  allowComments: boolean;
  currentUser?: {
    id: string;
    username: string;
  } | undefined;
  canModerate?: boolean;
}

export function LiveChat({
  streamId,
  allowComments,
  currentUser,
  canModerate = false,
}: LiveChatProps) {
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [replyTo, setReplyTo] = useState<{
    commentId: string;
    username: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    comments,
    loading,
    error,
    isConnected,
    connectionStatus,
    viewerCount,
    sendComment,
    reactToComment,
    moderateComment,
    startTyping,
    stopTyping,
    clearError,
  } = useLiveSocket({
    streamId,
    autoJoin: true,
    onError: (error) => {
      console.error('Live Chat Error:', error);
    },
  });


  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // Focus input when reply is set
  useEffect(() => {
    if (replyTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyTo]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !currentUser || !allowComments || !isConnected) return;

    try {
      await sendComment(message.trim(), replyTo?.commentId);
      setMessage('');
      setReplyTo(null);
      stopTyping();
    } catch (error) {
      console.error('Error sending comment:', error);
    }
  };

  const handleReact = async (commentId: string, reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'angry') => {
    if (!isConnected) return;
    reactToComment(commentId, reactionType);
  };

  const handleReply = (commentId: string, username: string) => {
    setReplyTo({ commentId, username });
  };

  const handleModerate = async (commentId: string, action: 'hide' | 'delete' | 'pin' | 'unpin') => {
    if (!isConnected || !canModerate) return;
    moderateComment(commentId, action);
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    // Manejar typing indicator
    if (e.target.value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const formatViewerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-red-600 text-white rounded-full p-3 shadow-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">
            {comments.length > 0 && (
              <span className="bg-white text-red-600 rounded-full px-2 py-1 text-xs ml-1">
                {comments.length}
              </span>
            )}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col h-96">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-900">EN VIVO</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <Eye className="w-4 h-4" />
            <span className="text-sm">{formatViewerCount(viewerCount)}</span>
          </div>
          <div className="flex items-center space-x-1">
            {connectionStatus === 'connected' && (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Conectado</span>
              </>
            )}
            {connectionStatus === 'connecting' && (
              <>
                <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-yellow-600 font-medium">Conectando...</span>
              </>
            )}
            {connectionStatus === 'disconnected' && (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-xs text-red-600 font-medium">Desconectado</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Comments */}
      {/* Connection Error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 mx-3 mt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <WifiOff className="w-4 h-4 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading && comments.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-sm">Cargando comentarios...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500 text-sm">{error}</div>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-sm text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No hay comentarios aún</p>
              <p className="text-xs">¡Sé el primero en comentar!</p>
            </div>
          </div>
        ) : (
          <>
            {comments.map((comment: LiveComment) => (
              <LiveComment
                key={comment._id}
                comment={comment}
                onReact={handleReact}
                onReply={handleReply}
                onModerate={handleModerate}
                canModerate={canModerate}
                currentUser={currentUser}
              />
            ))}

          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 py-2 bg-blue-50 border-b border-blue-200 flex items-center justify-between"
          >
            <span className="text-sm text-blue-700">
              Respondiendo a <span className="font-medium">{replyTo.username}</span>
            </span>
            <button
              onClick={cancelReply}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              Cancelar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-3 border-t border-gray-200">
        {!allowComments ? (
          <div className="text-center text-gray-500 text-sm py-2">
            Los comentarios están deshabilitados
          </div>
        ) : !currentUser ? (
          <div className="text-center text-gray-500 text-sm py-2">
            <button className="text-blue-500 hover:text-blue-700">
              Inicia sesión para comentar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={handleMessageChange}
              placeholder={replyTo ? `Responder a ${replyTo.username}...` : 'Escribe un comentario...'}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="bg-red-600 text-white rounded-full p-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
