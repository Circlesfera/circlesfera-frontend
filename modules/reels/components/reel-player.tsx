'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef, useMemo, type ReactElement } from 'react';
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
  
  // Estado para forzar re-render cuando cambie el cache
  const [, forceUpdate] = useState(0);
  
  // Suscribirse a cambios en el cache de reels para forzar re-render
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      // Solo re-renderizar si cambió la query de reels
      if (event?.query?.queryKey?.[0] === 'reels') {
        forceUpdate((prev) => prev + 1);
      }
    });
    
    return unsubscribe;
  }, [queryClient]);
  
  // Obtener el reel actualizado del cache en cada render para reflejar cambios en tiempo real
  const currentReel = useMemo(() => {
    const reelsData = queryClient.getQueryData<InfiniteData<FeedCursorResponse>>(['reels']);
    
    if (reelsData) {
      for (const page of reelsData.pages) {
        const foundReel = page.data.find((item) => item.id === reel.id);
        if (foundReel) {
          return foundReel;
        }
      }
    }
    
    // Si no se encuentra en el cache, usar el prop como fallback
    return reel;
  }, [queryClient, reel.id, reel, forceUpdate]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Actualización optimista de likes (sincronizada con todas las queries) - Replicando lógica del feed
  const likeMutation = useMutation({
    mutationFn: async ({ postId, isCurrentlyLiked }: { postId: string; isCurrentlyLiked: boolean }) => {
      // Ejecutar la acción correspondiente basada en el estado que se pasó desde onMutate
      if (isCurrentlyLiked) {
        return await unlikePost(postId);
      } else {
        return await likePost(postId);
      }
    },
    onMutate: async ({ postId, isCurrentlyLiked }: { postId: string; isCurrentlyLiked: boolean }) => {
      // Cancelar cualquier query en progreso para evitar sobrescribir nuestro update optimista
      await queryClient.cancelQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return (
            (Array.isArray(key) && key[0] === 'reels') ||
            (Array.isArray(key) && key[0] === 'feed' && key[1] === 'home') ||
            (Array.isArray(key) && key[0] === 'feed' && key[1] === 'explore') ||
            (Array.isArray(key) && key[0] === 'userPosts') ||
            (Array.isArray(key) && key[0] === 'post' && key[1] === postId)
          );
        }
      });

      // Snapshot del valor anterior
      const previousReels = queryClient.getQueryData<InfiniteData<FeedCursorResponse>>(['reels']);
      const previousFeed = queryClient.getQueryData<InfiniteData<FeedCursorResponse>>(['feed', 'home']);
      const previousPost = queryClient.getQueryData<{ post: FeedItem }>(['post', postId]);

      // Actualizar optimistamente todas las queries (igual que en feed-item-actions)
      // Actualizar reels feed
      queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
        { 
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'reels';
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
            return Array.isArray(key) && key[0] === 'userPosts' && key[1] === reel.author.handle;
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

      // Retornar contexto con snapshot para rollback y el estado original para mutationFn
      return { 
        previousReels, 
        previousFeed, 
        previousPost,
        isCurrentlyLiked,
        postId
      };
    },
    onError: (err, variables, context) => {
      const postId = typeof variables === 'string' ? variables : variables.postId;
      // Revertir al valor anterior en caso de error
      if (context?.previousReels) {
        queryClient.setQueryData(['reels'], context.previousReels);
      }
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed', 'home'], context.previousFeed);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      toast.error('No se pudo actualizar el like');
    },
    onSuccess: async (data, variables) => {
      const postId = typeof variables === 'string' ? variables : variables.postId;
      // Confirmar el estado con la respuesta del servidor
      // La actualización optimista ya ajustó el contador, solo necesitamos confirmar isLikedByViewer
      // (Igual que en feed-item-actions.tsx)
      queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
        { 
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'reels';
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
                  // Confirmar el estado del like con la respuesta del servidor
                  // El contador ya fue actualizado en onMutate, solo sincronizamos el estado
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

      // Actualizar posts del perfil del autor
      queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
        { 
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'userPosts' && key[1] === reel.author.handle;
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

      // Actualizar el post individual también
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
    },
    onSettled: () => {
      // No hacer nada adicional aquí para mantener la fluidez de la UI
      // La actualización optimista ya está aplicada y se sincronizó con el servidor
      // (Igual que en feed-item-actions.tsx)
    }
  });

  const saveMutation = useMutation({
    mutationFn: () => (currentReel.isSavedByViewer ? unsavePost(currentReel.id) : savePost(currentReel.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
      toast.success(currentReel.isSavedByViewer ? 'Eliminado de guardados' : 'Guardado');
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
    // Leer el estado actual del cache ANTES de la mutación para pasarlo correctamente
    const reelsData = queryClient.getQueryData<InfiniteData<FeedCursorResponse>>(['reels']);
    let latestReel: FeedItem | undefined;
    
    if (reelsData) {
      for (const page of reelsData.pages) {
        latestReel = page.data.find((item) => item.id === currentReel.id);
        if (latestReel) break;
      }
    }
    
    // Usar el reel más reciente del cache, o el actual como fallback
    const reelToUse = latestReel ?? currentReel;
    const isCurrentlyLiked = reelToUse.isLikedByViewer;
    
    // Pasar el estado actual junto con el postId para que mutationFn lo use
    likeMutation.mutate({ postId: reelToUse.id, isCurrentlyLiked });
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
    const shared = await sharePost(currentReel.id, `Reel de @${currentReel.author.handle}`);
    if (shared) {
      toast.success('Enlace copiado al portapapeles');
      setShowShareMenu(false);
    } else {
      const copied = await copyPostLink(currentReel.id);
      if (copied) {
        toast.success('Enlace copiado al portapapeles');
        setShowShareMenu(false);
      } else {
        toast.error('No se pudo copiar el enlace');
      }
    }
  };

  const videoMedia = currentReel.media.find((m: { kind: string }) => m.kind === 'video');
  if (!videoMedia) {
    return <></>;
  }

  const avatarUrl = getAvatarUrl(currentReel.author.avatarUrl, currentReel.author.handle);

  return (
    <div className="relative h-screen w-full bg-black dark:bg-black flex items-center justify-center">
      {/* Video con aspect ratio 9:16 vertical - ocupa más espacio */}
      <div className="relative w-full max-w-[400px] md:max-w-[450px] aspect-[9/16] max-h-[90vh] bg-black/30 dark:bg-black/30 rounded-2xl overflow-hidden shadow-2xl border border-white/10 dark:border-white/10">
      <video
        ref={videoRef}
        src={videoMedia.url}
          className="absolute inset-0 w-full h-full object-contain"
        loop
        playsInline
        muted={isMuted}
          onClick={handleTogglePlay}
        autoPlay
        preload="auto"
        />

        {/* Barra de progreso - diseño refinado */}
        <div className="absolute top-0 left-0 right-0 z-40 h-1.5 bg-black/30 dark:bg-black/30 backdrop-blur-sm">
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
              <Link href={`/${currentReel.author.handle}`} className="mb-3 md:mb-4 flex items-center gap-2 md:gap-3 group">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className="relative size-11 md:size-13 overflow-hidden rounded-full border-2 border-white/40 ring-1 ring-primary-500/30 transition-all duration-300 group-hover:ring-primary-500/50 group-hover:border-white/60 shadow-lg"
                >
              <Image
                    src={avatarUrl}
                alt={currentReel.author.displayName}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                    unoptimized={isLocalImage(avatarUrl)}
                    sizes="64px"
              />
                </motion.div>
            <div className="text-white dark:text-white flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-base md:text-lg truncate">@{currentReel.author.handle}</p>
                {currentReel.author.isVerified && <VerifiedBadge size="sm" />}
              </div>
              {currentReel.caption && (
                    <p className="mt-1.5 line-clamp-2 text-sm md:text-base text-white/95 dark:text-white/95 leading-relaxed">{currentReel.caption}</p>
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
                    scale: currentReel.isLikedByViewer ? [1, 1.3, 1] : 1
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`rounded-full p-3 transition-all duration-300 ${
                    currentReel.isLikedByViewer 
                      ? 'bg-red-500/35 shadow-lg shadow-red-500/40 backdrop-blur-md border border-red-500/30' 
                      : 'bg-black/50 dark:bg-black/50 backdrop-blur-md border border-white/20 dark:border-white/20'
                  }`}
                >
              <svg
                    className={`size-7 md:size-8 transition-all ${
                      currentReel.isLikedByViewer ? 'fill-red-500 text-red-500' : 'text-white dark:text-white'
                    }`}
                fill={currentReel.isLikedByViewer ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                      strokeWidth={currentReel.isLikedByViewer ? 2.5 : 2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
                </motion.div>
                <span className="text-xs md:text-sm font-bold text-white dark:text-white drop-shadow-lg">
                  {currentReel.stats.likes.toLocaleString('es')}
                </span>
              </motion.button>

          {/* Comentarios */}
              <Link 
                href={`/posts/${currentReel.id}#comments`}
                className="flex flex-col items-center gap-2"
              >
                <motion.div
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  className="rounded-full bg-black/50 dark:bg-black/50 backdrop-blur-md border border-white/20 dark:border-white/20 p-3 transition-all duration-300 hover:border-white/30 dark:hover:border-white/30"
                >
              <svg className="size-7 md:size-8 text-white dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
                </motion.div>
                <span className="text-xs md:text-sm font-bold text-white dark:text-white drop-shadow-lg">
                  {currentReel.stats.comments.toLocaleString('es')}
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
                  className="rounded-full bg-black/50 dark:bg-black/50 backdrop-blur-md border border-white/20 dark:border-white/20 p-3 transition-all duration-300 hover:border-white/30 dark:hover:border-white/30"
                >
                  <svg className="size-7 md:size-8 text-white dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className="absolute bottom-full right-0 mb-2 rounded-xl bg-black/90 dark:bg-black/90 backdrop-blur-xl border border-white/[0.12] dark:border-white/[0.12] p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]"
                    >
          <button
                        type="button"
                        onClick={handleShare}
                        className="flex w-full items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium text-white dark:text-white hover:bg-white/[0.08] dark:hover:bg-white/[0.08] transition-all duration-200"
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
                    scale: currentReel.isSavedByViewer ? [1, 1.2, 1] : 1
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`rounded-full p-3 transition-all duration-300 ${
                    currentReel.isSavedByViewer 
                      ? 'bg-primary-500/35 shadow-lg shadow-primary-500/40 backdrop-blur-md border border-primary-500/30' 
                      : 'bg-black/50 dark:bg-black/50 backdrop-blur-md border border-white/20 dark:border-white/20'
                  }`}
                >
              <svg
                    className={`size-7 md:size-8 transition-all ${
                      currentReel.isSavedByViewer ? 'fill-primary-400 text-primary-400' : 'text-white dark:text-white'
                    }`}
                fill={currentReel.isSavedByViewer ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                      strokeWidth={currentReel.isSavedByViewer ? 2.5 : 2}
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
              <svg className="size-7 md:size-8 text-white dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="size-7 md:size-8 text-white dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 dark:bg-black/70 backdrop-blur-xl p-5 md:p-6 border border-white/30 dark:border-white/30 shadow-lg shadow-black/50"
        >
          <svg className="size-12 md:size-14 text-white dark:text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.button>
      )}
      </div>
    </div>
  );
}
