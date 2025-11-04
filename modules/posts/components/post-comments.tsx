'use client';

import Image from 'next/image';
import { useState, type ReactElement } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { fetchComments, createComment } from '@/services/api/comments';
import { useSessionStore } from '@/store/session';
import { CommentItem } from './comment-item';
import { getAvatarUrl, isLocalImage } from '@/lib/image-utils';
import { fadeUpVariants } from '@/lib/motion-config';
import { useMemo } from 'react';

interface PostCommentsProps {
  readonly postId: string;
}

/**
 * Renderiza la sección de comentarios de un post.
 */
export function PostComments({ postId }: PostCommentsProps): ReactElement {
  const queryClient = useQueryClient();
  const currentUser = useSessionStore((state) => state.user);
  const [commentText, setCommentText] = useState('');

  const commentsQuery = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId),
    staleTime: 1000 * 60 * 2 // 2 minutes
  });

  const createCommentMutation = useMutation({
    mutationFn: (content: string) => createComment(postId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      setCommentText('');
      toast.success('Comentario publicado');
    },
    onError: () => {
      toast.error('No se pudo publicar el comentario');
    }
  });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (trimmed.length === 0) {
      return;
    }
    createCommentMutation.mutate(trimmed);
  };

  const comments = commentsQuery.data?.data ?? [];
  const isLoading = commentsQuery.isLoading;

  // Obtener avatar sincronizado del usuario actual - usar useMemo para re-renderizar cuando cambie
  const avatarUrl = useMemo(() => {
    if (!currentUser) return null;
    return getAvatarUrl(currentUser.avatarUrl ?? null, currentUser.handle);
  }, [currentUser?.avatarUrl, currentUser?.handle]);

  return (
    <div className="px-3 md:px-4 py-3 md:py-4">
      {currentUser && (
        <motion.form
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="mb-6 flex gap-2 md:gap-3 items-start"
        >
          <motion.div 
            className="relative shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="relative size-7 md:size-8 rounded-full ring-1 ring-white/[0.05] overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm group-hover:ring-primary-500/30 transition-all duration-300">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={currentUser.displayName ?? 'Usuario'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 28px, 32px"
                  unoptimized={isLocalImage(avatarUrl)}
                  key={`${currentUser.id}-${currentUser.avatarUrl ?? 'no-avatar'}`}
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <span className="text-xs font-bold text-primary-400">
                    {currentUser.displayName?.charAt(0).toUpperCase() ?? currentUser.handle?.charAt(0).toUpperCase() ?? 'U'}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
          <div className="flex-1 space-y-2">
            <textarea
              value={commentText}
              onChange={(e) => {
                setCommentText(e.target.value);
              }}
              placeholder="Añade un comentario..."
              maxLength={2200}
              rows={commentText.length > 80 ? 3 : 1}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.06] px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-white placeholder:text-white/40 transition-all duration-200 focus:border-primary-500/60 focus:bg-white/[0.10] focus:outline-none focus:ring-2 focus:ring-primary-500/30 backdrop-blur-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (commentText.trim().length > 0 && !createCommentMutation.isPending) {
                    handleSubmit(e);
                  }
                }
              }}
            />
            {commentText.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">
                  {commentText.length}/2200
                </span>
                <motion.button
                  type="submit"
                  disabled={createCommentMutation.isPending || commentText.trim().length === 0}
                  whileHover={{ scale: commentText.trim().length === 0 ? 1 : 1.05, y: -1 }}
                  whileTap={{ scale: commentText.trim().length === 0 ? 1 : 0.95 }}
                  className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
                >
                  {createCommentMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Publicando...
                    </span>
                  ) : (
                    'Publicar'
                  )}
                </motion.button>
              </div>
            )}
          </div>
        </motion.form>
      )}

      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-8 text-center"
        >
          <div className="size-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-slate-400">Cargando comentarios...</p>
        </motion.div>
      ) : comments.length === 0 ? (
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="py-8 text-center"
        >
          <div className="size-16 rounded-full glass-dark mx-auto mb-3 flex items-center justify-center">
            <svg className="size-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-300">Sé el primero en comentar</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

