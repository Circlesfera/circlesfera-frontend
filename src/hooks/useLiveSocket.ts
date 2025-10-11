'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getLiveSocketService } from '@/services/liveSocketService';
import type { LiveComment, LiveStreamViewer } from '@/types/live';
import logger from '@/utils/logger';

interface UseLiveSocketOptions {
  streamId: string;
  autoJoin?: boolean;
  onError?: (error: string) => void;
}

interface LiveSocketState {
  isConnected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  comments: LiveComment[];
  viewers: LiveStreamViewer[];
  viewerCount: number;
  isTyping: boolean;
  typingUsers: string[];
}

export const useLiveSocket = (options: UseLiveSocketOptions) => {
  const { streamId, autoJoin = true, onError } = options;
  const socketService = getLiveSocketService();

  const [state, setState] = useState<LiveSocketState>({
    isConnected: false,
    connectionStatus: 'disconnected',
    comments: [],
    viewers: [],
    viewerCount: 0,
    isTyping: false,
    typingUsers: [],
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const commentsRef = useRef<LiveComment[]>([]);
  const viewersRef = useRef<LiveStreamViewer[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Actualizar estado de conexión
  useEffect(() => {
    const updateConnectionStatus = () => {
      const isConnected = socketService.isSocketConnected();
      const connectionStatus = socketService.getConnectionStatus();

      setState(prev => ({
        ...prev,
        isConnected,
        connectionStatus,
      }));
    };

    // Verificar estado inicial
    updateConnectionStatus();

    // Escuchar cambios de conexión (reducir frecuencia)
    const interval = setInterval(updateConnectionStatus, 5000); // Cambiar de 1s a 5s

    return () => {
      clearInterval(interval);
    };
  }, [socketService]);

  // Unirse/Dejar transmisión
  useEffect(() => {
    if (autoJoin && state.isConnected) {
      socketService.joinLiveStream(streamId);

      return () => {
        socketService.leaveLiveStream(streamId);
      };
    }

    return () => { }; // Cleanup function por defecto
  }, [streamId, autoJoin, state.isConnected, socketService]);

  // Event listeners para comentarios
  useEffect(() => {
    const handleNewComment = (comment: LiveComment) => {
      setState(prev => {
        const newComments = [...prev.comments, comment];
        commentsRef.current = newComments;
        return {
          ...prev,
          comments: newComments,
        };
      });
    };

    const handleCommentReaction = (commentId: string, reaction: 'like' | 'love' | 'laugh' | 'wow' | 'angry', user: { _id: string; username: string }) => {
      setState(prev => {
        const updatedComments = prev.comments.map(comment => {
          if (comment._id === commentId) {
            const existingReaction = comment.reactions.find(r => r.user._id === user._id);

            if (existingReaction) {
              // Actualizar reacción existente
              return {
                ...comment,
                reactions: comment.reactions.map(r =>
                  r.user._id === user._id ? { ...r, type: reaction } : r
                ),
              };
            } else {
              // Agregar nueva reacción
              return {
                ...comment,
                reactions: [...comment.reactions, {
                  user: {
                    _id: user._id,
                    username: user.username,
                    avatar: '' // Valor por defecto
                  },
                  type: reaction,
                  timestamp: new Date().toISOString()
                }],
                reactionCount: comment.reactionCount + 1,
              };
            }
          }
          return comment;
        });

        commentsRef.current = updatedComments;
        return {
          ...prev,
          comments: updatedComments,
        };
      });
    };

    const handleCommentReply = (parentId: string, comment: LiveComment) => {
      setState(prev => {
        const updatedComments = prev.comments.map(parentComment => {
          if (parentComment._id === parentId) {
            return {
              ...parentComment,
              replies: [...(parentComment.replies || []), comment],
              repliesCount: (parentComment.repliesCount || 0) + 1,
            };
          }
          return parentComment;
        });

        commentsRef.current = updatedComments;
        return {
          ...prev,
          comments: updatedComments,
        };
      });
    };

    const handleCommentModerate = (commentId: string, action: string) => {
      setState(prev => {
        const updatedComments = prev.comments.filter(comment => {
          if (comment._id === commentId) {
            if (action === 'delete') return false;
            if (action === 'hide') {
              return {
                ...comment,
                isHidden: true,
              };
            }
          }
          return true;
        });

        commentsRef.current = updatedComments;
        return {
          ...prev,
          comments: updatedComments,
        };
      });
    };

    // Registrar listeners
    socketService.on('comment:new', handleNewComment);
    socketService.on('comment:reaction', handleCommentReaction);
    socketService.on('comment:reply', handleCommentReply);
    socketService.on('comment:moderate', handleCommentModerate);

    return () => {
      socketService.off('comment:new', handleNewComment);
      socketService.off('comment:reaction', handleCommentReaction);
      socketService.off('comment:reply', handleCommentReply);
      socketService.off('comment:moderate', handleCommentModerate);
    };
  }, [socketService]);

  // Event listeners para viewers
  useEffect(() => {
    const handleViewerJoin = (viewer: LiveStreamViewer) => {
      setState(prev => {
        const updatedViewers = [...prev.viewers, viewer];
        viewersRef.current = updatedViewers;
        return {
          ...prev,
          viewers: updatedViewers,
          viewerCount: prev.viewerCount + 1,
        };
      });
    };

    const handleViewerLeave = (viewerId: string) => {
      setState(prev => {
        const updatedViewers = prev.viewers.filter(v => v._id !== viewerId);
        viewersRef.current = updatedViewers;
        return {
          ...prev,
          viewers: updatedViewers,
          viewerCount: Math.max(0, prev.viewerCount - 1),
        };
      });
    };

    const handleViewerCount = (count: number) => {
      setState(prev => ({
        ...prev,
        viewerCount: count,
      }));
    };

    // Registrar listeners
    socketService.on('viewer:join', handleViewerJoin);
    socketService.on('viewer:leave', handleViewerLeave);
    socketService.on('viewer:count', handleViewerCount);

    return () => {
      socketService.off('viewer:join', handleViewerJoin);
      socketService.off('viewer:leave', handleViewerLeave);
      socketService.off('viewer:count', handleViewerCount);
    };
  }, [socketService]);

  // Event listeners para errores
  useEffect(() => {
    const handleError = (error: string) => {
      setError(error);
      onError?.(error);
    };

    socketService.on('error', handleError);

    return () => {
      socketService.off('error', handleError);
    };
  }, [socketService, onError]);

  // Métodos para enviar comentarios
  const sendComment = useCallback(async (content: string, parentId?: string) => {
    if (!state.isConnected || !content.trim()) return;

    setLoading(true);
    try {
      socketService.sendComment(streamId, content.trim(), parentId);
    } catch (error) {
      // ✅ IMPLEMENTADO: Logging de error al enviar comentario de live
      logger.error('Error sending live comment:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        streamId,
        contentLength: content.length,
        hasParent: !!parentId
      });
      setError('Error al enviar comentario');
    } finally {
      setLoading(false);
    }
  }, [streamId, state.isConnected, socketService]);

  // Métodos para reacciones
  const reactToComment = useCallback((commentId: string, reaction: string) => {
    if (!state.isConnected) return;
    socketService.reactToComment(commentId, reaction);
  }, [state.isConnected, socketService]);

  const moderateComment = useCallback((commentId: string, action: 'hide' | 'delete' | 'pin' | 'unpin') => {
    if (!state.isConnected) return;
    socketService.moderateComment(commentId, action);
  }, [state.isConnected, socketService]);

  // Métodos para reacciones del stream
  const likeStream = useCallback(() => {
    if (!state.isConnected) return;
    socketService.likeStream(streamId);
  }, [streamId, state.isConnected, socketService]);

  const shareStream = useCallback(() => {
    if (!state.isConnected) return;
    socketService.shareStream(streamId);
  }, [streamId, state.isConnected, socketService]);

  // Métodos para typing indicator
  // stopTyping PRIMERO (usado por startTyping)
  const stopTyping = useCallback(() => {
    if (!state.isConnected) return;

    setState(prev => ({ ...prev, isTyping: false }));
    socketService.stopTyping(streamId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [streamId, state.isConnected, socketService]);

  const startTyping = useCallback(() => {
    if (!state.isConnected) return;

    setState(prev => ({ ...prev, isTyping: true }));

    // Enviar evento de typing
    socketService.startTyping(streamId);

    // Auto-stop typing después de 3 segundos
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [streamId, state.isConnected, socketService, stopTyping]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Estado
    ...state,
    error,
    loading,

    // Métodos
    sendComment,
    reactToComment,
    moderateComment,
    likeStream,
    shareStream,
    startTyping,
    stopTyping,

    // Utilidades
    clearError: () => setError(null),
    getComments: () => commentsRef.current,
    getViewers: () => viewersRef.current,
  };
};
