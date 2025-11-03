'use client';

import Image from 'next/image';
import { useState, type ReactElement } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { fetchComments, createComment } from '@/services/api/comments';
import { useSessionStore } from '@/store/session';
import { CommentItem } from './comment-item';
import { getAvatarUrl } from '@/lib/image-utils';
import { fadeUpVariants } from '@/lib/motion-config';

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

  return (
    <div id="comments" className="px-6 py-5">
      {currentUser && (
        <motion.form
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="mb-6 flex gap-3"
        >
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white/10">
            <Image
              src={getAvatarUrl(currentUser.avatarUrl, currentUser.handle)}
              alt={currentUser.displayName}
              fill
              className="object-cover"
            />
          </div>
          <input
            type="text"
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
            }}
            placeholder="Añade un comentario..."
            className="flex-1 rounded-xl input-base text-sm"
          />
          <motion.button
            type="submit"
            disabled={createCommentMutation.isPending || commentText.trim().length === 0}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
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

