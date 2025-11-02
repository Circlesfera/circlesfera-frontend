'use client';

import { type ReactElement } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';

import type { FeedItem } from '@/services/api/types/feed';
import { likePost, unlikePost } from '@/services/api/likes';
import { savePost, unsavePost } from '@/services/api/saves';

interface FeedItemActionsProps {
  readonly post: FeedItem;
}

/**
 * Componente reutilizable para las acciones de un post (like, comment, save).
 */
export function FeedItemActions({ post }: FeedItemActionsProps): ReactElement {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: post.isLikedByViewer ? unlikePost : likePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', post.id] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
    },
    onError: () => {
      toast.error('No se pudo actualizar el like');
    }
  });

  const saveMutation = useMutation({
    mutationFn: post.isSavedByViewer ? unsavePost : savePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', post.id] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
      queryClient.invalidateQueries({ queryKey: ['saved'] });
    },
    onError: () => {
      toast.error('No se pudo actualizar el guardado');
    }
  });

  const handleLike = (): void => {
    likeMutation.mutate(post.id);
  };

  const handleSave = (): void => {
    saveMutation.mutate(post.id);
  };

  return (
    <div className="flex items-center gap-6 border-t border-slate-800 px-6 py-4">
      <button
        type="button"
        onClick={handleLike}
        disabled={likeMutation.isPending}
        className={`flex items-center gap-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
          post.isLikedByViewer ? 'text-red-500 hover:text-red-400' : 'text-slate-400 hover:text-slate-300'
        }`}
      >
        <svg
          className="size-6"
          fill={post.isLikedByViewer ? 'currentColor' : 'none'}
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
        <span className="text-sm font-medium">{post.stats.likes.toLocaleString('es')}</span>
      </button>

      <Link
        href={`/posts/${post.id}#comments`}
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
        <span className="text-sm font-medium">{post.stats.comments.toLocaleString('es')}</span>
      </Link>

      <button
        type="button"
        onClick={handleSave}
        disabled={saveMutation.isPending}
        className={`flex items-center gap-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
          post.isSavedByViewer ? 'text-yellow-500 hover:text-yellow-400' : 'text-slate-400 hover:text-slate-300'
        }`}
      >
        <svg
          className="size-6"
          fill={post.isSavedByViewer ? 'currentColor' : 'none'}
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
  );
}

