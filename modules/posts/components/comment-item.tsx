'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { type ReactElement,useState } from 'react';
import { toast } from 'sonner';

import { getAvatarUrl } from '@/lib/image-utils';
import { formatRelativeTime } from '@/modules/feed/utils/formatters';
import { type Comment, type CommentResourceType,createComment, fetchReplies } from '@/services/api/comments';
import { useSessionStore } from '@/store/session';

interface CommentItemProps {
  readonly comment: Comment;
  readonly postId: string;
  readonly resourceType?: CommentResourceType;
  readonly depth?: number;
}

const MAX_DEPTH = 3; // Máximo de niveles de replies

/**
 * Renderiza un comentario individual con soporte para replies anidados.
 */
export function CommentItem({ comment, postId, resourceType = 'post', depth = 0 }: CommentItemProps): ReactElement | null {
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
    mutationFn: (content: string) => createComment(postId, { content, parentId: comment.id }, resourceType),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comment-replies', comment.id] });
      void queryClient.invalidateQueries({ queryKey: [resourceType === 'frame' ? 'frame-comments' : 'comments', postId] });
      void queryClient.invalidateQueries({ queryKey: [resourceType === 'frame' ? 'frame' : 'post', postId] });
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
  const author = comment.author;
  if (!author) {
    return null;
  }
  const avatarSrc = getAvatarUrl(author.avatarUrl, author.handle);

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l border-white/12 pl-4' : ''} space-y-3`}>
      <div className="flex gap-3 md:gap-4">
        <Link
          href={`/${author.handle}`}
          className="relative size-9 shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/[0.06]"
        >
          <Image src={avatarSrc} alt={author.displayName} fill className="object-cover" />
        </Link>
        <div className="flex-1">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/${author.handle}`} className="text-sm font-semibold text-white hover:text-primary-200 transition-colors">
                {author.displayName}
              </Link>
              <Link href={`/${author.handle}`} className="text-xs text-white/50 hover:text-primary-200 transition-colors">
                @{author.handle}
              </Link>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/85">{comment.content}</p>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-white/50">
            <span>{formatRelativeTime(comment.createdAt)}</span>
            {comment.likes > 0 && <span>{comment.likes.toLocaleString('es')} me gusta</span>}
            {canReply && (
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(!showReplyForm);
                }}
                className="font-medium text-primary-300 transition hover:text-primary-100"
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
                className="font-medium text-primary-300 transition hover:text-primary-100"
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
                  src={getAvatarUrl(currentUser.avatarUrl, currentUser.handle)}
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
                placeholder={`Responder a ${author.displayName}...`}
                className="flex-1 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white placeholder:text-white/50 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300/40"
              />
              <button
                type="submit"
                disabled={createReplyMutation.isPending || replyText.trim().length === 0}
                className="rounded-lg bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-primary-500/30 transition hover:shadow-xl hover:shadow-primary-500/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {createReplyMutation.isPending ? '...' : 'Responder'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyText('');
                }}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]"
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
                  <CommentItem key={reply.id} comment={reply} postId={postId} resourceType={resourceType} depth={depth + 1} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

