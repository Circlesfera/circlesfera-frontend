"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
      if (data && data.data) {
        if (append) {
          setComments(prev => [...prev, ...data.data]);
        } else {
          setComments(data.data);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100">Comentarios</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-700 dark:bg-gray-700 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Post Info */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              {postImage && (
                <Image
                  src={postImage}
                  alt="Publicación"
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100 dark:text-gray-100">@{postAuthor}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Publicación</p>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {loading && comments.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 dark:text-gray-500">
                <p>No hay comentarios aún.</p>
                <p className="text-sm">¡Sé el primero en comentar!</p>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-3">
                    <Image
                      src={comment.user.avatar || '/default-avatar.png'}
                      alt={`Avatar de ${comment.user.username}`}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-100 dark:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 rounded-2xl px-3 py-2">
                        <div className="flex items-baseline space-x-2">
                          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 dark:text-gray-100">
                            {comment.user.username}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100 dark:text-gray-100 mt-1 break-words">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
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
                    >
                      {loading ? 'Cargando...' : 'Cargar más comentarios'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comment Form */}
          {user && (
            <div className="border-t border-gray-200 dark:border-gray-700 dark:border-gray-700 p-4">
              <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                <Image
                  src={user.avatar || '/default-avatar.png'}
                  alt={`Avatar de ${user.username}`}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Añade un comentario..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={sending}
                    maxLength={500}
                  />
                  {text.length > 450 && (
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">
                      {text.length}/500
                    </span>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={!text.trim() || sending}
                  size="sm"
                  variant={text.trim() ? "primary" : "ghost"}
                >
                  {sending ? '...' : 'Publicar'}
                </Button>
              </form>

              {error && (
                <div className="text-red-500 text-xs mt-2 text-center">
                  {error}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
