'use client';

import Image from 'next/image';
import { useState, type ReactElement } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { fetchComments, createComment } from '@/services/api/comments';
import { useSessionStore } from '@/store/session';
import { CommentItem } from './comment-item';

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
    <div id="comments" className="border-t border-slate-800 px-6 py-4">
      {currentUser && (
        <form onSubmit={handleSubmit} className="mb-4 flex gap-3">
          <div className="relative size-8 shrink-0 overflow-hidden rounded-full">
            <Image
              src={currentUser.avatarUrl ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${currentUser.handle}`}
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
            className="flex-1 rounded-lg border border-white/10 bg-slate-800/60 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/40"
          />
          <button
            type="submit"
            disabled={createCommentMutation.isPending || commentText.trim().length === 0}
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createCommentMutation.isPending ? 'Publicando...' : 'Publicar'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="py-4 text-center text-sm text-slate-400">Cargando comentarios...</div>
      ) : comments.length === 0 ? (
        <div className="py-4 text-center text-sm text-slate-400">Sé el primero en comentar</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
}

