'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef, type ReactElement } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { InfiniteData } from '@tanstack/react-query';

import type { FeedItem, FeedCursorResponse } from '@/services/api/types/feed';
import { likePost, unlikePost, type LikeResponse } from '@/services/api/likes';
import { savePost, unsavePost } from '@/services/api/saves';
import { useSessionStore } from '@/store/session';
import { VerifiedBadge } from '@/components/verified-badge';
import { sharePost, copyPostLink } from '@/lib/share';
import { getAvatarUrl, isLocalImage } from '@/lib/image-utils';

interface ReelPlayerProps {
  readonly reel: FeedItem;
  readonly isActive: boolean;
  readonly onNext: () => void;
  readonly onPrevious: () => void;
}

export function ReelPlayer({ reel, isActive }: ReelPlayerProps): ReactElement {
  const queryClient = useQueryClient();
  const currentUser = useSessionStore((state) => state.user);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Actualización optimista de likes (similar al feed)
  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const feedData = queryClient.getQueryData<InfiniteData<FeedCursorResponse>>(['reels']);
      let currentReel: FeedItem | undefined;
      
      if (feedData) {
        for (const page of feedData.pages) {
          currentReel = page.data.find((item) => item.id === postId);
          if (currentReel) break;
        }
      }
      
      const isCurrentlyLiked = currentReel?.isLikedByViewer ?? reel.isLikedByViewer;
      
      if (isCurrentlyLiked) {
        return await unlikePost(postId);
      } else {
        return await likePost(postId);
      }
    },
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ['reels'] });
      
      const previousReels = queryClient.getQueryData<InfiniteData<FeedCursorResponse>>(['reels']);
      
      let currentReelState: FeedItem | undefined;
      if (previousReels) {
        for (const page of previousReels.pages) {
          currentReelState = page.data.find((item) => item.id === postId);
          if (currentReelState) break;
        }
      }
      
      const isCurrentlyLiked = currentReelState?.isLikedByViewer ?? reel.isLikedByViewer;

      // Actualización optimista
      queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
        { queryKey: ['reels'] },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((item: FeedItem) => {
                if (item.id === postId) {
                  const newLikes = isCurrentlyLiked 
                    ? Math.max(0, item.stats.likes - 1)
                    : item.stats.likes + 1;
                  
                  return {
                    ...item,
                    isLikedByViewer: !isCurrentlyLiked,
                    stats: {
                      ...item.stats,
                      likes: newLikes
                    }
                  };
                }
                return item;
              })
            }))
          };
        }
      );

      return { previousReels };
    },
    onError: (err, postId, context) => {
      if (context?.previousReels) {
        queryClient.setQueryData(['reels'], context.previousReels);
      }
      toast.error('No se pudo actualizar el like');
    },
    onSuccess: (data: LikeResponse, postId: string) => {
      // Confirmar estado con respuesta del servidor
      queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
        { queryKey: ['reels'] },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((item: FeedItem) => {
                if (item.id === postId) {
                  return {
                    ...item,
                    isLikedByViewer: data.liked
                  };
                }
                return item;
              })
            }))
          };
        }
      );
    }
  });

  const saveMutation = useMutation({
    mutationFn: () => (reel.isSavedByViewer ? unsavePost(reel.id) : savePost(reel.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
      toast.success(reel.isSavedByViewer ? 'Eliminado de guardados' : 'Guardado');
    },
    onError: () => {
      toast.error('No se pudo guardar el reel');
    }
  });

  // Controlar reproducción del video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Ignorar errores de autoplay (necesita interacción del usuario)
      });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  // Actualizar progreso del video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isActive) return;

    const updateProgress = (): void => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
    };
  }, [isActive]);

  // Auto-ocultar controles después de 3 segundos
  useEffect(() => {
    if (!isActive) return;

    const resetControlsTimeout = (): void => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    resetControlsTimeout();

    const handleMouseMove = (): void => {
      resetControlsTimeout();
    };

    const handleTouchStart = (): void => {
      resetControlsTimeout();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isActive]);

  const handleLike = (): void => {
    likeMutation.mutate(reel.id);
  };

  const handleSave = (): void => {
    saveMutation.mutate();
  };

  const handleToggleMute = (): void => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const handleTogglePlay = (): void => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleShare = async (): Promise<void> => {
    const shared = await sharePost(reel.id, `Reel de @${reel.author.handle}`);
    if (shared) {
      toast.success('Enlace copiado al portapapeles');
      setShowShareMenu(false);
    } else {
      const copied = await copyPostLink(reel.id);
      if (copied) {
        toast.success('Enlace copiado al portapapeles');
        setShowShareMenu(false);
      } else {
        toast.error('No se pudo copiar el enlace');
      }
    }
  };

  const videoMedia = reel.media.find((m: { kind: string }) => m.kind === 'video');
  if (!videoMedia) {
    return <></>;
  }

  const avatarUrl = getAvatarUrl(reel.author.avatarUrl, reel.author.handle);

  return (
    <div className="relative h-screen w-full bg-black flex items-center justify-center">
      {/* Video con aspect ratio 9:16 vertical - tamaño reducido */}
      <div className="relative w-auto aspect-[9/16] max-w-[260px] md:max-w-[320px] max-h-[70vh] md:max-h-[75vh] bg-black">
      <video
        ref={videoRef}
        src={videoMedia.url}
          className="absolute inset-0 w-full h-full object-cover"
        loop
        playsInline
        muted={isMuted}
          onClick={handleTogglePlay}
        />

        {/* Barra de progreso - diseño refinado */}
        <div className="absolute top-0 left-0 right-0 z-40 h-1.5 bg-black/30 backdrop-blur-sm">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 via-primary-400 to-accent-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
      />
      </div>

      {/* Overlay con información y controles */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex"
          >
        {/* Contenido principal (autor, caption) - diseño refinado */}
            <div className="flex flex-1 flex-col justify-end p-3 md:p-4 pb-14 md:pb-18 pointer-events-auto">
              <Link href={`/${reel.author.handle}`} className="mb-3 md:mb-4 flex items-center gap-2 md:gap-3 group">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className="relative size-11 md:size-13 overflow-hidden rounded-full border-2 border-white/40 ring-1 ring-primary-500/30 transition-all duration-300 group-hover:ring-primary-500/50 group-hover:border-white/60 shadow-lg"
                >
              <Image
                    src={avatarUrl}
                alt={reel.author.displayName}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                    unoptimized={isLocalImage(avatarUrl)}
                    sizes="64px"
              />
                </motion.div>
            <div className="text-white flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-base md:text-lg truncate">@{reel.author.handle}</p>
                {reel.author.isVerified && <VerifiedBadge size="sm" />}
              </div>
              {reel.caption && (
                    <p className="mt-1.5 line-clamp-2 text-sm md:text-base text-white/95 leading-relaxed">{reel.caption}</p>
              )}
            </div>
          </Link>
        </div>

            {/* Controles laterales mejorados - diseño refinado */}
            <div className="flex flex-col items-center justify-end gap-4 md:gap-5 p-3 md:p-4 pb-14 md:pb-18 pointer-events-auto">
              {/* Like con animación */}
              <motion.button
            type="button"
            onClick={handleLike}
            disabled={likeMutation.isPending}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.92 }}
                className="flex flex-col items-center gap-2"
          >
                <motion.div
                  animate={{
                    scale: reel.isLikedByViewer ? [1, 1.3, 1] : 1
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`rounded-full p-3 transition-all duration-300 ${
                    reel.isLikedByViewer 
                      ? 'bg-red-500/35 shadow-lg shadow-red-500/40 backdrop-blur-md border border-red-500/30' 
                      : 'bg-black/50 backdrop-blur-md border border-white/20'
                  }`}
                >
              <svg
                    className={`size-7 md:size-8 transition-all ${
                      reel.isLikedByViewer ? 'fill-red-500 text-red-500' : 'text-white'
                    }`}
                fill={reel.isLikedByViewer ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                      strokeWidth={reel.isLikedByViewer ? 2.5 : 2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
                </motion.div>
                <span className="text-xs md:text-sm font-bold text-white drop-shadow-lg">
                  {reel.stats.likes.toLocaleString('es')}
                </span>
              </motion.button>

          {/* Comentarios */}
              <Link 
                href={`/posts/${reel.id}#comments`}
                className="flex flex-col items-center gap-2"
              >
                <motion.div
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  className="rounded-full bg-black/50 backdrop-blur-md border border-white/20 p-3 transition-all duration-300 hover:border-white/30"
                >
              <svg className="size-7 md:size-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
                </motion.div>
                <span className="text-xs md:text-sm font-bold text-white drop-shadow-lg">
                  {reel.stats.comments.toLocaleString('es')}
                </span>
          </Link>

              {/* Compartir */}
              <div className="relative">
                <motion.button
                  type="button"
                  onClick={() => {
                    setShowShareMenu(!showShareMenu);
                  }}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  className="rounded-full bg-black/50 backdrop-blur-md border border-white/20 p-3 transition-all duration-300 hover:border-white/30"
                >
                  <svg className="size-7 md:size-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342c-.400 0-.816-.039-1.236-.115l-.866-2.322c-.35-.937.062-1.954.938-2.305l2.322-.866c.402-.15.81-.231 1.221-.231.4 0 .816.039 1.236.115l.866 2.322c.35.937-.062 1.954-.938 2.305l-2.322.866c-.402.15-.81.231-1.221.231zM13.342 8.684c.4 0 .816-.039 1.236-.115l.866-2.322c.35-.937-.062-1.954-.938-2.305l-2.322-.866c-.402-.15-.81-.231-1.221-.231-.4 0-.816.039-1.236.115l-.866 2.322c-.35.937.062 1.954.938 2.305l2.322.866c.402.15.81.231 1.221.231zM21.316 13.342c.4 0 .816-.039 1.236-.115l.866-2.322c.35-.937-.062-1.954-.938-2.305l-2.322-.866c-.402-.15-.81-.231-1.221-.231-.4 0-.816.039-1.236.115l-.866 2.322c-.35.937.062 1.954.938 2.305l2.322.866c.402.15.81.231 1.221.231zM16.658 21.316c-.4 0-.816.039-1.236.115l-.866 2.322c-.35.937.062 1.954.938 2.305l2.322.866c.402.15.81.231 1.221.231.4 0 .816-.039 1.236-.115l.866-2.322c.35-.937-.062-1.954-.938-2.305l-2.322-.866c-.402-.15-.81-.231-1.221-.231z"
                    />
                  </svg>
                </motion.button>
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-full right-0 mb-2 rounded-xl bg-black/90 backdrop-blur-xl border border-white/[0.12] p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]"
                    >
          <button
                        type="button"
                        onClick={handleShare}
                        className="flex w-full items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium text-white hover:bg-white/[0.08] transition-all duration-200"
                      >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.684 13.342c-.400 0-.816-.039-1.236-.115l-.866-2.322c-.35-.937.062-1.954.938-2.305l2.322-.866c.402-.15.81-.231 1.221-.231.4 0 .816.039 1.236.115l.866 2.322c.35.937-.062 1.954-.938 2.305l-2.322.866c-.402.15-.81.231-1.221.231z"
                          />
                        </svg>
                        Compartir
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Guardar */}
              <motion.button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.92 }}
                className="flex flex-col items-center gap-2"
          >
                <motion.div
                  animate={{
                    scale: reel.isSavedByViewer ? [1, 1.2, 1] : 1
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`rounded-full p-3 transition-all duration-300 ${
                    reel.isSavedByViewer 
                      ? 'bg-primary-500/35 shadow-lg shadow-primary-500/40 backdrop-blur-md border border-primary-500/30' 
                      : 'bg-black/50 backdrop-blur-md border border-white/20'
                  }`}
                >
              <svg
                    className={`size-7 md:size-8 transition-all ${
                      reel.isSavedByViewer ? 'fill-primary-400 text-primary-400' : 'text-white'
                    }`}
                fill={reel.isSavedByViewer ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                      strokeWidth={reel.isSavedByViewer ? 2.5 : 2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
                </motion.div>
              </motion.button>

          {/* Mute/Unmute */}
              <motion.button
                type="button"
                onClick={handleToggleMute}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.92 }}
                className="rounded-full bg-black/50 backdrop-blur-md border border-white/20 p-3 transition-all duration-300 hover:border-white/30"
              >
            {isMuted ? (
              <svg className="size-7 md:size-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="size-7 md:size-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            )}
              </motion.button>
        </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón de play/pause central - diseño refinado */}
      {!isPlaying && (
        <motion.button
          type="button"
          onClick={handleTogglePlay}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 backdrop-blur-xl p-5 md:p-6 border border-white/30 shadow-lg shadow-black/50"
        >
          <svg className="size-12 md:size-14 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.button>
      )}
      </div>
    </div>
  );
}
