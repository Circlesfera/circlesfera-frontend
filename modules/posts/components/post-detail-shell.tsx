'use client';

import React, { Fragment, useState, useRef, type ReactElement } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { getPostById, updatePost, deletePost } from '@/services/api/feed';
import { formatRelativeTime } from '@/modules/feed/utils/formatters';
import { formatNumber } from '@/lib/utils';
import { renderCaptionWithLinks } from '@/modules/feed/utils/caption-renderer';
import { useSessionStore } from '@/store/session';
import { toast } from 'sonner';
import { fadeUpVariants, modalVariants, overlayVariants } from '@/lib/motion-config';

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
import { ImageTags } from '@/modules/feed/components/image-tags';
import { AddTagDialog } from '@/modules/tags/components/add-tag-dialog';
import { isLocalImage, getAvatarUrl } from '@/lib/image-utils';

/**
 * Renderiza la vista detallada de un post individual.
 */
export function PostDetailShell({ postId }: { postId: string }): ReactElement {
  const queryClient = useQueryClient();
  const currentUser = useSessionStore((state) => state.user);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showAddTagDialog, setShowAddTagDialog] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const mediaRefs = useRef<Map<number, React.RefObject<HTMLDivElement | null>>>(new Map());

  const { data, isLoading, isError } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostById(postId),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl">
        <div className="rounded-2xl glass-card p-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="size-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent mx-auto mb-3" />
              <p className="text-sm text-slate-400">Cargando publicación...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.post) {
    return (
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl"
      >
        <div className="rounded-2xl glass-card p-8 text-center">
          <div className="size-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="size-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-red-400 mb-2">
            Error al cargar la publicación
          </p>
          <p className="text-xs text-slate-500">
            La publicación no existe o ha sido eliminada
          </p>
        </div>
      </motion.div>
    );
  }

  const post = data.post;

  return (
    <>
      <motion.article
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl overflow-hidden rounded-2xl glass-card border border-white/5"
      >
      {/* Header con autor */}
      <header className="flex items-center justify-between gap-3 border-b border-white/5 px-6 py-5">
        <div className="flex items-center gap-3">
          <Link href={`/${post.author.handle}`} className="relative size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white/10 hover:ring-primary-400/30 transition-all duration-300">
            <Image
              src={getAvatarUrl(post.author.avatarUrl, post.author.handle)}
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
            <motion.button
              type="button"
              onClick={() => {
                setShowOptionsMenu(!showOptionsMenu);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
              title="Opciones del post"
            >
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </motion.button>
            <AnimatePresence>
              {showOptionsMenu && (
                <>
                  <motion.div
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="fixed inset-0 z-40"
                    onClick={() => {
                      setShowOptionsMenu(false);
                    }}
                  />
                  <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl glass-modal border border-white/10 shadow-elegant-xl"
                  >
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowEditDialog(true);
                      setShowOptionsMenu(false);
                    }}
                    whileHover={{ x: 4 }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition hover:bg-white/5 first:rounded-t-xl"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar publicación
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowOptionsMenu(false);
                    }}
                    whileHover={{ x: 4 }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-400 transition hover:bg-white/5 last:rounded-b-xl"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar publicación
                  </motion.button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </header>

      {/* Caption */}
      {post.caption ? (
        <div className="px-6 py-4 border-b border-white/5">
          <div className="whitespace-pre-wrap text-base text-slate-100 leading-relaxed">{renderCaptionWithLinks(post.caption)}</div>
        </div>
      ) : null}

      {/* Media */}
      <div className="flex flex-col gap-4 px-6 py-6">

        {post.media.map((media, mediaIndex) => {
          if (!mediaRefs.current.has(mediaIndex)) {
            mediaRefs.current.set(mediaIndex, React.createRef<HTMLDivElement>());
          }
          const mediaRef = mediaRefs.current.get(mediaIndex)!;

          return (
            <Fragment key={media.id}>
              {media.kind === 'image' ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-900/50 border border-white/5 group">
                  <div ref={mediaRef} className="relative size-full">
                    <Image
                      src={media.url}
                      alt={post.caption || 'Imagen'}
                      fill
                      className="object-contain"
                      unoptimized={isLocalImage(media.url)}
                    />
                    {media.tags && media.tags.length > 0 && (
                      <ImageTags
                        tags={media.tags}
                        imageWidth={media.width ?? 1080}
                        imageHeight={media.height ?? 1920}
                        containerRef={mediaRef}
                      />
                    )}
                    {currentUser?.id === post.author.id && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMediaIndex(mediaIndex);
                          setShowAddTagDialog(true);
                        }}
                        className="absolute bottom-4 right-4 rounded-full bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 backdrop-blur-sm p-2.5 text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:scale-110 shadow-lg shadow-primary-500/40"
                        title="Agregar etiqueta"
                      >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900/50 border border-white/5">
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
          );
        })}
      </div>

      {/* Acciones (like, comment, save) */}
      <FeedItemActions post={post} />

      {/* Estadísticas */}
      <div className="border-t border-white/5 px-6 py-4">
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <span>{formatNumber(post.stats.likes)} me gusta</span>
          <span>{formatNumber(post.stats.comments)} comentarios</span>
          {post.stats.views > 0 ? <span>{formatNumber(post.stats.views)} visualizaciones</span> : null}
        </div>
      </div>

      {/* Comentarios */}
      <div className="border-t border-white/5">
        <PostComments postId={postId} />
      </div>
      </motion.article>

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

      {/* Diálogo para agregar tags */}
      {showAddTagDialog && post && selectedMediaIndex !== null && (
        <AddTagDialog
          postId={post.id}
          mediaIndex={selectedMediaIndex}
          mediaWidth={post.media[selectedMediaIndex]?.width ?? 1080}
          mediaHeight={post.media[selectedMediaIndex]?.height ?? 1920}
          imageRef={mediaRefs.current.get(selectedMediaIndex)!}
          isOpen={showAddTagDialog}
          onClose={() => {
            setShowAddTagDialog(false);
            setSelectedMediaIndex(null);
          }}
          onTagAdded={() => {
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-50 w-full max-w-md rounded-2xl glass-modal p-6 shadow-elegant-xl"
        >
          <h2 className="mb-4 text-xl font-bold text-gradient-primary">Editar publicación</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <textarea
                value={caption}
                onChange={(e) => {
                  setCaption(e.target.value);
                }}
                maxLength={2200}
                rows={5}
                className="w-full rounded-xl input-base"
                placeholder="Escribe un pie de foto..."
              />
              <div className="mt-1 text-xs text-slate-500">{caption.length} / 2200</div>
            </div>
            <div className="flex justify-end gap-3">
              <motion.button
                type="button"
                onClick={onClose}
                disabled={updateMutation.isPending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl glass-dark px-6 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                Cancelar
              </motion.button>
              <motion.button
                type="submit"
                disabled={updateMutation.isPending || caption.trim() === currentCaption.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
              >
                {updateMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Guardando...
                  </span>
                ) : (
                  'Guardar'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-50 w-full max-w-md rounded-2xl glass-modal border border-red-500/30 p-6 shadow-elegant-xl"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="size-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg className="size-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Eliminar publicación</h2>
              <p className="mt-1 text-sm text-slate-400">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <motion.button
              type="button"
              onClick={onClose}
              disabled={deleteMutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl glass-dark px-6 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              Cancelar
            </motion.button>
            <motion.button
              type="button"
              onClick={() => {
                deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
            >
              {deleteMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Eliminando...
                </span>
              ) : (
                'Eliminar'
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

