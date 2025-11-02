'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useState, type ReactElement } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { FeedItem } from '@/services/api/types/feed';
import { formatRelativeTime } from '../utils/formatters';
import { likePost, unlikePost } from '@/services/api/likes';
import { savePost, unsavePost } from '@/services/api/saves';
import { getCollections, type Collection } from '@/services/api/collections';
import { fetchComments, createComment, type Comment } from '@/services/api/comments';
import { toast } from 'sonner';
import { sharePost, copyPostLink } from '@/lib/share';
import { ReportDialog } from '@/modules/moderation/components/report-dialog';
import { renderCaptionWithLinks } from '../utils/caption-renderer';
import { updatePost, deletePost } from '@/services/api/feed';
import { useSessionStore } from '@/store/session';
import { VerifiedBadge } from '@/components/verified-badge';

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

interface CommentWithReportProps {
  readonly comment: Comment;
}

function CommentWithReport({ comment }: CommentWithReportProps): ReactElement {
  const [showReportDialog, setShowReportDialog] = useState(false);

  return (
    <>
      <div className="flex gap-3">
        <Image
          src={comment.author?.avatarUrl ?? ''}
          alt={comment.author?.displayName ?? ''}
          width={32}
          height={32}
          className="size-8 shrink-0 rounded-full object-cover"
        />
        <div className="flex-1 rounded-lg bg-slate-800/40 p-3">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200">
                {comment.author?.displayName ?? 'Usuario'}
              </span>
              {comment.author?.isVerified && <VerifiedBadge size="sm" />}
              <span className="text-xs text-slate-500">@{comment.author?.handle ?? ''}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowReportDialog(true);
              }}
              className="rounded-full p-1 text-slate-500 transition hover:bg-slate-700 hover:text-slate-300"
              title="Reportar comentario"
            >
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-slate-300">{comment.content}</p>
          <span className="mt-1 block text-xs text-slate-500">{formatRelativeTime(comment.createdAt)}</span>
        </div>
      </div>
      {showReportDialog && (
        <ReportDialog
          targetType="comment"
          targetId={comment.id}
          targetName={`Comentario de @${comment.author?.handle ?? 'usuario'}`}
          onClose={() => {
            setShowReportDialog(false);
          }}
        />
      )}
    </>
  );
}

interface FeedItemProps {
  readonly item: FeedItem;
}

export function FeedItemComponent({ item }: FeedItemProps): ReactElement {
  const queryClient = useQueryClient();
  const currentUser = useSessionStore((state) => state.user);
  const isAuthor = currentUser?.id === item.author.id;
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

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
    mutationFn: (collectionId?: string) => (item.isSavedByViewer ? unsavePost(item.id) : savePost(item.id, collectionId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
      queryClient.invalidateQueries({ queryKey: ['saved'] });
      setShowSaveDialog(false);
      toast.success(item.isSavedByViewer ? 'Post desguardado' : 'Post guardado');
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
    if (item.isSavedByViewer) {
      // Si ya está guardado, desguardar directamente (no necesita collectionId)
      saveMutation.mutate(undefined);
    } else {
      // Si no está guardado, mostrar selector de colecciones
      setShowSaveDialog(true);
    }
  };

  const handleShare = async (): Promise<void> => {
    const shared = await sharePost(item.id, `Publicación de @${item.author.handle}`);
    if (shared) {
      toast.success('Enlace copiado al portapapeles');
    } else {
      // Si falla sharePost, intentar copiar directamente
      const copied = await copyPostLink(item.id);
      if (copied) {
        toast.success('Enlace copiado al portapapeles');
      } else {
        toast.error('No se pudo copiar el enlace');
      }
    }
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
      <header className="flex items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href={`/${item.author.handle}`}>
            <Image
              src={item.author.avatarUrl}
              alt={item.author.displayName}
              width={48}
              height={48}
              className="size-12 rounded-full object-cover"
            />
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Link href={`/${item.author.handle}`} className="font-semibold text-slate-50 hover:underline">
                {item.author.displayName}
              </Link>
              {item.author.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <Link
              href={`/posts/${item.id}`}
              className="text-sm text-slate-400 hover:text-slate-300 transition"
            >
              @{item.author.handle} • {formatRelativeTime(item.createdAt)}
            </Link>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (isAuthor) {
                setShowOptionsMenu(!showOptionsMenu);
              } else {
                setShowReportDialog(true);
              }
            }}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-300"
            title={isAuthor ? 'Opciones del post' : 'Reportar'}
          >
            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
          {isAuthor && showOptionsMenu && (
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
      </header>

      <div className="flex flex-col gap-4 px-6">
        {item.caption ? (
          <p className="text-base text-slate-100">{renderCaptionWithLinks(item.caption)}</p>
        ) : null}

        {item.media.map((media) => (
          <Link key={media.id} href={`/posts/${item.id}`} className="block">
            <Fragment>
              {media.kind === 'image' ? (
                <Image
                  src={media.url}
                  alt={item.caption}
                  width={media.width ?? 1080}
                  height={media.height ?? 1920}
                  className="max-h-[640px] w-full rounded-2xl object-cover transition hover:opacity-90"
                />
              ) : (
                <div className="relative">
                  <video
                    src={media.url}
                    poster={media.thumbnailUrl}
                    controls
                    preload="metadata"
                    className="max-h-[640px] w-full rounded-2xl"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/posts/${item.id}`;
                    }}
                  />
                  {media.durationMs ? (
                    <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                      {formatDuration(media.durationMs)}
                    </div>
                  ) : null}
                </div>
              )}
            </Fragment>
          </Link>
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

          <Link
            href={`/posts/${item.id}#comments`}
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
          </Link>

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

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 text-slate-400 transition hover:text-slate-300"
            title="Compartir"
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342c-.400 0-.816-.039-1.236-.115l-.866-2.322c-.35-.937.062-1.954.938-2.305l2.322-.866c.402-.15.81-.231 1.221-.231.4 0 .816.039 1.236.115l.866 2.322c.35.937-.062 1.954-.938 2.305l-2.322.866c-.402.15-.81.231-1.221.231zM13.342 8.684c.4 0 .816-.039 1.236-.115l.866-2.322c.35-.937-.062-1.954-.938-2.305l-2.322-.866c-.402-.15-.81-.231-1.221-.231-.4 0-.816.039-1.236.115l-.866 2.322c-.35.937.062 1.954.938 2.305l2.322.866c.402.15.81.231 1.221.231zM21.316 13.342c.4 0 .816-.039 1.236-.115l.866-2.322c.35-.937-.062-1.954-.938-2.305l-2.322-.866c-.402-.15-.81-.231-1.221-.231-.4 0-.816.039-1.236.115l-.866 2.322c-.35.937.062 1.954.938 2.305l2.322.866c.402.15.81.231 1.221.231zM16.658 21.316c-.4 0-.816.039-1.236.115l-.866 2.322c-.35.937.062 1.954.938 2.305l2.322.866c.402.15.81.231 1.221.231.4 0 .816-.039 1.236-.115l.866-2.322c.35-.937-.062-1.954-.938-2.305l-2.322-.866c-.402-.15-.81-.231-1.221-.231z"
              />
            </svg>
            {item.stats.shares > 0 && (
              <span className="text-sm font-medium">{item.stats.shares.toLocaleString('es')}</span>
            )}
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
                  <CommentWithReport key={comment.id} comment={comment} />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </footer>

      {showReportDialog && (
        <ReportDialog
          targetType="post"
          targetId={item.id}
          targetName={`Publicación de @${item.author.handle}`}
          onClose={() => {
            setShowReportDialog(false);
          }}
        />
      )}

      {/* Modal de edición */}
      {showEditDialog && (
        <EditPostDialog
          postId={item.id}
          currentCaption={item.caption}
          onClose={() => {
            setShowEditDialog(false);
          }}
          onSuccess={() => {
            setShowEditDialog(false);
            queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
            queryClient.invalidateQueries({ queryKey: ['post', item.id] });
          }}
        />
      )}

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && (
        <DeletePostDialog
          postId={item.id}
          onClose={() => {
            setShowDeleteConfirm(false);
          }}
          onSuccess={() => {
            setShowDeleteConfirm(false);
            queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
            queryClient.invalidateQueries({ queryKey: ['post', item.id] });
            toast.success('Publicación eliminada');
          }}
        />
      )}

      {/* Dialog para seleccionar colección al guardar */}
      {showSaveDialog && (
        <SaveToCollectionDialog
          postId={item.id}
          onClose={() => {
            setShowSaveDialog(false);
          }}
          onSave={(collectionId) => {
            saveMutation.mutate(collectionId);
          }}
        />
      )}
    </article>
  );
}

interface SaveToCollectionDialogProps {
  readonly postId: string;
  readonly onClose: () => void;
  readonly onSave: (collectionId?: string) => void;
}

function SaveToCollectionDialog({ onClose, onSave }: SaveToCollectionDialogProps): ReactElement {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: getCollections
  });

  const collections = data?.collections ?? [];
  const defaultCollection = collections.find((c) => c.id === 'default');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-white">Guardar en colección</h2>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-slate-400">Cargando colecciones...</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {/* Opción por defecto */}
            <button
              type="button"
              onClick={() => {
                setSelectedCollectionId(null);
              }}
              className={`w-full rounded-lg border p-3 text-left transition ${
                selectedCollectionId === null
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-slate-700">
                  <svg className="size-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{defaultCollection?.name ?? 'Guardados'}</h3>
                  <p className="text-xs text-slate-400">{defaultCollection?.postCount ?? 0} posts</p>
                </div>
              </div>
            </button>

            {/* Otras colecciones */}
            {collections
              .filter((c) => c.id !== 'default')
              .map((collection) => (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => {
                    setSelectedCollectionId(collection.id);
                  }}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    selectedCollectionId === collection.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {collection.coverImageUrl ? (
                      <div className="relative size-12 overflow-hidden rounded-lg">
                        <Image src={collection.coverImageUrl} alt={collection.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="flex size-12 items-center justify-center rounded-lg bg-slate-700">
                        <svg className="size-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{collection.name}</h3>
                      <p className="text-xs text-slate-400">{collection.postCount} posts</p>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-transparent px-6 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(selectedCollectionId === null ? undefined : selectedCollectionId);
            }}
            className="rounded-xl bg-primary-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-primary-400"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
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

