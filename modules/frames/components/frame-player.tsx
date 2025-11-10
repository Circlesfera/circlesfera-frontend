'use client';

import { MusicalNoteIcon } from '@heroicons/react/24/outline';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { type ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { VerifiedBadge } from '@/components/verified-badge';
import { getAvatarUrl, isLocalImage } from '@/lib/image-utils';
import { copyFrameLink, copyPostLink, shareFrame, sharePost } from '@/lib/share';
import { getSafeMediaUrl } from '@/modules/frames/utils/media';
import { likeFrame, likePost, unlikeFrame, unlikePost } from '@/services/api/likes';
import { saveFrame, savePost, unsaveFrame, unsavePost } from '@/services/api/saves';
import type { FeedCursorResponse, FeedItem } from '@/services/api/types/feed';

interface FramePlayerProps {
  readonly frame: FeedItem;
  readonly isActive: boolean;
  readonly onNext?: () => void;
  readonly onPrevious?: () => void;
  readonly canGoNext?: boolean;
  readonly canGoPrevious?: boolean;
  readonly source?: 'frame' | 'post';
  readonly variant?: 'standalone' | 'embedded';
}

const CONTROLS_HIDE_DELAY = 3000; // ms para auto-ocultar controles
const MUTED_HINT_DURATION = 2200; // ms para mostrar indicador de mute

export function FramePlayer({
  frame,
  isActive,
  onNext,
  onPrevious,
  canGoNext = true,
  canGoPrevious = true,
  source = 'frame',
  variant = 'standalone'
}: FramePlayerProps): ReactElement {
  const queryClient = useQueryClient();
  const isFrameSource = source === 'frame';
  
  const currentFrame = frame;

  const primaryMedia = currentFrame.media[0] ?? null;
  const videoMedia = useMemo(
    () => currentFrame.media.find((media) => media.kind === 'video') ?? null,
    [currentFrame.media]
  );
  const safeVideoUrl = useMemo(
    () => (videoMedia ? getSafeMediaUrl(videoMedia.url, { allowDataUrls: true }) : null),
    [videoMedia]
  );
  const hasPlayableVideo = Boolean(primaryMedia && videoMedia && safeVideoUrl);
  const avatarUrl = useMemo(
    () => getAvatarUrl(currentFrame.author.avatarUrl, currentFrame.author.handle),
    [currentFrame.author.avatarUrl, currentFrame.author.handle]
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const muteHintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showMutedHint, setShowMutedHint] = useState(false);

  useEffect(() => {
    setIsVideoLoaded(false);
    setVideoError(null);
    setShowMutedHint(false);
    if (muteHintTimeoutRef.current) {
      clearTimeout(muteHintTimeoutRef.current);
      muteHintTimeoutRef.current = null;
    }
  }, [currentFrame.id]);

  useEffect(() => {
    if (!hasPlayableVideo) {
      setIsVideoLoaded(true);
      setVideoError('No se pudo cargar el recurso del frame.');
      return;
    }

    setVideoError(null);
  }, [hasPlayableVideo, safeVideoUrl]);

  useEffect(() => {
    if (!hasPlayableVideo) {
      return;
    }

    if (isMuted && isVideoLoaded && !videoError) {
      setShowMutedHint(true);
      if (muteHintTimeoutRef.current) {
        clearTimeout(muteHintTimeoutRef.current);
      }
      muteHintTimeoutRef.current = setTimeout(() => {
        setShowMutedHint(false);
      }, MUTED_HINT_DURATION);
    }

    return () => {
      if (muteHintTimeoutRef.current) {
        clearTimeout(muteHintTimeoutRef.current);
        muteHintTimeoutRef.current = null;
      }
    };
  }, [hasPlayableVideo, isMuted, isVideoLoaded, videoError]);

  const likeMutation = useMutation({
    mutationFn: async ({ postId, isCurrentlyLiked }: { postId: string; isCurrentlyLiked: boolean }) => {
      // Ejecutar la acción correspondiente basada en el estado que se pasó desde onMutate
      if (isFrameSource) {
        return isCurrentlyLiked ? await unlikeFrame(postId) : await likeFrame(postId);
      }

      return isCurrentlyLiked ? await unlikePost(postId) : await likePost(postId);
    },
    onMutate: async ({ postId, isCurrentlyLiked }: { postId: string; isCurrentlyLiked: boolean }) => {
      // Cancelar cualquier query en progreso para evitar sobrescribir nuestro update optimista
      await queryClient.cancelQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return (
            (Array.isArray(key) && isFrameSource && key[0] === 'frames') ||
            (Array.isArray(key) && isFrameSource && key[0] === 'frame' && key[1] === postId) ||
            (Array.isArray(key) && key[0] === 'feed' && key[1] === 'home') ||
            (Array.isArray(key) && key[0] === 'feed' && key[1] === 'explore') ||
            (Array.isArray(key) && key[0] === 'userPosts')
          );
        }
      });

      // Snapshot del valor anterior
      const previousFrames = isFrameSource
        ? queryClient.getQueryData<InfiniteData<FeedCursorResponse>>(['frames'])
        : undefined;
      const previousFeed = queryClient.getQueryData<InfiniteData<FeedCursorResponse>>(['feed', 'home']);
      const previousFrameEntry = isFrameSource
        ? queryClient.getQueryData<{ frame: FeedItem }>(['frame', postId])
        : undefined;
      const previousPost = queryClient.getQueryData<{ post: FeedItem }>(['post', postId]);

      // Actualizar optimistamente todas las queries (igual que en feed-item-actions)
      // Actualizar frames feed
      if (isFrameSource) {
      queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
        { 
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'frames';
          }
        },
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
      }

      // Actualizar feed principal
      queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
        { 
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'feed' && key[1] === 'home';
          }
        },
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

      // Actualizar explore feed
      queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
        { 
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'feed' && key[1] === 'explore';
          }
        },
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

      // Actualizar posts del perfil del autor
      queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
        { 
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'userPosts' && key[1] === frame.author.handle;
          }
        },
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

      // Actualizar post individual
      queryClient.setQueryData<{ post: FeedItem }>(
        ['post', postId],
        (old) => {
          if (!old) return old;
          
          const newLikes = isCurrentlyLiked 
            ? Math.max(0, old.post.stats.likes - 1)
            : old.post.stats.likes + 1;
          
          return {
            ...old,
            post: {
              ...old.post,
              isLikedByViewer: !isCurrentlyLiked,
              stats: {
                ...old.post.stats,
                likes: newLikes
              }
            }
          };
        }
      );

      if (isFrameSource) {
      queryClient.setQueryData<{ frame: FeedItem }>(
        ['frame', postId],
        (old) => {
          if (!old) return old;

          const newLikes = isCurrentlyLiked
            ? Math.max(0, old.frame.stats.likes - 1)
            : old.frame.stats.likes + 1;

          return {
            frame: {
              ...old.frame,
              isLikedByViewer: !isCurrentlyLiked,
              stats: {
                ...old.frame.stats,
                likes: newLikes
              }
            }
          };
        }
      );
      }

      // Retornar contexto con snapshot para rollback y el estado original para mutationFn
      return { 
        previousFrames, 
        previousFeed, 
        previousPost,
        previousFrameEntry,
        isCurrentlyLiked,
        postId
      };
    },
    onError: (err, variables, context) => {
      const postId = typeof variables === 'string' ? variables : variables.postId;
      // Revertir al valor anterior en caso de error
      if (isFrameSource && context?.previousFrames) {
        queryClient.setQueryData(['frames'], context.previousFrames);
      }
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed', 'home'], context.previousFeed);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      if (isFrameSource && context?.previousFrameEntry) {
        queryClient.setQueryData(['frame', postId], context.previousFrameEntry);
      }
      toast.error('No se pudo actualizar el like');
    },
    onSuccess: (data, variables) => {
      const postId = typeof variables === 'string' ? variables : variables.postId;
      if (isFrameSource) {
        queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
          {
            predicate: (query) => {
              const key = query.queryKey;
              return Array.isArray(key) && key[0] === 'frames';
            }
          },
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

      queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
        {
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'feed' && key[1] === 'home';
          }
        },
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

      queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
        {
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'feed' && key[1] === 'explore';
          }
        },
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

      queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
        {
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'userPosts' && key[1] === frame.author.handle;
          }
        },
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

      queryClient.setQueryData<{ post: FeedItem }>(
        ['post', postId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            post: {
              ...old.post,
              isLikedByViewer: data.liked
            }
          };
        }
      );

      if (isFrameSource) {
        queryClient.setQueryData<{ frame: FeedItem }>(
          ['frame', postId],
          (old) => {
            if (!old) return old;

            return {
              frame: {
                ...old.frame,
                isLikedByViewer: data.liked
              }
            };
          }
        );
      }

      void queryClient.invalidateQueries({
        queryKey: ['analytics'],
        exact: false
      });
      if (isFrameSource) {
        void queryClient.invalidateQueries({ queryKey: ['frame', postId] });
      }
    },
    onSettled: () => {
      // No hacer nada adicional aquí para mantener la fluidez de la UI
      // La actualización optimista ya está aplicada y se sincronizó con el servidor
      // (Igual que en feed-item-actions.tsx)
    }
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      isFrameSource
        ? currentFrame.isSavedByViewer
          ? unsaveFrame(currentFrame.id)
          : saveFrame(currentFrame.id)
        : currentFrame.isSavedByViewer
          ? unsavePost(currentFrame.id)
          : savePost(currentFrame.id),
    onSuccess: () => {
      if (isFrameSource) {
        void queryClient.invalidateQueries({ queryKey: ['frames'] });
        void queryClient.invalidateQueries({ queryKey: ['frame', currentFrame.id] });
      }
      void queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
      void queryClient.invalidateQueries({ queryKey: ['feed', 'explore'] });
      void queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      void queryClient.invalidateQueries({ queryKey: ['post', currentFrame.id] });
      toast.success(currentFrame.isSavedByViewer ? 'Eliminado de guardados' : 'Guardado');
    },
    onError: () => {
      toast.error('No se pudo guardar el contenido');
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
      }, CONTROLS_HIDE_DELAY);
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
    const findLatest = (data?: InfiniteData<FeedCursorResponse>): FeedItem | undefined => {
      if (!data) return undefined;
      for (const page of data.pages) {
        const candidate = page.data.find((item) => item.id === currentFrame.id);
        if (candidate) {
          return candidate;
        }
      }
      return undefined;
    };

    const framesData = isFrameSource ? queryClient.getQueryData<InfiniteData<FeedCursorResponse>>(['frames']) : undefined;
    let latestFrame = findLatest(framesData);
    
    if (!latestFrame) {
      const homeFeed = queryClient.getQueryData<InfiniteData<FeedCursorResponse>>(['feed', 'home']);
      latestFrame = findLatest(homeFeed);
    }

    if (!latestFrame) {
      const exploreFeed = queryClient.getQueryData<InfiniteData<FeedCursorResponse>>(['feed', 'explore']);
      latestFrame = findLatest(exploreFeed);
    }

    const frameToUse = latestFrame ?? currentFrame;
    const isCurrentlyLiked = frameToUse.isLikedByViewer;
    
    likeMutation.mutate({ postId: frameToUse.id, isCurrentlyLiked });
  };

  const handleSave = (): void => {
    saveMutation.mutate();
  };

  const handleToggleMute = (): void => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
      setShowMutedHint(true);
      if (muteHintTimeoutRef.current) {
        clearTimeout(muteHintTimeoutRef.current);
      }
      muteHintTimeoutRef.current = setTimeout(() => {
        setShowMutedHint(false);
      }, MUTED_HINT_DURATION);
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
    const shared = isFrameSource
      ? await shareFrame(currentFrame.id, `Frame de @${currentFrame.author.handle}`)
      : await sharePost(currentFrame.id, `Publicación de @${currentFrame.author.handle}`);

    if (shared) {
      toast.success('Enlace copiado al portapapeles');
      return;
    }

    const copied = isFrameSource ? await copyFrameLink(currentFrame.id) : await copyPostLink(currentFrame.id);
    if (copied) {
      toast.success('Enlace copiado al portapapeles');
    } else {
      toast.error('No se pudo copiar el enlace');
    }
  };

  const createdAtLabel = useMemo(() => {
    if (!currentFrame.createdAt) {
      return '';
    }
    try {
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(currentFrame.createdAt));
    } catch {
      return '';
    }
  }, [currentFrame.createdAt]);

  if (!primaryMedia) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background text-foreground">
        <div className="rounded-2xl glass-card border border-border/60 px-6 py-4 text-center shadow-elegant">
          <h3 className="text-lg font-semibold">Frame sin contenido</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Este frame no tiene recursos multimedia disponibles.
          </p>
        </div>
      </div>
    );
  }

  if (!hasPlayableVideo || !safeVideoUrl) {
    return <></>;
  }

  const isStandalone = variant === 'standalone';

  const wrapperClasses = isStandalone
    ? 'relative flex min-h-screen w-full items-center justify-center bg-[#05070C] px-4 py-16 text-white md:px-12'
    : 'relative flex w-full justify-center text-white';
  const containerClasses = isStandalone
    ? 'relative flex w-full max-w-none flex-col items-center gap-6'
    : 'relative flex w-full flex-col items-center gap-4';
  const playerShellClasses = isStandalone
    ? 'relative aspect-[9/16] w-full max-w-[420px] overflow-hidden rounded-[24px]'
    : 'relative aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-[22px]';
 
  return (
    <div className={wrapperClasses}>
      {isStandalone ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_55%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_55%)]"
            aria-hidden
          />
        </>
      ) : null}
      <div className={containerClasses}>
        <div className={playerShellClasses}>
            <video
              key={currentFrame.id}
              ref={videoRef}
              src={safeVideoUrl}
              className="absolute inset-0 h-full w-full object-cover"
              loop
              playsInline
              muted={isMuted}
              autoPlay
              preload="metadata"
              onLoadedMetadata={() => {
                setVideoError(null);
              }}
              onLoadedData={() => {
                setIsVideoLoaded(true);
              }}
              onError={() => {
                setIsVideoLoaded(true);
                setVideoError('No se pudo reproducir este frame.');
              }}
              onPlay={() => {
                setIsPlaying(true);
              }}
              onPause={() => {
                setIsPlaying(false);
              }}
            />
            {!isVideoLoaded ? (
              <div className="pointer-events-none absolute inset-0 z-20 rounded-[24px] bg-black/80 backdrop-blur-md">
                <div className="absolute inset-0 animate-[pulse_1.8s_ease-in-out_infinite] bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.1] opacity-70" />
                <div className="relative flex h-full flex-col justify-between px-5 py-6 text-white/80 md:px-7 md:py-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="h-6 w-20 rounded-full border border-white/15 bg-white/[0.12]" />
                      <div className="h-6 w-28 rounded-full border border-white/15 bg-white/[0.1]" />
                    </div>
                    <div className="h-9 w-28 rounded-full border border-white/15 bg-white/[0.08]" />
                  </div>

                  <div className="flex items-end justify-between gap-6">
                    <div className="max-w-[75%] space-y-4 rounded-3xl border border-white/12 bg-white/[0.08] px-4 py-5 text-white/85">
                      <div className="flex items-center gap-3">
                        <div className="size-11 rounded-full border border-white/15 bg-white/[0.08]" />
                        <div className="space-y-2">
                          <div className="h-3 w-28 rounded-full bg-white/[0.14]" />
                          <div className="h-2 w-20 rounded-full bg-white/[0.1]" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-full rounded-full bg-white/[0.1]" />
                        <div className="h-2 w-5/6 rounded-full bg-white/[0.1]" />
                        <div className="h-2 w-2/3 rounded-full bg-white/[0.08]" />
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 text-white">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={`player-skeleton-action-${index}`} className="flex flex-col items-center gap-1">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.08]" />
                          <div className="h-2 w-10 rounded-full bg-white/[0.12]" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            {videoError ? (
              <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/85 px-6 text-center">
                <p className="text-sm font-semibold text-white">{videoError}</p>
              </div>
            ) : null}

            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-black/85 via-black/45 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {(onPrevious || onNext) && (
              <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-30 flex items-center justify-between px-2 sm:px-3">
                {onPrevious ? (
                  <button
                    type="button"
                    onClick={onPrevious}
                    disabled={!canGoPrevious}
                    aria-label="Ver frame anterior"
                    className="pointer-events-auto hidden h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-black/45 text-white transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-40 md:flex"
                  >
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                ) : (
                  <span className="hidden md:block" />
                )}

                {onNext ? (
                  <button
                    type="button"
                    onClick={onNext}
                    disabled={!canGoNext}
                    aria-label="Ver frame siguiente"
                    className="pointer-events-auto hidden h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-black/45 text-white transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-40 md:flex"
                  >
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <span className="hidden md:block" />
                )}
              </div>
            )}

            <div className="absolute inset-x-0 top-0 z-40 h-1 bg-white/12">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary-400 via-primary-300 to-accent-300"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>

            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-none absolute inset-0"
                />
              )}
            </AnimatePresence>

            {!isPlaying && !videoError && (
              <motion.button
                type="button"
                onClick={handleTogglePlay}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/70 p-4 md:p-5 text-white shadow-xl backdrop-blur-xl"
              >
                <svg className="size-12 md:size-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </motion.button>
            )}
          <AnimatePresence>
            {showMutedHint && !videoError ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="mt-4 rounded-full border border-white/12 bg-black/70 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80"
              >
                {isMuted ? 'Sonido desactivado' : 'Sonido activado'}
              </motion.div>
            ) : null}
          </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: showControls ? 1 : 0.9, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="pointer-events-none flex w-full max-w-[420px] flex-col gap-3 px-2 text-white md:px-0"
        >
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/${currentFrame.author.handle}`}
              aria-label={`Visitar perfil de ${currentFrame.author.displayName}`}
              className="pointer-events-auto relative flex items-center gap-3 rounded-full bg-black/55 px-3 py-2 text-white shadow-[0_18px_40px_-22px_rgba(17,24,39,0.85)] backdrop-blur"
            >
              <div className="relative size-9 overflow-hidden rounded-full border border-white/15 bg-black/40">
                <Image
                  src={avatarUrl}
                  alt={currentFrame.author.displayName}
                  fill
                  sizes="36px"
                  className="object-cover"
                  unoptimized={isLocalImage(avatarUrl)}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="truncate text-sm font-semibold">@{currentFrame.author.handle}</span>
                  {currentFrame.author.isVerified ? <VerifiedBadge size="sm" /> : null}
                </div>
                <p className="text-[11px] text-white/65">
                  {createdAtLabel || currentFrame.author.displayName}
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => {
                void handleShare();
              }}
              className="pointer-events-auto rounded-full border border-white/15 bg-white/[0.1] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-white/[0.18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Compartir
            </button>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="pointer-events-auto min-w-0 max-w-[70%] space-y-1">
              {currentFrame.caption ? (
                <p className="line-clamp-2 text-sm leading-relaxed text-white/90">{currentFrame.caption}</p>
              ) : null}
              <div className="flex items-center gap-2 text-white/70">
                <MusicalNoteIcon className="h-4 w-4" />
                {currentFrame.soundTrackUrl ? (
                  <a
                    href={currentFrame.soundTrackUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium hover:text-white"
                  >
                    Audio original
                  </a>
                ) : (
                  <span className="text-xs font-medium">Audio original</span>
                )}
              </div>
            </div>

            <div className="pointer-events-auto flex flex-col items-center gap-4">
              <motion.button
                type="button"
                onClick={handleLike}
                disabled={likeMutation.isPending}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.92 }}
                className="group flex flex-col items-center gap-1.5"
              >
                <motion.div
                  animate={{
                    scale: currentFrame.isLikedByViewer ? [1, 1.25, 1] : 1
                  }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200 ${
                    currentFrame.isLikedByViewer
                      ? 'border-red-400/40 bg-red-500/30 shadow-lg shadow-red-500/20'
                      : 'border-white/12 bg-white/[0.08] group-hover:border-white/18 group-hover:bg-white/[0.12]'
                  }`}
                >
                  <svg
                    className={`size-5 transition-colors ${
                      currentFrame.isLikedByViewer ? 'fill-red-400 text-red-300' : 'text-white'
                    }`}
                    fill={currentFrame.isLikedByViewer ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={currentFrame.isLikedByViewer ? 2.4 : 2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </motion.div>
                <span className="text-[10px] font-semibold text-white/85">
                  {currentFrame.stats.likes.toLocaleString('es')}
                </span>
              </motion.button>

              <Link href={`/frames/${currentFrame.id}#comments`} className="group flex flex-col items-center gap-1.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] transition-colors duration-200 group-hover:border-white/18 group-hover:bg-white/[0.12]">
                  <svg className="size-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <span className="text-[10px] font-semibold text-white/85">
                  {currentFrame.stats.comments.toLocaleString('es')}
                </span>
              </Link>

              <motion.button
                type="button"
                onClick={() => {
                  void handleShare();
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.92 }}
                className="group flex flex-col items-center gap-1.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] transition-colors duration-200 group-hover:border-white/18 group-hover:bg-white/[0.12]">
                  <svg className="size-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342c-.4 0-.816-.039-1.236-.115l-.866-2.322c-.35-.937.062-1.954.938-2.305l2.322-.866c.402-.15.81-.231 1.221-.231.4 0 .816.039 1.236.115l.866 2.322c.35.937-.062 1.954-.938 2.305l-2.322.866c-.402.15-.81.231-1.221.231zM13.342 8.684c.4 0 .816-.039 1.236-.115l.866-2.322c.35-.937-.062-1.954-.938-2.305l-2.322-.866c-.402-.15-.81-.231-1.221-.231-.4 0-.816.039-1.236.115l-.866 2.322c-.35.937.062 1.954.938 2.305l2.322.866c.402.15.81.231 1.221.231zM21.316 13.342c.4 0 .816-.039 1.236-.115l.866-2.322c.35-.937-.062-1.954-.938-2.305l-2.322-.866c-.402-.15-.81-.231-1.221-.231-.4 0-.816.039-1.236.115l-.866 2.322c-.35.937.062 1.954.938 2.305l2.322.866c.402.15.81.231 1.221.231z"
                    />
                  </svg>
                </div>
                <span className="text-[10px] font-semibold text-white/85">
                  {currentFrame.stats.shares.toLocaleString('es')}
                </span>
              </motion.button>

              <motion.button
                type="button"
                onClick={handleSave}
                disabled={saveMutation.isPending}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.92 }}
                className="group flex flex-col items-center gap-1.5"
              >
                <motion.div
                  animate={{
                    scale: currentFrame.isSavedByViewer ? [1, 1.18, 1] : 1
                  }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200 ${
                    currentFrame.isSavedByViewer
                      ? 'border-primary-400/45 bg-primary-500/30 shadow-lg shadow-primary-500/20'
                      : 'border-white/12 bg-white/[0.08] group-hover:border-white/18 group-hover:bg-white/[0.12]'
                  }`}
                >
                  <svg
                    className={`size-5 text-white transition-colors ${
                      currentFrame.isSavedByViewer ? 'fill-primary-400 text-primary-200' : 'text-white'
                    }`}
                    fill={currentFrame.isSavedByViewer ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={currentFrame.isSavedByViewer ? 2.4 : 2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </motion.div>
                <span className="text-[10px] font-semibold text-white/85">
                  {currentFrame.stats.saves.toLocaleString('es')}
                </span>
              </motion.button>

              <motion.button
                type="button"
                onClick={handleToggleMute}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.92 }}
                className="group flex flex-col items-center gap-1.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] transition-colors duration-200 group-hover:border-white/18 group-hover:bg-white/[0.12]">
                  <svg className="size-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                </div>
                <span className="text-[10px] font-semibold text-white/85">
                  {isMuted ? 'Silencio' : 'Sonido'}
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        </div>
      </div>
    </div>
  );
}