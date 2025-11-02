'use client';

import { Fragment, useState, type ReactElement } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';

import { getPostById, updatePost, deletePost } from '@/services/api/feed';
import { formatRelativeTime } from '@/modules/feed/utils/formatters';
import { formatNumber } from '@/lib/utils';
import { renderCaptionWithLinks } from '@/modules/feed/utils/caption-renderer';
import { useSessionStore } from '@/store/session';
import { toast } from 'sonner';

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
import { FeedItemActions } from './feed-item-actions';
import { PostComments } from './post-comments';
import { RelatedPosts } from './related-posts';
import { VerifiedBadge } from '@/components/verified-badge';

/**
 * Renderiza la vista detallada de un post individual.
 */
export function PostDetailShell({ postId }: { postId: string }): ReactElement {
  const queryClient = useQueryClient();
  const currentUser = useSessionStore((state) => state.user);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostById(postId),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-slate-400">Cargando publicación...</div>;
  }

  if (isError || !data?.post) {
    return <div className="py-16 text-center text-sm text-red-400">Error al cargar la publicación.</div>;
  }

  const post = data.post;

  return (
    <>
      <article className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-soft-lg">
      {/* Header con autor */}
      <header className="flex items-center justify-between gap-3 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href={`/${post.author.handle}`} className="relative size-12 shrink-0 overflow-hidden rounded-full">
            <Image
              src={post.author.avatarUrl ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${post.author.handle}`}
              alt={post.author.displayName}
              fill
              className="object-cover"
            />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/${post.author.handle}`}
                className="block font-semibold text-white hover:underline"
              >
                {post.author.displayName}
              </Link>
              {post.author.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-xs text-slate-400">
              @{post.author.handle} • {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>
        {currentUser?.id === post.author.id && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowOptionsMenu(!showOptionsMenu);
              }}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-300"
              title="Opciones del post"
            >
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
            {showOptionsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => {
                    setShowOptionsMenu(false);
                  }}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-slate-700 bg-slate-900 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditDialog(true);
                      setShowOptionsMenu(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition hover:bg-slate-800 first:rounded-t-xl"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar publicación
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowOptionsMenu(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-400 transition hover:bg-slate-800 last:rounded-b-xl"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar publicación
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* Media */}
      <div className="flex flex-col gap-4 px-6 py-6">
        {post.caption ? (
          <div className="whitespace-pre-wrap text-base text-slate-100">{renderCaptionWithLinks(post.caption)}</div>
        ) : null}

        {post.media.map((media) => (
          <Fragment key={media.id}>
            {media.kind === 'image' ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-800">
                <Image
                  src={media.url}
                  alt={post.caption || 'Imagen'}
                  fill
                  width={media.width ?? 1080}
                  height={media.height ?? 1920}
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-800">
                <video
                  src={media.url}
                  poster={media.thumbnailUrl}
                  controls
                  preload="metadata"
                  className="size-full object-contain"
                />
                {media.durationMs ? (
                  <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                    {formatDuration(media.durationMs)}
                  </div>
                ) : null}
              </div>
            )}
          </Fragment>
        ))}
      </div>

      {/* Acciones (like, comment, save) */}
      <FeedItemActions post={post} />

      {/* Estadísticas */}
      <div className="border-t border-slate-800 px-6 py-3">
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>{formatNumber(post.stats.likes)} me gusta</span>
          <span>{formatNumber(post.stats.comments)} comentarios</span>
          {post.stats.views > 0 ? <span>{formatNumber(post.stats.views)} visualizaciones</span> : null}
        </div>
      </div>

      {/* Comentarios */}
      <PostComments postId={postId} />
      </article>

      {/* Posts relacionados */}
      <RelatedPosts postId={postId} />

      {/* Modal de edición */}
      {showEditDialog && post && (
        <EditPostDialog
          postId={post.id}
          currentCaption={post.caption}
          onClose={() => {
            setShowEditDialog(false);
          }}
          onSuccess={() => {
            setShowEditDialog(false);
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
            queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
          }}
        />
      )}

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && post && (
        <DeletePostDialog
          postId={post.id}
          onClose={() => {
            setShowDeleteConfirm(false);
          }}
          onSuccess={() => {
            setShowDeleteConfirm(false);
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
            queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
            toast.success('Publicación eliminada');
            window.history.back();
          }}
        />
      )}
    </>
  );
}

interface EditPostDialogProps {
  readonly postId: string;
  readonly currentCaption: string;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

function EditPostDialog({ postId, currentCaption, onClose, onSuccess }: EditPostDialogProps): ReactElement {
  const [caption, setCaption] = useState(currentCaption);

  const updateMutation = useMutation({
    mutationFn: (payload: { caption: string }) => updatePost(postId, payload),
    onSuccess: () => {
      onSuccess();
    },
    onError: () => {
      toast.error('No se pudo actualizar la publicación');
    }
  });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    updateMutation.mutate({ caption: caption.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-white">Editar publicación</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              value={caption}
              onChange={(e) => {
                setCaption(e.target.value);
              }}
              maxLength={2200}
              rows={5}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="Escribe un pie de foto..."
            />
            <div className="mt-1 text-xs text-slate-500">{caption.length} / 2200</div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="rounded-xl border border-slate-700 bg-transparent px-6 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending || caption.trim() === currentCaption.trim()}
              className="rounded-xl bg-primary-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeletePostDialogProps {
  readonly postId: string;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

function DeletePostDialog({ postId, onClose, onSuccess }: DeletePostDialogProps): ReactElement {
  const deleteMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      onSuccess();
    },
    onError: () => {
      toast.error('No se pudo eliminar la publicación');
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-red-800 bg-slate-900 p-6 shadow-2xl">
        <h2 className="mb-2 text-xl font-bold text-white">Eliminar publicación</h2>
        <p className="mb-6 text-sm text-slate-400">¿Estás seguro? Esta acción no se puede deshacer.</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="rounded-xl border border-slate-700 bg-transparent px-6 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
            className="rounded-xl bg-red-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

