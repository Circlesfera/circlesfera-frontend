'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Fragment, memo, useMemo, useCallback, useState, type ReactElement } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { fadeUpVariants, cardVariants } from '@/lib/motion-config';

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
import { updatePost, deletePost, archivePost, unarchivePost } from '@/services/api/feed';
import { useSessionStore } from '@/store/session';
import { VerifiedBadge } from '@/components/verified-badge';
import { ImageTags } from './image-tags';
import { ShareToStoryDialog } from '@/modules/stories/components/share-to-story-dialog';
import { isLocalImage } from '@/lib/image-utils';
import { FeedItemActions } from '@/modules/posts/components/feed-item-actions';

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
          src={comment.author?.avatarUrl || `https://api.dicebear.com/7.x/thumbs/svg?seed=${comment.author?.handle || 'user'}`}
          alt={comment.author?.displayName ?? ''}
          width={32}
          height={32}
          className="size-8 shrink-0 rounded-full object-cover"
        />
        <div className="flex-1 rounded-xl glass-card p-4">
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
  readonly isArchivedPage?: boolean; // Si true, muestra opción de desarchivar en lugar de archivar
}

function FeedItemComponentInner({ item, isArchivedPage = false }: FeedItemProps): ReactElement {
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
  const [showShareToStoryDialog, setShowShareToStoryDialog] = useState(false);

  const archiveMutation = useMutation({
    mutationFn: () => archivePost(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts', item.author.handle] });
      setShowOptionsMenu(false);
      toast.success('Publicación archivada');
    },
    onError: () => {
      toast.error('No se pudo archivar la publicación');
    }
  });

  const unarchiveMutation = useMutation({
    mutationFn: () => unarchivePost(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed', 'archived'] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts', item.author.handle] });
      setShowOptionsMenu(false);
      toast.success('Publicación desarchivada');
    },
    onError: () => {
      toast.error('No se pudo desarchivar la publicación');
    }
  });

  const likeMutationFn = useMemo(() => (item.isLikedByViewer ? unlikePost : likePost), [item.isLikedByViewer]);

  const likeMutation = useMutation({
    mutationFn: likeMutationFn,
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

  const handleLike = useCallback((): void => {
    likeMutation.mutate(item.id);
  }, [item.id, likeMutation]);

  const handleSave = useCallback((): void => {
    if (item.isSavedByViewer) {
      // Si ya está guardado, desguardar directamente (no necesita collectionId)
      saveMutation.mutate(undefined);
    } else {
      // Si no está guardado, mostrar selector de colecciones
      setShowSaveDialog(true);
    }
  }, [item.isSavedByViewer, saveMutation]);

  const handleShare = useCallback(async (): Promise<void> => {
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
  }, [item.id, item.author.handle]);

  const handleSubmitComment = useCallback((e: React.FormEvent): void => {
    e.preventDefault();
    if (commentText.trim().length === 0) {
      return;
    }
    createCommentMutation.mutate(commentText.trim());
  }, [commentText, createCommentMutation]);

  return (
    <motion.article
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="group relative overflow-hidden rounded-2xl glass-card mb-8 last:mb-0"
    >
      <header className="flex items-center justify-between gap-3 px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link 
            href={`/${item.author.handle}`}
            className="relative group/avatar transition-all duration-300 hover:scale-110"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 blur-md animate-pulse-slow" />
            <div className="relative size-11 rounded-full ring-2 ring-slate-800/50 group-hover/avatar:ring-primary-500/30 transition-all duration-300 p-0.5">
              <div className="relative size-full rounded-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
            <Image
              src={item.author.avatarUrl || `https://api.dicebear.com/7.x/thumbs/svg?seed=${item.author.handle}`}
              alt={item.author.displayName}
                  fill
                  className="object-cover"
            />
              </div>
            </div>
          </Link>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Link 
                href={`/${item.author.handle}`} 
                className="font-semibold text-white hover:text-primary-300 transition-colors duration-200"
              >
                {item.author.handle}
              </Link>
              {item.author.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <Link
              href={`/posts/${item.id}`}
              className="text-xs text-slate-500 hover:text-slate-400 transition-colors duration-200"
            >
              {formatRelativeTime(item.createdAt)}
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
            className="rounded-xl p-2 text-slate-400 transition-all duration-300 hover:bg-slate-800/60 hover:text-white active:scale-95 hover:shadow-lg"
            title={isAuthor ? 'Opciones del post' : 'Reportar'}
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
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl glass-modal shadow-elegant-xl overflow-hidden">
                {/* Opción: Compartir en story (disponible para todos) */}
                {!isAuthor && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowShareToStoryDialog(true);
                      setShowOptionsMenu(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-transparent active:bg-slate-700/50"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Compartir en story
                  </button>
                )}

                {/* Opciones del autor */}
                {isAuthor && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditDialog(true);
                        setShowOptionsMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-transparent active:bg-slate-700/50"
                    >
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar publicación
                    </button>
                {isArchivedPage ? (
                  <button
                    type="button"
                    onClick={() => {
                      unarchiveMutation.mutate();
                    }}
                    disabled={unarchiveMutation.isPending}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-transparent disabled:opacity-50"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Desarchivar publicación
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      archiveMutation.mutate();
                    }}
                    disabled={archiveMutation.isPending}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-transparent disabled:opacity-50"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Archivar publicación
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowOptionsMenu(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-400 transition-all duration-300 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-transparent"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar publicación
                </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Media */}
      {item.media.map((media, mediaIndex) => (
        <Link key={media.id} href={`/posts/${item.id}`} className="block w-full group/media">
          <Fragment>
            {media.kind === 'image' ? (
              <div className="relative w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-300 z-10" />
                <Image
                  src={media.url}
                  alt={item.caption}
                  width={media.width ?? 1080}
                  height={media.height ?? 1920}
                  className="w-full object-contain transition-transform duration-500 group-hover/media:scale-[1.02]"
                  unoptimized={isLocalImage(media.url)}
                />
                  {media.tags && media.tags.length > 0 && (
                    <ImageTags
                      tags={media.tags}
                      imageWidth={media.width ?? 1080}
                      imageHeight={media.height ?? 1920}
                    />
                  )}
                </div>
              ) : (
                <div className="relative w-full">
                  <video
                    src={media.url}
                    poster={media.thumbnailUrl}
                    controls
                    preload="metadata"
                    className="w-full"
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
      
      {/* Acciones */}
      <div className="px-6 py-4 border-b border-white/5">
        <FeedItemActions post={item} />
      </div>

      {/* Caption */}
      {item.caption ? (
        <div className="px-6 py-4">
          <Link href={`/${item.author.handle}`} className="font-semibold text-white mr-2 hover:text-primary-300 transition-colors duration-200">
            {item.author.handle}
          </Link>
          <span className="text-sm text-slate-200 leading-relaxed">{renderCaptionWithLinks(item.caption)}</span>
        </div>
      ) : null}

      {/* Estadísticas */}
      {item.stats.likes > 0 || item.stats.comments > 0 ? (
        <div className="px-6 pb-3">
          <Link href={`/posts/${item.id}`} className="text-sm font-semibold text-slate-300 hover:text-primary-300 transition-colors duration-200">
            {item.stats.likes > 0 && `${item.stats.likes.toLocaleString('es')} me gusta${item.stats.likes !== 1 ? 's' : ''}`}
            {item.stats.likes > 0 && item.stats.comments > 0 && ' • '}
            {item.stats.comments > 0 && `${item.stats.comments.toLocaleString('es')} comentario${item.stats.comments !== 1 ? 's' : ''}`}
          </Link>
        </div>
      ) : null}

      {/* Ver comentarios */}
      {item.stats.comments > 0 && (
        <div className="px-6 pb-3">
          <button
            type="button"
            onClick={() => {
              setShowComments(!showComments);
            }}
            className="text-sm font-medium text-slate-500 hover:text-primary-400 transition-colors duration-200"
          >
            {showComments ? 'Ocultar' : 'Ver'} todos los comentarios
          </button>
        </div>
      )}

      {/* Comentarios */}
      {showComments && (
        <div className="px-6 pb-6 border-t border-white/5 mt-4 pt-4">
          <form onSubmit={handleSubmitComment} className="flex gap-3 mb-4 items-center">
            <input
              type="text"
              value={commentText}
              onChange={(e) => {
                setCommentText(e.target.value);
              }}
              placeholder="Añade un comentario..."
              maxLength={2200}
              className="flex-1 input-base text-sm"
            />
            <button
              type="submit"
              disabled={createCommentMutation.isPending || commentText.trim().length === 0}
              className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-primary-500 hover:to-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 active:scale-95"
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
      )}

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

      {/* Dialog para compartir en story */}
      {showShareToStoryDialog && (
        <ShareToStoryDialog
          post={item}
          onClose={() => {
            setShowShareToStoryDialog(false);
          }}
        />
      )}
    </motion.article>
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

// Memoizar componente para evitar re-renders innecesarios
// Solo se re-renderiza si cambian las propiedades críticas del item
export const FeedItemComponent = memo(FeedItemComponentInner, (prevProps, nextProps) => {
  // Comparación personalizada para optimizar re-renders
  if (prevProps.isArchivedPage !== nextProps.isArchivedPage) {
    return false; // Re-renderizar si cambia isArchivedPage
  }

  const prev = prevProps.item;
  const next = nextProps.item;

  // Comparar propiedades críticas que afectan la renderización
  return (
    prev.id === next.id &&
    prev.stats.likes === next.stats.likes &&
    prev.stats.comments === next.stats.comments &&
    prev.stats.saves === next.stats.saves &&
    prev.isLikedByViewer === next.isLikedByViewer &&
    prev.isSavedByViewer === next.isSavedByViewer &&
    prev.caption === next.caption &&
    prev.author.id === next.author.id &&
    prev.author.displayName === next.author.displayName &&
    prev.author.handle === next.author.handle &&
    prev.author.avatarUrl === next.author.avatarUrl &&
    prev.createdAt === next.createdAt
  );
});

FeedItemComponent.displayName = 'FeedItemComponent';

