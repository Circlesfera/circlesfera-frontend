"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Send, Loader2 } from 'lucide-react';
import { getComments, createComment, Comment } from '@/services/postService';
import { useAuth } from '@/features/auth/useAuth';
import { Button } from '@/design-system';
import logger from '@/utils/logger';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postAuthor: string;
  postImage?: string | undefined;
}

export default function CommentsModal({
  isOpen,
  onClose,
  postId,
  postAuthor,
  postImage
}: CommentsModalProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    setError('');

    try {
      const data = await getComments(postId, pageNum);
      if (data && data.success) {
        const commentsData = data.posts || [];
        if (append) {
          setComments(prev => [...prev, ...commentsData]);
        } else {
          setComments(commentsData);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      } else {
        setError('Error al cargar comentarios');
        setComments([]);
      }
    } catch (err) {
      logger.error('Error loading comments in CommentsModal:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        postId,
        page: pageNum
      });
      setError('Error al cargar comentarios');
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const loadMoreComments = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchComments(nextPage, true);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      setPage(1);
    }
  }, [isOpen, postId, fetchComments]);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!text.trim() || !user) return;

    setSending(true);
    try {
      await createComment(postId, text);
      setText('');
      fetchComments(); // Recargar comentarios
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error?.response?.data?.message || 'Error al comentar';
      setError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'ahora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg mx-auto max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Comentarios</h2>
              {comments.length > 0 && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm px-2 py-1 rounded-full">
                  {comments.length}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Post Info */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center space-x-3">
              {postImage && (
                <div className="relative">
                  <Image
                    src={postImage}
                    alt="Publicación"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-gray-100">@{postAuthor}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Publicación</p>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading && comments.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-3">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <p className="text-gray-500 dark:text-gray-400">Cargando comentarios...</p>
                </div>
              </div>
            ) : error && comments.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center space-y-3">
                  <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  <p className="text-red-500 text-sm">{error}</p>
                  <Button
                    onClick={() => fetchComments()}
                    variant="ghost"
                    size="sm"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center space-y-3">
                  <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No hay comentarios aún</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">¡Sé el primero en comentar!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <motion.div
                    key={comment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex space-x-3 group"
                  >
                    <div className="flex-shrink-0">
                      <Image
                        src={comment.user.avatar || '/default-avatar.png'}
                        alt={`Avatar de ${comment.user.username}`}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                        <div className="flex items-baseline space-x-2 mb-1">
                          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                            {comment.user.username}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100 break-words leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={commentsEndRef} />

                {/* Load More */}
                {hasMore && (
                  <div className="text-center py-4">
                    <Button
                      onClick={loadMoreComments}
                      disabled={loading}
                      variant="ghost"
                      size="sm"
                      className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Cargando...</span>
                        </div>
                      ) : (
                        'Cargar más comentarios'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comment Form */}
          {user && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
              <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Image
                    src={user.avatar || '/default-avatar.png'}
                    alt={`Avatar de ${user.username}`}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Añade un comentario..."
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={sending}
                    maxLength={500}
                  />
                  {text.length > 450 && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500">
                      {text.length}/500
                    </span>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={!text.trim() || sending}
                  size="sm"
                  variant={text.trim() ? "primary" : "ghost"}
                  className="flex-shrink-0 h-10 w-10 rounded-full p-0"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs mt-3 text-center bg-red-50 dark:bg-red-900/20 py-2 px-3 rounded-lg"
                >
                  {error}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
