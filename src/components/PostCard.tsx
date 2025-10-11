"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Post, updatePost, deletePost, togglePinPost } from '@/services/postService';
import LikeButton from './LikeButton';
import CommentsSection from './CommentsSection';
import { useAuth } from '@/features/auth/useAuth';
import { motion } from 'framer-motion';
import { fadeInUp, useInViewAnimation, useCardAnimation } from '@/hooks/useAnimations';
import LazyImage from './LazyImage';
import ReportModal from './ReportModal';

// Iconos SVG modernos

const CommentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <svg className="w-5 h-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={filled ? 0 : 2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const MoreIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
  onComment?: (postId: string, postAuthor: string, postImage?: string) => void;
  onShare?: (postId: string, postUrl?: string, postCaption?: string) => void;
  onUserClick?: (userId: string) => void;
}

export default function PostCard({
  post,
  onPostDeleted,
  onComment,
  onShare,
  onUserClick
}: PostCardProps) {
  const { user } = useAuth();
  const likedByUser = post.likes.includes(user?._id || '');
  const [isSaved, setIsSaved] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption);
  const [isPinned, setIsPinned] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Animaciones
  const { ref, isInView } = useInViewAnimation();
  const cardAnimation = useCardAnimation();

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'ahora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    return postDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    };

    if (showMore) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMore]);

  // Función para reportar post
  const handleReportPost = async (reason: string, description?: string) => {
    try {
      // TODO: Implementar endpoint de reporte en el backend

      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowReportModal(false);
    } catch (error) {

      throw error;
    }
  };

  // Función para editar post
  const handleEditPost = async () => {
    try {
      setError(null);
      const response = await updatePost(post._id, { caption: editCaption });
      if (response.success) {
        // Actualizar el post localmente
        post.caption = editCaption;
        setIsEditing(false);
        setShowMore(false);
      }
    } catch (err) {
      setError('Error al editar el post');

    }
  };

  // Función para fijar/desfijar post
  const handleTogglePin = async () => {
    try {
      setError(null);
      const response = await togglePinPost(post._id);
      if (response.success) {
        setIsPinned(response.isPinned);
        setShowMore(false);
      }
    } catch (err) {
      setError('Error al fijar el post');

    }
  };

  // Función para eliminar post
  const handleDeletePost = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      // Debug: verificar token
      const token = localStorage.getItem('token');

      console.log('Token:', token ? token.substring(0, 20) + '...' : 'No hay token');

      const response = await deletePost(post._id);
      if (response.success) {
        // El post se eliminará del feed automáticamente
        setShowDeleteConfirm(false);
        setShowMore(false);

        // Notificar al componente padre que el post fue eliminado
        if (onPostDeleted) {
          onPostDeleted(post._id);
        }
      }
    } catch (err) {
      setError('Error al eliminar el post');

    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    switch (post.type) {
      case 'image':
        if (post.content.images && post.content.images.length > 1) {
          return (
            <div className="relative overflow-hidden">
              <div className="relative">
                <LazyImage
                  src={post.content.images[currentImageIndex]?.url || ''}
                  alt={post.content.images[currentImageIndex]?.alt || "post"}
                  className="w-full h-auto object-cover"
                />
                {/* Indicadores de imagen */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {post.content.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
                {/* Navegación de imágenes */}
                {currentImageIndex > 0 && (
                  <button
                    onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                {currentImageIndex < post.content.images.length - 1 && (
                  <button
                    onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        } else {
          return (
            <div className="relative overflow-hidden">
              <LazyImage
                src={post.content.images?.[0]?.url || ''}
                alt={post.content.images?.[0]?.alt || "post"}
                className="w-full h-auto object-cover"
              />
            </div>
          );
        }

      case 'video':
        return (
          <div className="relative overflow-hidden">
            <video
              ref={videoRef}
              src={post.content.video?.url}
              poster={post.content.video?.thumbnail}
              className="w-full h-auto object-cover"
              preload="metadata"
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
            />
            {!isVideoPlaying && (
              <button
                onClick={handleVideoPlay}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all duration-200"
              >
                <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                  <PlayIcon />
                </div>
              </button>
            )}
            {post.content.video?.duration && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {formatDuration(post.content.video.duration)}
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="text-gray-900 text-base leading-relaxed whitespace-pre-wrap">
              {post.content.text}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={fadeInUp.initial}
      animate={isInView ? fadeInUp.animate : fadeInUp.initial}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={cardAnimation.whileHover}
      className="animate-fade-in"
    >
      {/* Header del usuario */}
      <div className="flex items-center justify-between px-6 py-1">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onUserClick?.(post.user._id)}
            className="group"
          >
            {post.user.avatar ? (
              <LazyImage
                src={post.user.avatar || ''}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all duration-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm shadow-lg">
                {post.user.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </button>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onUserClick?.(post.user._id)}
                className="font-semibold text-gray-900 text-sm hover:text-blue-600 transition-colors"
              >
                {post.user.username}
              </button>
              {isPinned && (
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 15l7-7 7 7" />
                </svg>
              )}
            </div>
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <span>{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={() => setShowMore(!showMore)}
            className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
          >
            <MoreIcon />
          </button>

                    {/* Menú desplegable */}
          {showMore && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="py-1">
                {/* Solo mostrar opciones si el usuario es el propietario del post */}
                {user?._id === post.user._id && (
                  <>
                    {/* Editar post */}
                    <button
                      onClick={() => {
                        setShowMore(false);
                        setIsEditing(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Editar post</span>
                    </button>

                    {/* Fijar post */}
                    <button
                      onClick={() => {
                        setShowMore(false);
                        handleTogglePin();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      <span>{isPinned ? 'Desfijar post' : 'Fijar post'}</span>
                    </button>

                    {/* Separador */}
                    <div className="border-t border-gray-100 my-1"></div>

                    {/* Eliminar post */}
                    <button
                      onClick={() => {
                        setShowMore(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Eliminar post</span>
                    </button>
                  </>
                )}

                {/* Opciones para todos los usuarios */}
                <button
                  onClick={() => {
                    setShowMore(false);
                    setShowReportModal(true);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>Reportar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido según el tipo */}
      {renderContent()}

      {/* Acciones */}
      <div className="px-6 py-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-4">
            <LikeButton postId={post._id} initialLiked={likedByUser} initialCount={post.likes.length} />

            <button
              onClick={() => onComment?.(post._id, post.user.username, post.content?.images?.[0]?.url)}
              className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 group hover:scale-105"
            >
              <CommentIcon />
            </button>

            <button
              onClick={() => onShare?.(post._id, `${window.location.origin}/${post.user.username}/post/${post._id}`, post.caption)}
              className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 group hover:scale-105"
            >
              <ShareIcon />
            </button>
          </div>

          <button
            onClick={() => setIsSaved(!isSaved)}
            className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 group hover:scale-105"
          >
            <BookmarkIcon filled={isSaved} />
          </button>
        </div>

        {/* Likes y Caption combinados */}
        {(post.likes.length > 0 || post.caption) && (
          <div className="mb-1">
            {post.likes.length > 0 && (
              <span className="font-semibold text-gray-900 text-sm mr-3">
                {post.likes.length} me gusta
              </span>
            )}
            {post.caption && !isEditing && (
              <span className="text-gray-900 text-sm">
                {post.caption.length > 80 ? (
                  <>
                    {post.caption.substring(0, 80)}...
                    <button
                      onClick={() => setShowFullCaption(!showFullCaption)}
                      className="text-gray-500 hover:text-gray-700 ml-1 font-medium"
                    >
                      {showFullCaption ? 'menos' : 'más'}
                    </button>
                  </>
                ) : (
                  post.caption
                )}
              </span>
            )}

            {/* Formulario de edición */}
            {isEditing && (
              <div className="mt-2">
                <textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
                  rows={3}
                  placeholder="Escribe tu caption..."
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={handleEditPost}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditCaption(post.caption);
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tags solo si existen */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center space-x-1 mb-1">
            <TagIcon />
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-blue-600 text-xs font-medium hover:text-blue-700 cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-gray-500 text-xs">+{post.tags.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Comentarios */}
        <div className="mt-0.5">
          {post._id && (
            <CommentsSection postId={post._id} />
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ¿Eliminar post?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. El post se eliminará permanentemente.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar errores */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        postId={post._id}
        onReport={handleReportPost}
      />
    </motion.div>
  );
}
