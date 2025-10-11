"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { deleteStory, Story } from '@/services/storyService';
import logger from '@/utils/logger';
import { useToast } from '@/components/Toast';

// Iconos SVG modernos estilo Instagram
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const MessageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const MoreIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ReportIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

interface StoryViewerProps {
  story: Story;
  userId: string;
  username: string;
  onClose: () => void;
  onStoryDeleted?: (storyId: string) => void;
}

export default function StoryViewer({ story: initialStory, userId, username, onClose, onStoryDeleted }: StoryViewerProps) {
  // Solo loggear en desarrollo (comentado temporalmente para evitar spam)
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('🎬 StoryViewer renderizado con onClose:', typeof onClose, 'onStoryDeleted:', typeof onStoryDeleted);
  // }
  const { user } = useAuth();
  const toast = useToast();
  const [story, setStory] = useState<Story | null>(initialStory);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showReactionFeedback, setShowReactionFeedback] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const shouldCloseRef = useRef(false);
  const storyDuration = 5000; // 5 segundos por story

  // Iniciar progreso automático (definir ANTES del useEffect que lo usa)
  const startProgress = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      if (!isPaused) {
        setProgress(prev => {
          if (prev >= 100) {
            // Story completada, marcar para cerrar
            shouldCloseRef.current = true;
            return 100;
          }
          return prev + (100 / (storyDuration / 100));
        });
      }
    }, 100);
  }, [isPaused, storyDuration]); // Agregado storyDuration como dependencia

  // Inicializar la story y el progreso
  useEffect(() => {
    if (story) {
      setLoading(false);
      setError(null);
      // Iniciar progreso automático
      startProgress();
    } else {
      setError('No se pudo cargar la historia');
      setLoading(false);
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [story, startProgress]);

  // Verificar si debe cerrarse la story
  useEffect(() => {
    if (shouldCloseRef.current) {
      shouldCloseRef.current = false;
      onClose();
    }
  }, [progress, onClose]); // Incluir onClose en las dependencias

  // Loggear información de la story en desarrollo
  useEffect(() => {
    if (story) {
      logger.debug('StoryViewer: Showing story', {
        storyId: story._id,
        username,
        userId
      });
    }
  }, [story, userId, username]);

  // Pausar/reanudar story
  const togglePause = () => {

    setIsPaused(!isPaused);

    if (videoRef.current) {
      if (isPaused) {

        videoRef.current.play();
      } else {

        videoRef.current.pause();
      }
    }

  };

  // Manejar reacción
  const handleReaction = async (reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry') => {

    if (!story || !user) {

      return;
    }

    try {
      // Aquí iría la llamada real a la API

      // Actualizar estado local
      setStory(prev => {
        if (!prev) return prev;

        const existingReaction = prev.reactions.find(r => r.user === user._id);
        if (existingReaction) {
          existingReaction.type = reactionType;

        } else {
          prev.reactions.push({
            user: user._id,
            type: reactionType,
            createdAt: new Date().toISOString()
          });

        }
        return { ...prev };
      });

      // Mostrar feedback visual
      setShowReactionFeedback(true);
      setTimeout(() => setShowReactionFeedback(false), 1000);
    } catch (error) {

    }
  };

  // Manejar respuesta
  const handleReply = async () => {
    if (!story || !user || !replyText.trim()) return;

    try {
      setSendingReply(true);

      // Aquí iría la llamada real a la API

      // Actualizar estado local
      setStory(prev => {
        if (!prev) return prev;
        prev.replies.push({
          user: user._id,
          content: replyText,
          createdAt: new Date().toISOString()
        });
        return { ...prev };
      });

      setReplyText('');
      setShowReplyInput(false);
    } catch (error) {

    } finally {
      setSendingReply(false);
    }
  };

  // Manejar eliminación de story
  const handleDeleteStory = async () => {

    if (!story || !user || story.user._id !== user._id) {

      return;
    }

    try {
      setIsDeleting(true);

      // Llamada real a la API para eliminar la story
      const token = localStorage.getItem('token');
      logger.debug('Deleting story', {
        storyId: story._id,
        hasToken: !!token
      });

      const result = await deleteStory(story._id);

      if (!result.success) {
        throw new Error(result.message || 'Error al eliminar la story');
      }

      // Cerrar menú primero
      setShowMoreMenu(false);

      // Limpiar intervalos
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }

      // Notificar que la story fue eliminada
      if (onStoryDeleted && story) {

        onStoryDeleted(story._id);
      }

      // Cerrar inmediatamente después de la eliminación exitosa

      try {
        onClose();

      } catch (err) {

      }

    } catch (err) {

      toast.error('Error al eliminar la story. Inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Cerrar story
  const handleClose = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    onClose();
  };

  // Manejar teclas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          if (showMoreMenu) {
            setShowMoreMenu(false);
          } else {
            handleClose();
          }
          break;
        case ' ':
          e.preventDefault();
          togglePause();
          break;
        case 'ArrowLeft':
          // Story anterior
          break;
        case 'ArrowRight':
          // Story siguiente
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, showMoreMenu]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMoreMenu) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }

    return undefined;
  }, [showMoreMenu]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Cargando historia...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="mb-4">{error || 'No se pudo cargar la historia'}</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 story-viewer">
      {/* Barra de progreso superior - Estilo Instagram */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 z-10">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header con información del usuario - Estilo Instagram */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30">
            <img
              src={story.user.avatar || '/default-avatar.png'}
              alt={story.user.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-white">
            <p className="font-semibold text-sm">{story.user.username}</p>
            <p className="text-xs text-gray-300 opacity-80">hace 2h</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Solo el botón de cerrar en el header */}
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 transition-colors flex items-center justify-center"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Contenido principal de la story - Estilo Instagram */}
      <div
        className="w-full h-full flex items-center justify-center"
        onClick={togglePause}
        style={{ cursor: 'pointer' }}
      >
        {story.type === 'image' && story.content.image && (
          <img
            src={story.content.image.url}
            alt={story.content.image.alt}
            className="max-w-full max-h-full object-cover"
            draggable={false}
          />
        )}

        {story.type === 'video' && story.content.video && (
          <video
            ref={videoRef}
            src={story.content.video.url}
            className="max-w-full max-h-full object-cover"
            autoPlay
            muted
            playsInline
            onEnded={() => onClose()}
          />
        )}

        {story.type === 'text' && story.content.text && (
          <div
            className="max-w-md mx-8 text-center p-8 rounded-2xl"
            style={{
              backgroundColor: story.content.text.backgroundColor,
              color: story.content.text.textColor,
              fontSize: `${story.content.text.fontSize}px`,
              fontFamily: story.content.text.fontFamily
            }}
          >
            <p className="leading-relaxed">{story.content.text.content}</p>
          </div>
        )}

        {/* Caption - Estilo Instagram */}
        {story.caption && (
          <div className="absolute bottom-32 left-4 right-4 text-center">
            <p className="text-white text-lg font-medium bg-black/20 backdrop-blur-sm px-6 py-3 rounded-full inline-block">
              {story.caption}
            </p>
          </div>
        )}

        {/* Feedback de reacción */}
        {showReactionFeedback && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="text-6xl animate-bounce">
              ❤️
            </div>
          </div>
        )}
      </div>

      {/* Botones de interacción - Estilo Instagram */}
      <div className="absolute bottom-8 left-4 right-4 flex items-center justify-center space-x-6">
        <button
          onClick={() => {

            handleReaction('like');
          }}
          className={`w-12 h-12 rounded-full backdrop-blur-sm transition-all duration-200 flex items-center justify-center group ${story?.reactions.some(r => r.user === user?._id)
            ? 'bg-red-500/80 hover:bg-red-600/90'
            : 'bg-black/20 hover:bg-black/40'
            }`}
        >
          <HeartIcon />
        </button>

        <button
          onClick={() => {

            setShowReplyInput(!showReplyInput);
          }}
          className={`w-12 h-12 rounded-full backdrop-blur-sm transition-all duration-200 flex items-center justify-center group ${showReplyInput
            ? 'bg-blue-500/80 hover:bg-blue-600/90 ring-2 ring-blue-300'
            : 'bg-black/20 hover:bg-black/40'
            }`}
          title="Responder a la historia"
        >
          <MessageIcon />
        </button>

        <button
          onClick={() => {

            togglePause();
          }}
          className={`w-12 h-12 rounded-full backdrop-blur-sm transition-all duration-200 flex items-center justify-center group ${isPaused
            ? 'bg-green-500/80 hover:bg-green-600/90'
            : 'bg-black/20 hover:bg-black/40'
            }`}
        >
          {isPaused ? <PlayIcon /> : <PauseIcon />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-all duration-200 flex items-center justify-center group"
            title="Más opciones"
          >
            <MoreIcon />
          </button>

          {/* Menú desplegable */}
          {showMoreMenu && (
            <div className="absolute bottom-16 right-0 w-48 bg-black/90 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 z-50">
              {/* Solo mostrar opción de eliminar si es el propietario de la story */}
              {story?.user._id === user?._id && (
                <button
                  onClick={() => {

                    handleDeleteStory();
                  }}
                  disabled={isDeleting}
                  className={`w-full px-4 py-3 text-left transition-colors rounded-lg flex items-center space-x-3 ${isDeleting
                    ? 'text-gray-400 bg-gray-800/50 cursor-not-allowed'
                    : 'text-red-400 hover:bg-red-500/20'
                    }`}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      <span>Eliminando...</span>
                    </>
                  ) : (
                    <>
                      <TrashIcon />
                      <span>Eliminar story</span>
                    </>
                  )}
                </button>
              )}

              {/* Opción para reportar (siempre visible) */}
              <button
                onClick={() => {

                  // Aquí iría la lógica de reporte
                  toast.info('Función de reporte en desarrollo');
                  setShowMoreMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-gray-300 hover:bg-white/10 transition-colors rounded-lg flex items-center space-x-3"
              >
                <ReportIcon />
                <span>Reportar</span>
              </button>

              {/* Opción para cerrar menú */}
              <button
                onClick={() => setShowMoreMenu(false)}
                className="w-full px-4 py-3 text-left text-gray-300 hover:bg-white/10 transition-colors rounded-lg flex items-center space-x-3"
              >
                <CloseIcon />
                <span>Cerrar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Input de respuesta - Estilo Instagram */}
      {showReplyInput && (
        <div className="absolute bottom-8 left-4 right-4 flex items-center space-x-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Responde a la historia..."
            className="flex-1 bg-white/95 backdrop-blur-sm rounded-full px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={200}
          />
          <button
            onClick={handleReply}
            disabled={sendingReply || !replyText.trim()}
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 rounded-full flex items-center justify-center transition-colors"
          >
            {sendingReply ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <SendIcon />
            )}
          </button>
        </div>
      )}

      {/* Controles de navegación - Estilo Instagram */}
      <div className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize" />
      <div className="absolute inset-y-0 right-0 w-1/3 cursor-e-resize" />
    </div>
  );
}
