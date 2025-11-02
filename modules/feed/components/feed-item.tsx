'use client';

import Image from 'next/image';
import { Fragment, useState, type ReactElement } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { FeedItem } from '@/services/api/types/feed';
import { formatRelativeTime } from '../utils/formatters';
import { likePost, unlikePost } from '@/services/api/likes';
import { savePost, unsavePost } from '@/services/api/saves';
import { fetchComments, createComment, type Comment } from '@/services/api/comments';
import { toast } from 'sonner';

interface FeedItemProps {
  readonly item: FeedItem;
}

export function FeedItemComponent({ item }: FeedItemProps): ReactElement {
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const likeMutation = useMutation({
    mutationFn: item.isLikedByViewer ? unlikePost : likePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
    },
    onError: () => {
      toast.error('No se pudo actualizar el like');
    }
  });

  const saveMutation = useMutation({
    mutationFn: item.isSavedByViewer ? unsavePost : savePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
      queryClient.invalidateQueries({ queryKey: ['saved'] });
    },
    onError: () => {
      toast.error('No se pudo actualizar el guardado');
    }
  });

  const commentsQuery = useQuery({
    queryKey: ['comments', item.id],
    queryFn: () => fetchComments(item.id),
    enabled: showComments
  });

  const createCommentMutation = useMutation({
    mutationFn: (content: string) => createComment(item.id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', item.id] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
      setCommentText('');
      toast.success('Comentario publicado');
    },
    onError: () => {
      toast.error('No se pudo publicar el comentario');
    }
  });

  const handleLike = (): void => {
    likeMutation.mutate(item.id);
  };

  const handleSave = (): void => {
    saveMutation.mutate(item.id);
  };

  const handleSubmitComment = (e: React.FormEvent): void => {
    e.preventDefault();
    if (commentText.trim().length === 0) {
      return;
    }
    createCommentMutation.mutate(commentText.trim());
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-soft-lg">
      <header className="flex items-center gap-3 px-6 py-4">
        <Image
          src={item.author.avatarUrl}
          alt={item.author.displayName}
          width={48}
          height={48}
          className="size-12 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-slate-50">{item.author.displayName}</span>
          <span className="text-sm text-slate-400">
            @{item.author.handle} • {formatRelativeTime(item.createdAt)}
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-6">
        {item.caption ? <p className="text-base text-slate-100">{item.caption}</p> : null}

        {item.media.map((media) => (
          <Fragment key={media.id}>
            {media.kind === 'image' ? (
              <Image
                src={media.url}
                alt={item.caption}
                width={media.width ?? 1080}
                height={media.height ?? 1920}
                className="max-h-[640px] w-full rounded-2xl object-cover"
              />
            ) : (
              <video
                src={media.url}
                poster={media.thumbnailUrl}
                controls
                preload="metadata"
                className="max-h-[640px] w-full rounded-2xl"
              />
            )}
          </Fragment>
        ))}
      </div>

      <footer className="px-6 py-4">
        <div className="mb-3 flex items-center gap-6">
          <button
            type="button"
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={`flex items-center gap-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
              item.isLikedByViewer ? 'text-red-500 hover:text-red-400' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <svg
              className="size-6"
              fill={item.isLikedByViewer ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-sm font-medium">{item.stats.likes.toLocaleString('es')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowComments(!showComments);
            }}
            className="flex items-center gap-2 text-slate-400 transition hover:text-slate-300"
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-sm font-medium">{item.stats.comments.toLocaleString('es')}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className={`flex items-center gap-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
              item.isSavedByViewer ? 'text-yellow-500 hover:text-yellow-400' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <svg
              className="size-6"
              fill={item.isSavedByViewer ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        </div>

        <div className="text-xs text-slate-500">
          {item.stats.views.toLocaleString('es')} visualizaciones
        </div>

        {showComments ? (
          <div className="mt-4 space-y-4 border-t border-slate-800 pt-4">
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                }}
                placeholder="Escribe un comentario..."
                maxLength={2200}
                className="flex-1 rounded-lg border border-white/10 bg-slate-800/60 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/40"
              />
              <button
                type="submit"
                disabled={createCommentMutation.isPending || commentText.trim().length === 0}
                className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createCommentMutation.isPending ? '...' : 'Publicar'}
              </button>
            </form>

            {commentsQuery.isLoading ? (
              <div className="py-4 text-center text-sm text-slate-400">Cargando comentarios...</div>
            ) : commentsQuery.data?.data.length === 0 ? (
              <div className="py-4 text-center text-sm text-slate-400">No hay comentarios aún</div>
            ) : (
              <div className="space-y-3">
                {commentsQuery.data?.data.map((comment: Comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Image
                      src={comment.author?.avatarUrl ?? ''}
                      alt={comment.author?.displayName ?? ''}
                      width={32}
                      height={32}
                      className="size-8 shrink-0 rounded-full object-cover"
                    />
                    <div className="flex-1 rounded-lg bg-slate-800/40 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-200">
                          {comment.author?.displayName ?? 'Usuario'}
                        </span>
                        <span className="text-xs text-slate-500">@{comment.author?.handle ?? ''}</span>
                      </div>
                      <p className="text-sm text-slate-300">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </footer>
    </article>
  );
}

