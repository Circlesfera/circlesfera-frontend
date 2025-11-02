'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactElement } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { fetchReplies, createComment, type Comment } from '@/services/api/comments';
import { formatRelativeTime } from '@/modules/feed/utils/formatters';
import { useSessionStore } from '@/store/session';

interface CommentItemProps {
  readonly comment: Comment;
  readonly postId: string;
  readonly depth?: number;
}

const MAX_DEPTH = 3; // Máximo de niveles de replies

/**
 * Renderiza un comentario individual con soporte para replies anidados.
 */
export function CommentItem({ comment, postId, depth = 0 }: CommentItemProps): ReactElement | null {
  const queryClient = useQueryClient();
  const currentUser = useSessionStore((state) => state.user);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');

  const repliesQuery = useQuery({
    queryKey: ['comment-replies', comment.id],
    queryFn: () => fetchReplies(comment.id),
    enabled: showReplies,
    staleTime: 1000 * 60 * 2
  });

  const createReplyMutation = useMutation({
    mutationFn: (content: string) => createComment(postId, { content, parentId: comment.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment-replies', comment.id] });
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      setReplyText('');
      setShowReplyForm(false);
      setShowReplies(true); // Mostrar replies después de crear uno
      toast.success('Respuesta publicada');
    },
    onError: () => {
      toast.error('No se pudo publicar la respuesta');
    }
  });

  const handleSubmitReply = (e: React.FormEvent): void => {
    e.preventDefault();
    const trimmed = replyText.trim();
    if (trimmed.length === 0) {
      return;
    }
    createReplyMutation.mutate(trimmed);
  };

  const replies = repliesQuery.data?.data ?? [];
  const hasReplies = replies.length > 0;
  const canReply = depth < MAX_DEPTH && currentUser !== null;

  if (!comment.author) {
    return null;
  }

  return (
    <div className={depth > 0 ? 'ml-8 border-l-2 border-slate-700/50 pl-4' : ''}>
      <div className="flex gap-3">
        <Link href={`/${comment.author.handle}`} className="relative size-8 shrink-0 overflow-hidden rounded-full">
          <Image
            src={comment.author.avatarUrl ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${comment.author.handle}`}
            alt={comment.author.displayName}
            fill
            className="object-cover"
          />
        </Link>
        <div className="flex-1">
          <div className="rounded-lg bg-slate-800/60 px-3 py-2">
            <Link
              href={`/${comment.author.handle}`}
              className="font-semibold text-white hover:underline"
            >
              {comment.author.displayName}
            </Link>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-100">{comment.content}</p>
          </div>
          <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
            <span>{formatRelativeTime(comment.createdAt)}</span>
            {comment.likes > 0 && <span>{comment.likes.toLocaleString('es')} me gusta</span>}
            {canReply && (
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(!showReplyForm);
                }}
                className="hover:text-slate-400 transition"
              >
                Responder
              </button>
            )}
            {hasReplies && (
              <button
                type="button"
                onClick={() => {
                  setShowReplies(!showReplies);
                }}
                className="hover:text-slate-400 transition"
              >
                {showReplies ? 'Ocultar' : 'Ver'} {replies.length} {replies.length === 1 ? 'respuesta' : 'respuestas'}
              </button>
            )}
          </div>

          {/* Formulario de reply */}
          {showReplyForm && currentUser && (
            <form onSubmit={handleSubmitReply} className="mt-3 flex gap-2">
              <div className="relative size-6 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={currentUser.avatarUrl ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${currentUser.handle}`}
                  alt={currentUser.displayName}
                  fill
                  className="object-cover"
                />
              </div>
              <input
                type="text"
                value={replyText}
                onChange={(e) => {
                  setReplyText(e.target.value);
                }}
                placeholder={`Responder a ${comment.author.displayName}...`}
                className="flex-1 rounded-lg border border-white/10 bg-slate-800/60 px-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/40"
              />
              <button
                type="submit"
                disabled={createReplyMutation.isPending || replyText.trim().length === 0}
                className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createReplyMutation.isPending ? '...' : 'Responder'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyText('');
                }}
                className="rounded-lg border border-white/10 bg-slate-800/60 px-3 py-1.5 text-xs text-white transition hover:bg-slate-700/60"
              >
                Cancelar
              </button>
            </form>
          )}

          {/* Replies */}
          {showReplies && (
            <div className="mt-3 space-y-3">
              {repliesQuery.isLoading ? (
                <div className="py-2 text-center text-xs text-slate-400">Cargando respuestas...</div>
              ) : (
                replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

