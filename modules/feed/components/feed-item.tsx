'use client';

import { type InfiniteData,useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { MutableRefObject, ReactElement } from 'react';
import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { VerifiedBadge } from '@/components/verified-badge';
import { getAvatarUrl, isLocalImage } from '@/lib/image-utils';
import { fadeUpVariants } from '@/lib/motion-config';
import { copyFrameLink, copyPostLink, shareFrame, sharePost } from '@/lib/share';
import { ReportDialog } from '@/modules/moderation/components/report-dialog';
import { FeedItemActions } from '@/modules/posts/components/feed-item-actions';
import { ShareToStoryDialog } from '@/modules/stories/components/share-to-story-dialog';
import { type Collection, type CollectionsResponse, getCollections } from '@/services/api/collections';
import { type Comment, type CommentCursorResponse, type CommentResourceType, createComment, fetchComments } from '@/services/api/comments';
import { archivePost, deletePost, unarchivePost, updatePost } from '@/services/api/feed';
import { savePost, unsavePost } from '@/services/api/saves';
import type { FeedCursorResponse, FeedItem } from '@/services/api/types/feed';
import { useSessionStore } from '@/store/session';

import { renderCaptionWithLinks } from '../utils/caption-renderer';
import { formatRelativeTime } from '../utils/formatters';
import { ImageTags } from './image-tags';

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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex gap-3 md:gap-4"
      >
        <Link
          href={`/${comment.author?.handle ?? ''}`}
          className="relative block size-9 shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/[0.06]"
        >
          <Image
            src={comment.author?.avatarUrl || `https://api.dicebear.com/7.x/thumbs/svg?seed=${comment.author?.handle || 'user'}`}
            alt={comment.author?.displayName ?? ''}
            fill
            className="object-cover"
            sizes="36px"
          />
        </Link>
        <div className="flex-1 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3.5 md:p-4 shadow-sm backdrop-blur">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <Link
                  href={`/${comment.author?.handle ?? ''}`}
                  className="truncate text-sm font-semibold text-white"
                >
                  {comment.author?.displayName ?? 'Usuario'}
                </Link>
                {comment.author?.isVerified && <VerifiedBadge size="sm" />}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-white/45">
                <Link href={`/${comment.author?.handle ?? ''}`} className="hover:text-primary-200 transition">
                  @{comment.author?.handle ?? ''}
                </Link>
                <span className="opacity-50">•</span>
                <span>{formatRelativeTime(comment.createdAt)}</span>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={() => {
                setShowReportDialog(true);
              }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full border border-white/12 bg-white/[0.05] p-2 text-white/60 transition hover:border-white/25 hover:text-white"
              title="Reportar comentario"
            >
              <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </motion.button>
          </div>
          <p className="text-sm leading-relaxed text-white/85">{comment.content}</p>
        </div>
      </motion.div>
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

const FRAME_FEED_PREVIEW_RATIO = 9 / 16;

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'blob:']);

const getSafeMediaUrl = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return trimmed;
    }

    if (parsed.protocol === 'data:') {
      const lower = trimmed.toLowerCase();
      return lower.startsWith('data:image/') || lower.startsWith('data:video/') ? trimmed : null;
    }

    return null;
  } catch {
    return null;
  }
};

// Función para determinar si un item es un frame
// Un frame es un post que tiene exactamente un media de tipo video con duración <= 60 segundos
const isFrame = (item: FeedItem): boolean => {
  return (
    item.media.length === 1 &&
    item.media[0]?.kind === 'video' &&
    item.media[0]?.durationMs !== undefined &&
    item.media[0].durationMs <= 60000
  );
};

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
  const [commentsCount, setCommentsCount] = useState(item.stats.comments);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const [videoRatios, setVideoRatios] = useState<Record<string, number>>({});
  const [frameVideoReady, setFrameVideoReady] = useState<Record<string, boolean>>({});
  const mediaContainerRefs = useRef<Record<string, MutableRefObject<HTMLDivElement | null>>>({});

  const getMediaContainerRef = useCallback((mediaId: string): MutableRefObject<HTMLDivElement | null> => {
    let ref = mediaContainerRefs.current[mediaId];
    if (!ref) {
      ref = { current: null };
      mediaContainerRefs.current[mediaId] = ref;
    }
    return ref;
  }, []);

  const archiveMutation = useMutation({
    mutationFn: () => archivePost(item.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
      void queryClient.invalidateQueries({ queryKey: ['feed', 'archived'] });
      void queryClient.invalidateQueries({ queryKey: ['userPosts', item.author.handle] });
      void queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setShowOptionsMenu(false);
      toast.success('Publicación archivada');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'No se pudo archivar la publicación');
    }
  });

  const unarchiveMutation = useMutation({
    mutationFn: () => unarchivePost(item.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feed', 'archived'] });
      void queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
      void queryClient.invalidateQueries({ queryKey: ['userPosts', item.author.handle] });
      void queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setShowOptionsMenu(false);
      toast.success('Publicación desarchivada');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'No se pudo desarchivar la publicación');
    }
  });

  const saveMutation = useMutation({
    mutationFn: (collectionId?: string) => (item.isSavedByViewer ? unsavePost(item.id) : savePost(item.id, collectionId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
      void queryClient.invalidateQueries({ queryKey: ['saved'] });
      setShowSaveDialog(false);
      toast.success(item.isSavedByViewer ? 'Post desguardado' : 'Post guardado');
    },
    onError: () => {
      toast.error('No se pudo actualizar el guardado');
    }
  });

  const isFrameItem = useMemo(() => isFrame(item), [item]);
  const commentResourceType: CommentResourceType = isFrameItem ? 'frame' : 'post';
  const commentsQueryKey = isFrameItem ? (['frame-comments', item.id] as const) : (['comments', item.id] as const);

  const commentsQuery = useQuery({
    queryKey: commentsQueryKey,
    queryFn: () => fetchComments(item.id, undefined, 20, commentResourceType),
    enabled: showComments
  });

  const commentsList = commentsQuery.data?.data ?? [];

  const createCommentMutation = useMutation({
    mutationFn: (content: string) => createComment(item.id, { content }, commentResourceType),
    onSuccess: (response) => {
      queryClient.setQueryData<CommentCursorResponse | undefined>(commentsQueryKey, (previous) => {
        if (!previous) {
          return {
            data: [response.comment],
            nextCursor: null
          };
        }

        const exists = previous.data.some((entry) => entry.id === response.comment.id);
        const updatedData = exists ? previous.data : [response.comment, ...previous.data];

        return {
          ...previous,
          data: updatedData.slice(0, 20)
        };
      });
      void queryClient.invalidateQueries({ queryKey: commentsQueryKey });
      void queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
      if (isFrameItem) {
        void queryClient.invalidateQueries({ queryKey: ['frames'] });
        void queryClient.invalidateQueries({ queryKey: ['frame', item.id] });
      } else {
        void queryClient.invalidateQueries({ queryKey: ['post', item.id] });
      }
      setCommentsCount((prev) => prev + (response.comment.parentId ? 0 : 1));
      setCommentText('');
      setShowComments(true);
      toast.success('Comentario publicado');
    },
    onError: () => {
      toast.error('No se pudo publicar el comentario');
    }
  });

  useEffect(() => {
    setCommentsCount(item.stats.comments);
  }, [item.stats.comments]);

  const handleSave = useCallback((): void => {
    if (item.isSavedByViewer) {
      // Si ya está guardado, desguardar directamente (no necesita collectionId)
      saveMutation.mutate(undefined);
    } else {
      // Si no está guardado, mostrar selector de colecciones
      setShowSaveDialog(true);
    }
  }, [item.isSavedByViewer, saveMutation]);

  const detailHref = useMemo(() => (isFrameItem ? `/frames/${item.id}` : `/posts/${item.id}`), [isFrameItem, item.id]);

  const handleShare = useCallback(async (): Promise<void> => {
    const shared = await (isFrameItem
      ? shareFrame(item.id, `Frame de @${item.author.handle}`)
      : sharePost(item.id, `Publicación de @${item.author.handle}`));
    if (shared) {
      toast.success('Enlace copiado al portapapeles');
    } else {
      // Si falla sharePost, intentar copiar directamente
      const copied = await (isFrameItem ? copyFrameLink(item.id) : copyPostLink(item.id));
      if (copied) {
        toast.success('Enlace copiado al portapapeles');
      } else {
        toast.error('No se pudo copiar el enlace');
      }
    }
  }, [isFrameItem, item.id, item.author.handle]);

  const handleVideoMetadata = useCallback(
    (mediaId: string) => (event: React.SyntheticEvent<HTMLVideoElement>): void => {
      if (isFrameItem) {
        return;
      }

      const video = event.currentTarget;
      if (video.videoWidth && video.videoHeight) {
        setVideoRatios((prev) => {
          const nextRatio = video.videoWidth / video.videoHeight;
          if (prev[mediaId] && Math.abs(prev[mediaId] - nextRatio) < 0.0001) {
            return prev;
          }
          return { ...prev, [mediaId]: nextRatio };
        });
      }
    },
    [isFrameItem]
  );

  const handleSubmitComment = useCallback((e: React.FormEvent): void => {
    e.preventDefault();
    if (commentText.trim().length === 0) {
      return;
    }
    createCommentMutation.mutate(commentText.trim());
  }, [commentText, createCommentMutation]);

  // Intersection Observer para lazy loading - Optimizado con throttling
  useEffect(() => {
    const target = containerRef.current;
    if (!target) {
      return;
    }

    let rafId: number | null = null;
    let lastIntersection = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        // Throttle usando requestAnimationFrame para evitar re-renders excesivos
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }

        rafId = requestAnimationFrame(() => {
          const isIntersecting = entry.isIntersecting;
          
          // Solo actualizar si cambió el estado de intersección
          if (isIntersecting !== lastIntersection && isIntersecting) {
            setIsInView(true);
            lastIntersection = true;
            
            // Desconectar después de que se vea por primera vez
            if (containerRef.current) {
              observer.unobserve(containerRef.current);
            }
          }
        });
      },
      {
        rootMargin: '200px', // Cargar antes de que sea visible
        threshold: 0.1
      }
    );

    observer.observe(target);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <motion.article
      ref={containerRef}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="group relative overflow-hidden glass-card border border-border/60 mb-6 last:mb-0 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-border-strong hover:shadow-[0_8px_32px_rgba(139,92,246,0.12)]"
    >
      {/* Header mejorado - diseño refinado con responsive */}
      <header className="flex items-center justify-between gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 border-b border-border/60">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <Link 
            href={`/${item.author.handle}`}
            className="relative shrink-0 group/avatar transition-all duration-300"
          >
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary-500/40 via-accent-500/30 to-primary-500/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 blur-lg" />
            <div className="relative size-9 md:size-10 rounded-full ring-1 ring-border/50 group-hover/avatar:ring-primary-500/30 transition-all duration-300 overflow-hidden bg-gradient-to-br from-surface-strong/80 via-surface/85 to-surface-strong/80 dark:from-slate-800/90 dark:via-slate-900/90 dark:to-slate-900/90 backdrop-blur-sm">
            <Image
              src={item.author.avatarUrl || `https://api.dicebear.com/7.x/thumbs/svg?seed=${item.author.handle}`}
                alt={item.author.displayName || item.author.handle}
                  fill
                  className="object-cover transition-transform duration-300 group-hover/avatar:scale-110"
                unoptimized={isLocalImage(item.author.avatarUrl || '')}
                loading="lazy"
                sizes="(max-width: 768px) 36px, 40px"
            />
            </div>
          </Link>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
              <Link 
                href={`/${item.author.handle}`} 
                className="font-semibold text-sm md:text-base text-foreground hover:text-primary-300 transition-colors duration-200 truncate"
                title={item.author.displayName || item.author.handle}
              >
                {item.author.displayName || item.author.handle}
              </Link>
              {item.author.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <div className="flex items-center gap-1 md:gap-1.5 flex-wrap">
              <Link
                href={`/${item.author.handle}`}
                className="text-xs text-foreground-muted hover:text-foreground transition-colors duration-200 truncate font-medium"
                title={`@${item.author.handle}`}
              >
                @{item.author.handle}
              </Link>
              <span className="text-[10px] md:text-xs text-foreground-muted/80">•</span>
              <span className="text-xs text-foreground-muted hover:text-foreground transition-colors duration-200">
                <Link
                  href={detailHref}
                  className="text-xs text-foreground-muted hover:text-foreground transition-colors duration-200"
                >
                  {formatRelativeTime(item.createdAt)}
                </Link>
              </span>
            </div>
          </div>
        </div>
        <div className="relative shrink-0">
          <motion.button
            type="button"
            onClick={() => {
              if (isAuthor) {
                setShowOptionsMenu(!showOptionsMenu);
              } else {
                setShowReportDialog(true);
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl p-2.5 text-foreground-muted transition-all duration-300 hover:bg-surface-muted hover:text-foreground active:scale-95"
            title={isAuthor ? 'Opciones del post' : 'Reportar'}
          >
            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </motion.button>
          {showOptionsMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => {
                  setShowOptionsMenu(false);
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl glass-card border border-border/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl overflow-hidden"
              >
                {/* Opción: Compartir en story (disponible para todos) */}
                {!isAuthor && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowShareToStoryDialog(true);
                      setShowOptionsMenu(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-foreground transition-all duration-300 hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-transparent active:bg-surface-muted"
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
                <button
                  type="button"
                  onClick={() => {
                    void handleShare();
                    setShowOptionsMenu(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-foreground transition-all duration-300 hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-transparent active:bg-surface-muted"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 8a3 3 0 11-6 0 3 3 0 016 0zm-9 9a6 6 0 0112 0v1H6v-1z"
                    />
                  </svg>
                  Copiar enlace
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSave();
                    setShowOptionsMenu(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-foreground transition-all duration-300 hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-transparent active:bg-surface-muted"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  {item.isSavedByViewer ? 'Gestionar colecciones' : 'Guardar en colección'}
                </button>

                {/* Opciones del autor */}
                {isAuthor && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditDialog(true);
                        setShowOptionsMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-foreground transition-all duration-300 hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-transparent active:bg-surface-muted"
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
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-foreground transition-all duration-300 hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-transparent disabled:opacity-50"
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
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-foreground transition-all duration-300 hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-transparent disabled:opacity-50"
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
              </motion.div>
            </>
          )}
        </div>
      </header>

      {/* Media mejorado - más compacto */}
      {item.media.map((media, mediaIndex) => {
        const isVideo = media.kind === 'video';
        const isFrameMedia = isVideo && isFrameItem;
        const ratioFromState = isFrameMedia ? undefined : videoRatios[media.id];
        const hasDimensions = !isFrameMedia && Boolean(media.width && media.height);
        const resolvedAspectRatio = ratioFromState
          ? ratioFromState
          : hasDimensions
            ? media.width! / media.height!
            : isFrameMedia
              ? FRAME_FEED_PREVIEW_RATIO
              : 4 / 5;
        const videoObjectFit = isFrameMedia ? 'object-cover' : 'object-contain';
        const wrapperClassName = `block w-full group/media relative ${
          isFrameMedia ? 'overflow-hidden bg-black' : ''
        }`;
        const isFrameReady = frameVideoReady[media.id] ?? false;
        const mediaContainerRef = getMediaContainerRef(media.id);

        const safePosterUrl = !isFrameMedia ? getSafeMediaUrl(media.thumbnailUrl) : null;
        const videoPosterProps = safePosterUrl ? { poster: safePosterUrl } : {};

        return (
        <Link key={media.id} href={detailHref} className={wrapperClassName}>
            <Fragment>
            {media.kind === 'image' ? (
              <div 
                className="relative w-full overflow-hidden"
                style={{
                  aspectRatio: '4 / 5'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                <motion.div
                  ref={mediaContainerRef}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="relative w-full h-full overflow-hidden flex items-center justify-center"
                >
                <Image
                  src={media.url}
                    alt={item.caption || `Imagen de @${item.author.handle}`}
                  width={media.width ?? 1080}
                  height={media.height ?? 1350}
                    className="w-full h-full object-contain transition-transform duration-300"
                  unoptimized={isLocalImage(media.url)}
                    priority={mediaIndex === 0 && isInView}
                    loading={mediaIndex === 0 ? undefined : 'lazy'}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 100vw"
                    />
                  {media.tags && media.tags.length > 0 ? (
                    <ImageTags
                      tags={media.tags}
                      imageWidth={media.width ?? 1080}
                      imageHeight={media.height ?? 1350}
                      containerRef={mediaContainerRef}
                    />
                  ) : null}
                </motion.div>
                </div>
              ) : (
              <div
                className={`relative w-full overflow-hidden ${
                  isFrameMedia ? 'mx-auto max-w-[340px] sm:max-w-[380px] lg:max-w-[420px]' : ''
                }`}
                style={{
                  aspectRatio: resolvedAspectRatio,
                  maxHeight: isFrameMedia ? 'min(72vh, 520px)' : undefined
                }}
              >
                {isFrameMedia ? null : (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                )}
                <motion.div
                  ref={mediaContainerRef}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                  className={`relative w-full h-full overflow-hidden flex items-center justify-center ${
                    isFrameMedia
                      ? 'bg-black max-h-[480px] sm:max-h-[520px] md:max-h-[540px]'
                      : 'bg-surface-strong dark:bg-black'
                  }`}
                >
                  <video
                    src={media.url}
                    {...videoPosterProps}
                    controls={!isFrameMedia}
                    preload="metadata"
                    className={`block w-full h-full ${videoObjectFit} ${isFrameMedia ? 'pointer-events-none' : ''}`}
                    onLoadedMetadata={handleVideoMetadata(media.id)}
                    onLoadedData={() => {
                      if (isFrameMedia) {
                        setFrameVideoReady((prev) => ({ ...prev, [media.id]: true }));
                      }
                    }}
                  />
                  {isFrameMedia && !isFrameReady ? (
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black">
                      <span className="size-6 animate-spin rounded-full border-2 border-white/30 border-t-transparent" />
                    </div>
                  ) : null}
                  {media.durationMs ? (
                    <div className="absolute bottom-3 right-3 rounded-lg bg-overlay/80 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white shadow-lg border border-border-strong/60">
                      {formatDuration(media.durationMs)}
                    </div>
                  ) : null}
                </motion.div>
                </div>
              )}
            </Fragment>
          </Link>
        );
      })}
      
      {/* Acciones mejoradas - diseño refinado con responsive */}
      <div className="px-3 md:px-4 py-2.5 md:py-3 border-b border-border/60">
        <FeedItemActions post={item} />
      </div>

      {/* Estadísticas mejoradas - diseño refinado con responsive */}
      {(item.stats.likes > 0 || commentsCount > 0) && (
        <div className="px-3 md:px-4 py-2.5 md:py-2.5 border-b border-border/60">
          <div className="flex items-center gap-3 md:gap-5">
            {item.stats.likes > 0 && (
              <Link
                href={`${detailHref}#likes`}
                className="text-xs md:text-sm font-bold text-foreground hover:text-primary-300 transition-colors duration-200"
              >
                {item.stats.likes.toLocaleString('es')} me gusta{item.stats.likes !== 1 ? 's' : ''}
          </Link>
            )}
            {commentsCount > 0 && (
              <Link
                href={`${detailHref}#comments`}
                className="text-xs md:text-sm font-bold text-foreground hover:text-primary-300 transition-colors duration-200"
              >
                {commentsCount.toLocaleString('es')} comentario{commentsCount !== 1 ? 's' : ''}
              </Link>
            )}
        </div>
        </div>
      )}

      {/* Caption mejorada - diseño refinado con responsive */}
      {item.caption && (
        <div className="px-3 md:px-4 py-2.5 md:py-3">
          <div className="space-y-1 md:space-y-1.5">
            <Link
              href={`/${item.author.handle}`}
              className="font-semibold text-sm md:text-base text-foreground hover:text-primary-300 transition-colors duration-200 inline-block mr-2"
            >
              {item.author.handle}
          </Link>
            <div className="text-sm md:text-base text-foreground leading-relaxed whitespace-pre-wrap break-words">
              {renderCaptionWithLinks(item.caption)}
        </div>
          </div>
        </div>
      )}

      {/* Ver comentarios mejorado - diseño refinado con responsive */}
      {commentsCount > 0 && (
        <div className="px-3 md:px-4 pb-2.5 md:pb-3 border-b border-border/60">
          <motion.button
            type="button"
            onClick={() => {
              setShowComments(!showComments);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-xs md:text-sm font-semibold text-foreground hover:text-primary-400 transition-colors duration-200"
          >
            {showComments ? 'Ocultar' : 'Ver'} todos los comentarios ({commentsCount.toLocaleString('es')})
          </motion.button>
        </div>
      )}

      {/* Formulario de comentario - siempre visible */}
      <div className="px-3 md:px-4 py-3 md:py-4 border-b border-border/60">
          <form onSubmit={handleSubmitComment} className="flex gap-2 md:gap-3 items-start">
            <motion.div 
              className="relative shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <div className="relative size-7 md:size-8 rounded-full ring-1 ring-border/50 overflow-hidden bg-gradient-to-br from-surface-strong/80 via-surface/85 to-surface-strong/80 dark:from-slate-800/90 dark:via-slate-900/90 dark:to-slate-900/90 backdrop-blur-sm group-hover:ring-primary-500/30 transition-all duration-300">
                {currentUser?.avatarUrl ? (
                  <Image
                    key={currentUser.avatarUrl}
                    src={getAvatarUrl(currentUser.avatarUrl, currentUser.handle)}
                    alt={currentUser.displayName}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 28px, 32px"
                    unoptimized={isLocalImage(currentUser.avatarUrl)}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <span className="text-xs font-bold text-primary-400">
                      {currentUser?.displayName?.charAt(0).toUpperCase() ?? 'U'}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
            <div className="flex-1 space-y-2">
              <textarea
              value={commentText}
              onChange={(e) => {
                setCommentText(e.target.value);
              }}
              placeholder="Añade un comentario..."
              maxLength={2200}
                rows={commentText.length > 80 ? 3 : 1}
                className="w-full resize-none rounded-xl border border-border bg-surface px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-foreground placeholder:text-foreground-muted transition-all duration-200 focus:border-primary-500/60 focus:bg-surface-strong focus:outline-none focus:ring-2 focus:ring-primary-500/30 backdrop-blur-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (commentText.trim().length > 0 && !createCommentMutation.isPending) {
                      handleSubmitComment(e as unknown as React.FormEvent);
                    }
                  }
                }}
              />
              {commentText.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground-muted">
                    {commentText.length}/2200
                  </span>
                  <motion.button
              type="submit"
              disabled={createCommentMutation.isPending || commentText.trim().length === 0}
                    whileHover={{ scale: commentText.trim().length === 0 ? 1 : 1.05, y: -1 }}
                    whileTap={{ scale: commentText.trim().length === 0 ? 1 : 0.95 }}
                    className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
            >
                    {createCommentMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="size-3 animate-spin rounded-full border-2 border-foreground border-t-transparent dark:border-white" />
                        Publicando...
                      </span>
                    ) : (
                      'Publicar'
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </form>
      </div>

      {/* Lista de comentarios - solo visible cuando showComments es true */}
      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="px-3 md:px-4 pb-3 md:pb-4 pt-2.5 md:pt-3 space-y-2.5 md:space-y-3 bg-gradient-to-b from-slate-50/50 dark:from-white/[0.03] to-transparent"
        >
          {/* Lista de comentarios */}
          {commentsQuery.isLoading ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-8 flex flex-col items-center gap-3"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-primary-500/20 blur-xl animate-pulse" />
                <div className="relative size-8 animate-spin rounded-full border-2 border-primary-500/30 border-t-primary-500" />
              </div>
              <p className="text-sm text-foreground-muted font-medium">Cargando comentarios...</p>
            </motion.div>
          ) : commentsList.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center"
            >
              <p className="text-sm text-foreground-muted">No hay comentarios aún</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
              className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
              {commentsList.map((comment: Comment, index: number) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <CommentWithReport comment={comment} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
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
      <AnimatePresence>
        {showEditDialog && (
          <EditPostDialog
            postId={item.id}
            currentCaption={item.caption}
            onClose={() => {
              setShowEditDialog(false);
            }}
            onSuccess={() => {
              setShowEditDialog(false);
              void queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
              void queryClient.invalidateQueries({ queryKey: ['post', item.id] });
              void queryClient.invalidateQueries({ queryKey: ['analytics'] });
            }}
          />
        )}
      </AnimatePresence>

      {/* Confirmación de eliminación */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <DeletePostDialog
            postId={item.id}
            authorHandle={item.author.handle}
            onClose={() => {
              setShowDeleteConfirm(false);
            }}
            onSuccess={() => {
              setShowDeleteConfirm(false);
              // El DeletePostDialog ya maneja todas las invalidaciones y actualizaciones del cache
            }}
          />
        )}
      </AnimatePresence>

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

  const { data, isLoading } = useQuery<CollectionsResponse>({
    queryKey: ['collections'],
    queryFn: getCollections
  });

  const collections: Collection[] = data?.collections ?? [];
  const defaultCollection = collections.find((c) => c.id === 'default');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-strong p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-foreground">Guardar en colección</h2>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-foreground-muted">Cargando colecciones...</div>
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
                  : 'border-border bg-surface hover:border-border-strong'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700">
                  <svg className="size-6 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{defaultCollection?.name ?? 'Guardados'}</h3>
                  <p className="text-xs text-foreground-muted">{defaultCollection?.postCount ?? 0} posts</p>
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
                      : 'border-border bg-surface hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {collection.coverImageUrl ? (
                      <div className="relative size-12 overflow-hidden rounded-lg">
                        <Image src={collection.coverImageUrl} alt={collection.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="flex size-12 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700">
                        <svg className="size-6 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <h3 className="font-semibold text-foreground">{collection.name}</h3>
                      <p className="text-xs text-foreground-muted">{collection.postCount} posts</p>
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
            className="rounded-xl border border-border bg-transparent px-6 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted"
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
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (payload: { caption: string }) => updatePost(postId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
      void queryClient.invalidateQueries({ queryKey: ['post', postId] });
      void queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Publicación actualizada');
      onSuccess();
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'No se pudo actualizar la publicación');
    }
  });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (caption.trim() === currentCaption.trim()) {
      onClose();
      return;
    }
    updateMutation.mutate({ caption: caption.trim() });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay/80 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="w-full max-w-lg rounded-3xl glass-card border border-border/60 p-6 md:p-8 shadow-elegant-lg"
      >
        <h2 className="mb-6 text-2xl font-bold text-gradient-primary">Editar publicación</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <textarea
              value={caption}
              onChange={(e) => {
                setCaption(e.target.value);
              }}
              maxLength={2200}
              rows={6}
              className="w-full rounded-xl border border-border/60 bg-surface px-4 py-3 text-base text-foreground placeholder:text-foreground-muted transition-all duration-200 focus:border-primary-400 focus:bg-surface-strong focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 dark:focus:bg-white/10"
              placeholder="Escribe un pie de foto..."
              autoFocus
            />
            <div className="mt-2 flex justify-end">
              <span className={`text-xs ${caption.length > 2100 ? 'text-red-500 dark:text-red-400' : 'text-foreground-muted dark:text-white/50'}`}>
                {caption.length} / 2200
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <motion.button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl border border-border/60 bg-surface px-6 py-2.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-surface-strong hover:border-border-strong disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:border-white/20"
            >
              Cancelar
            </motion.button>
            <motion.button
              type="submit"
              disabled={updateMutation.isPending || caption.trim() === currentCaption.trim()}
              whileHover={{ scale: updateMutation.isPending ? 1 : 1.05 }}
              whileTap={{ scale: updateMutation.isPending ? 1 : 0.95 }}
              className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="size-3 animate-spin rounded-full border-2 border-foreground border-t-transparent dark:border-white" />
                  Guardando...
                </span>
              ) : (
                'Guardar'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

interface DeletePostDialogProps {
  readonly postId: string;
  readonly authorHandle: string;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

function DeletePostDialog({ postId, authorHandle, onClose, onSuccess }: DeletePostDialogProps): ReactElement {
  const queryClient = useQueryClient();

  // Función helper para remover un post de todas las queries InfiniteData
  const removePostFromInfiniteQueries = (postIdToRemove: string): void => {
    // Remover del feed principal - usar InfiniteData<FeedCursorResponse>
    // Usar predicate para cubrir todas las variaciones de la queryKey (con/sin cursor)
    queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
      { 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === 'feed' && key[1] === 'home';
        }
      },
      (old) => {
        if (!old) return old;
        const filteredPages = old.pages.map((page) => ({
          ...page,
          data: page.data.filter((item) => item.id !== postIdToRemove)
        }));
        
        // Si todas las páginas quedan vacías, devolver el estado original
        // para evitar problemas con la estructura de InfiniteData
        if (filteredPages.every(page => page.data.length === 0)) {
          return old;
        }
        
        return {
          ...old,
          pages: filteredPages
        };
      }
    );

    // Remover del explore - usar predicate para todas las variaciones
    queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
      { 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === 'feed' && key[1] === 'explore';
        }
      },
      (old) => {
        if (!old) return old;
        const filteredPages = old.pages.map((page) => ({
          ...page,
          data: page.data.filter((item) => item.id !== postIdToRemove)
        }));
        
        if (filteredPages.every(page => page.data.length === 0)) {
          return old;
        }
        
        return {
          ...old,
          pages: filteredPages
        };
      }
    );

    // Remover de frames - usar predicate para todas las variaciones
    queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
      { 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === 'frames';
        }
      },
      (old) => {
        if (!old) return old;
        const filteredPages = old.pages.map((page) => ({
          ...page,
          data: page.data.filter((item) => item.id !== postIdToRemove)
        }));
        
        if (filteredPages.every(page => page.data.length === 0)) {
          return old;
        }
        
        return {
          ...old,
          pages: filteredPages
        };
      }
    );

    // Remover de userPosts - usar predicate para todas las variaciones
    queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
      { 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === 'userPosts' && key[1] === authorHandle;
        }
      },
      (old) => {
        if (!old) return old;
        const filteredPages = old.pages.map((page) => ({
          ...page,
          data: page.data.filter((item) => item.id !== postIdToRemove)
        }));
        
        if (filteredPages.every(page => page.data.length === 0)) {
          return old;
        }
        
        return {
          ...old,
          pages: filteredPages
        };
      }
    );
  };

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onMutate: async () => {
      // Cancelar queries en progreso para evitar conflictos - usar predicate para todas las variaciones
      await queryClient.cancelQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && (
            (key[0] === 'feed' && key[1] === 'home') ||
            (key[0] === 'feed' && key[1] === 'explore') ||
            key[0] === 'frames' ||
            (key[0] === 'userPosts' && key[1] === authorHandle)
          );
        }
      });
      
      // Guardar snapshots de todas las variaciones de queries para rollback
      const allQueries = queryClient.getQueryCache().getAll();
      const feedQueries = allQueries.filter(q => {
        const key = q.queryKey;
        return Array.isArray(key) && key[0] === 'feed' && key[1] === 'home';
      });
      const exploreQueries = allQueries.filter(q => {
        const key = q.queryKey;
        return Array.isArray(key) && key[0] === 'feed' && key[1] === 'explore';
      });
      const framesQueries = allQueries.filter(q => {
        const key = q.queryKey;
        return Array.isArray(key) && key[0] === 'frames';
      });
      const userPostsQueries = allQueries.filter(q => {
        const key = q.queryKey;
        return Array.isArray(key) && key[0] === 'userPosts' && key[1] === authorHandle;
      });
      
      const previousQueries = {
        feed: feedQueries.map(q => ({ key: q.queryKey, data: q.state.data })),
        explore: exploreQueries.map(q => ({ key: q.queryKey, data: q.state.data })),
        frames: framesQueries.map(q => ({ key: q.queryKey, data: q.state.data })),
        userPosts: userPostsQueries.map(q => ({ key: q.queryKey, data: q.state.data }))
      };
      
      // Remover optimísticamente del cache ANTES de la mutación
      removePostFromInfiniteQueries(postId);
      
      return previousQueries;
    },
    onError: (_error, _variables, context) => {
      // Rollback en caso de error - restaurar todas las queries guardadas
      if (context) {
        context.feed.forEach(({ key, data }) => {
          queryClient.setQueryData(key, data);
        });
        context.explore.forEach(({ key, data }) => {
          queryClient.setQueryData(key, data);
        });
        context.frames.forEach(({ key, data }) => {
          queryClient.setQueryData(key, data);
        });
        context.userPosts.forEach(({ key, data }) => {
          queryClient.setQueryData(key, data);
        });
      }
      
      const axiosError = _error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'No se pudo eliminar la publicación');
    },
    onSuccess: () => {
      // Invalidar queries en segundo plano (sin refetch inmediato) para asegurar sincronización
      // Usar predicate para cubrir todas las variaciones de queryKey (con/sin cursor)
      void queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === 'feed' && key[1] === 'home';
        },
        refetchType: 'none'
      });
      void queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === 'feed' && key[1] === 'explore';
        },
        refetchType: 'none'
      });
      void queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === 'frames';
        },
        refetchType: 'none'
      });
      void queryClient.invalidateQueries({ queryKey: ['post', postId] });
      void queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === 'userPosts' && key[1] === authorHandle;
        },
        refetchType: 'none'
      });
      void queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Publicación eliminada');
      onSuccess();
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay/80 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="w-full max-w-md rounded-3xl glass-card border border-red-500/20 bg-red-500/5 p-6 md:p-8 shadow-elegant-lg"
      >
        <div className="mb-6 flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-500/20 border border-red-500/30">
            <svg className="size-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Eliminar publicación</h2>
            <p className="mt-1 text-sm text-white/60">Esta acción no se puede deshacer.</p>
          </div>
        </div>
        <p className="mb-6 text-base text-white/80">¿Estás seguro de que quieres eliminar esta publicación? Todos los comentarios, likes y datos relacionados también se eliminarán.</p>
        <div className="flex justify-end gap-3">
          <motion.button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl border border-border/60 bg-surface px-6 py-2.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-surface-strong hover:border-border-strong disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:border-white/20"
          >
            Cancelar
          </motion.button>
          <motion.button
            type="button"
            onClick={() => {
              deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
            whileHover={{ scale: deleteMutation.isPending ? 1 : 1.05 }}
            whileTap={{ scale: deleteMutation.isPending ? 1 : 0.95 }}
            className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition-all duration-300 hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleteMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="size-3 animate-spin rounded-full border-2 border-foreground border-t-transparent dark:border-white" />
                Eliminando...
              </span>
            ) : (
              'Eliminar'
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
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

