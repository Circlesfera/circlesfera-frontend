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
        className="group relative overflow-hidden glass-card border border-white/[0.06] mb-6 last:mb-0 hover:border-white/12 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(139,92,246,0.12)]"
      >
      {/* Header con autor */}
      <header className="flex items-center justify-between gap-2 md:gap-3 border-b border-white/[0.06] px-3 md:px-4 py-2.5 md:py-3">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <Link href={`/${post.author.handle}`} className="relative shrink-0 group/avatar">
            <motion.div 
              className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/40 via-accent-500/30 to-primary-500/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 blur-lg"
              whileHover={{ scale: 1.05 }}
            />
            <motion.div 
              className="relative size-9 md:size-10 rounded-full ring-1 ring-white/[0.05] group-hover/avatar:ring-primary-500/30 transition-all duration-300 overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Image
                src={getAvatarUrl(post.author.avatarUrl, post.author.handle)}
                alt={post.author.displayName}
                fill
                className="object-cover transition-transform duration-300 group-hover/avatar:scale-110"
                sizes="(max-width: 768px) 36px, 40px"
                unoptimized={isLocalImage(post.author.avatarUrl ?? '')}
                key={`${post.author.id}-${post.author.avatarUrl ?? 'no-avatar'}`}
              />
            </motion.div>
          </Link>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
              <Link 
                href={`/${post.author.handle}`} 
                className="font-semibold text-sm md:text-base text-white hover:text-primary-300 transition-colors duration-200 truncate"
                title={post.author.displayName || post.author.handle}
              >
                {post.author.displayName || post.author.handle}
              </Link>
              {post.author.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <div className="flex items-center gap-1 md:gap-1.5 flex-wrap">
              <Link
                href={`/${post.author.handle}`}
                className="text-xs text-white/70 hover:text-white/90 transition-colors duration-200 truncate font-medium"
                title={`@${post.author.handle}`}
              >
                @{post.author.handle}
              </Link>
              <span className="text-[10px] md:text-xs text-white/50">•</span>
              <Link
                href={`/posts/${post.id}`}
                className="text-xs text-white/60 hover:text-white/80 transition-colors duration-200"
              >
                {formatRelativeTime(post.createdAt)}
              </Link>
            </div>
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

      {/* Media mejorado - más compacto */}
      {post.media.map((media, mediaIndex) => {
        if (!mediaRefs.current.has(mediaIndex)) {
          mediaRefs.current.set(mediaIndex, React.createRef<HTMLDivElement>());
        }
        const mediaRef = mediaRefs.current.get(mediaIndex)!;

        return (
          <Fragment key={media.id}>
            {media.kind === 'image' ? (
              <div className="relative w-full overflow-hidden bg-gradient-to-br from-slate-900/50 to-black flex justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="relative flex items-center justify-center w-full bg-black/20 overflow-hidden group/media"
                  style={{
                    maxWidth: 'min(100%, 380px)',
                    ...(media.width && media.height ? { aspectRatio: `${media.width} / ${media.height}` } : {})
                  }}
                >
                  <div ref={mediaRef} className="relative size-full">
                    <Image
                      src={media.url}
                      alt={post.caption || `Imagen de @${post.author.handle}`}
                      width={media.width ?? 1080}
                      height={media.height ?? 1350}
                      className="w-full h-full object-contain transition-transform duration-300"
                      unoptimized={isLocalImage(media.url)}
                      priority={mediaIndex === 0}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 380px, 380px"
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
                </motion.div>
              </div>
            ) : (
              <div className="relative w-full bg-gradient-to-br from-slate-900/50 to-black flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                  className="relative flex items-center justify-center w-full bg-black/20 overflow-hidden"
                  style={{
                    maxWidth: 'min(100%, 380px)',
                    ...(media.width && media.height ? { aspectRatio: `${media.width} / ${media.height}` } : {})
                  }}
                >
                  <video
                    src={media.url}
                    poster={media.thumbnailUrl}
                    controls
                    preload="metadata"
                    className="w-full h-full object-contain"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  />
                  {media.durationMs ? (
                    <div className="absolute bottom-3 right-3 rounded-lg bg-black/90 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white shadow-lg border border-white/20">
                      {formatDuration(media.durationMs)}
                    </div>
                  ) : null}
                </motion.div>
              </div>
            )}
          </Fragment>
        );
      })}
      
      {/* Acciones mejoradas - diseño refinado con responsive */}
      <div className="px-3 md:px-4 py-2.5 md:py-3 border-b border-white/[0.06]">
        <FeedItemActions post={post} />
      </div>

      {/* Estadísticas mejoradas - diseño refinado con responsive */}
      {(post.stats.likes > 0 || post.stats.comments > 0) && (
        <div className="px-3 md:px-4 py-2.5 md:py-2.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 md:gap-5">
            {post.stats.likes > 0 && (
              <Link
                href={`/posts/${post.id}#likes`}
                className="text-xs md:text-sm font-bold text-white hover:text-primary-300 transition-colors duration-200"
              >
                {post.stats.likes.toLocaleString('es')} me gusta{post.stats.likes !== 1 ? 's' : ''}
              </Link>
            )}
            {post.stats.comments > 0 && (
              <Link
                href={`/posts/${post.id}#comments`}
                className="text-xs md:text-sm font-bold text-white hover:text-primary-300 transition-colors duration-200"
              >
                {post.stats.comments.toLocaleString('es')} comentario{post.stats.comments !== 1 ? 's' : ''}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Caption mejorada - diseño refinado con responsive */}
      {post.caption && (
        <div className="px-3 md:px-4 py-2.5 md:py-3">
          <div className="space-y-1 md:space-y-1.5">
            <Link
              href={`/${post.author.handle}`}
              className="font-semibold text-sm md:text-base text-white hover:text-primary-300 transition-colors duration-200 inline-block mr-2"
            >
              {post.author.handle}
            </Link>
            <div className="text-sm md:text-base text-white/90 leading-relaxed whitespace-pre-wrap break-words">
              {renderCaptionWithLinks(post.caption)}
            </div>
          </div>
        </div>
      )}

      {/* Ver comentarios mejorado - diseño refinado con responsive */}
      {post.stats.comments > 0 && (
        <div className="px-3 md:px-4 pb-2.5 md:pb-3 border-b border-white/[0.06]">
          <motion.button
            type="button"
            onClick={() => {
              // Scroll a comentarios si existe
              const commentsSection = document.getElementById('comments');
              if (commentsSection) {
                commentsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="text-xs md:text-sm text-white/60 hover:text-white/80 transition-colors duration-200"
          >
            Ver los {post.stats.comments} comentario{post.stats.comments !== 1 ? 's' : ''}
          </motion.button>
        </div>
      )}

      {/* Comentarios */}
      <div id="comments" className="border-t border-white/[0.06]">
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

