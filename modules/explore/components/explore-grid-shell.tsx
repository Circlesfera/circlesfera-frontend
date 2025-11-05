'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Fragment, type ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { fetchExploreFeed } from '@/services/api/feed';
import { formatNumber } from '@/lib/utils';
import { fadeUpVariants, staggerContainer, staggerItem } from '@/lib/motion-config';
import { useSessionStore } from '@/store/session';
import { isLocalImage } from '@/lib/image-utils';
import type { FeedItem } from '@/services/api/types/feed';

// Función para determinar si un item es un reel
const isReel = (item: FeedItem): boolean => {
  return (
    item.media.length === 1 &&
    item.media[0]?.kind === 'video' &&
    item.media[0]?.durationMs !== undefined &&
    item.media[0].durationMs <= 60000
  );
};

/**
 * Renderiza el grid de explorar con posts populares.
 */
export const ExploreGridShell = (): ReactElement => {
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['feed', 'explore'],
    queryFn: ({ pageParam }) => fetchExploreFeed({ cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Solo ejecutar cuando la sesión esté hidratada y haya un token
    enabled: isHydrated && !!accessToken
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 20 }).map((_, i) => {
          // Variar los aspect ratios en el skeleton para que se vea más realista
          const ratios = ['1/1', '4/3', '3/4', '16/9', '9/16'];
          const ratio = ratios[i % ratios.length];
          return (
            <div 
              key={i} 
              className="w-full rounded-lg glass-card bg-slate-200 dark:bg-slate-800/50 animate-shimmer"
              style={{ aspectRatio: ratio }}
            />
          );
        })}
      </div>
    );
  }

  if (isError) {
    return (
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="rounded-2xl glass-card p-8 text-center"
      >
        <div className="size-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="size-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-red-400 mb-2">
          Error al cargar el feed de explorar
        </p>
        <p className="text-xs text-slate-500">
          Intenta nuevamente más tarde
        </p>
      </motion.div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  if (posts.length === 0) {
    return (
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="flex min-h-[500px] flex-col items-center justify-center"
      >
        <div className="rounded-2xl glass-card p-12 text-center max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mx-auto mb-6"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 via-primary-400/20 to-accent-500/20 blur-2xl" />
            <div className="relative size-24 rounded-2xl border border-primary-500/30 bg-gradient-to-br from-slate-900/50 to-black/50 backdrop-blur-sm flex items-center justify-center shadow-elegant">
              <svg className="size-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No hay contenido para explorar</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Aún no hay publicaciones disponibles
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-2.5">
        {posts.map((post) => {
          const firstMedia = post.media[0];
          if (!firstMedia) {
            return null;
          }

          // Calcular aspect ratio dinámicamente
          const getAspectRatio = (): string => {
            // Para reels, siempre usar aspect ratio vertical (9:16)
            if (isReel(post)) {
              return '9 / 16';
            }

            // Si tenemos dimensiones reales, usarlas
            if (firstMedia.width && firstMedia.height) {
              const ratio = firstMedia.width / firstMedia.height;
              
              // Limitar ratios extremos para mejor visualización en grid
              if (ratio > 2) {
                // Muy landscape, limitar a 2:1
                return '2 / 1';
              } else if (ratio < 0.6) {
                // Muy portrait, limitar a 3:5
                return '3 / 5';
              }
              
              return `${firstMedia.width} / ${firstMedia.height}`;
            }
            
            // Valores por defecto
            if (firstMedia.kind === 'image') {
              return '1 / 1'; // Cuadrado por defecto para imágenes
            }
            return '16 / 9'; // 16:9 por defecto para videos largos
          };

          const aspectRatio = getAspectRatio();
          const isPortrait = isReel(post) || (firstMedia.width && firstMedia.height && firstMedia.width < firstMedia.height);
          const isReelItem = isReel(post);

          return (
            <motion.div
              key={post.id}
              variants={staggerItem}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
              style={{
                aspectRatio: aspectRatio
              }}
            >
              <Link
                href={`/posts/${post.id}`}
                className={`group relative flex items-center justify-center w-full h-full overflow-hidden rounded-xl border transition-all duration-300 ${
                  isReelItem 
                    ? 'bg-black dark:bg-black border-slate-300/50 dark:border-white/5 hover:border-slate-400/50 dark:hover:border-white/15 hover:shadow-lg hover:shadow-primary-500/10' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-300/50 dark:border-white/5 hover:border-slate-400/50 dark:hover:border-white/15 hover:shadow-lg hover:shadow-primary-500/10 p-1'
                }`}
              >
              {firstMedia.kind === 'image' ? (
                <Image
                  src={firstMedia.url}
                  alt={post.caption || 'Imagen'}
                  fill
                  className={isPortrait ? 'object-contain' : 'object-cover'}
                  style={{
                    objectPosition: 'center'
                  }}
                  unoptimized={isLocalImage(firstMedia.url)}
                  sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              ) : isReel(post) ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    src={firstMedia.url}
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  {/* Indicador de reel */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 dark:bg-black/60 backdrop-blur-sm px-2 py-1">
                    <svg className="size-3.5 text-white dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                    </svg>
                    <span className="text-xs font-semibold text-white dark:text-white">Reel</span>
                  </div>
                </div>
              ) : (
                <Fragment>
                  <Image
                    src={firstMedia.thumbnailUrl || firstMedia.url}
                    alt={post.caption || 'Video'}
                    fill
                    className="object-cover"
                    unoptimized={isLocalImage(firstMedia.thumbnailUrl || firstMedia.url)}
                    sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 dark:bg-black/40 backdrop-blur-[1px]">
                    <div className="rounded-full bg-black/60 dark:bg-black/60 p-3 backdrop-blur-sm">
                      <svg className="size-8 text-white/90 dark:text-white/90" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {firstMedia.durationMs ? (
                    <div className="absolute bottom-2 right-2 rounded-lg bg-black/80 dark:bg-black/80 backdrop-blur-sm px-2 py-1 text-xs font-semibold text-white dark:text-white border border-white/20 dark:border-white/20">
                      {formatDuration(firstMedia.durationMs)}
                    </div>
                  ) : null}
                </Fragment>
              )}

              {/* Overlay con estadísticas en hover */}
              <div className="absolute inset-0 flex items-center justify-center gap-4 bg-gradient-to-t from-black/95 via-black/85 to-black/65 opacity-0 transition-all duration-300 group-hover:opacity-100 backdrop-blur-md">
                <div className="flex items-center gap-2 text-white dark:text-white">
                  <div className="rounded-full bg-red-500/30 p-2.5 backdrop-blur-md border border-red-500/30">
                    <svg className="size-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <span className="text-lg font-bold">{formatNumber(Math.max(0, post.stats.likes))}</span>
                </div>
                <div className="flex items-center gap-2 text-white dark:text-white">
                  <div className="rounded-full bg-blue-500/30 p-2.5 backdrop-blur-md border border-blue-500/30">
                    <svg className="size-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <span className="text-lg font-bold">{formatNumber(post.stats.comments)}</span>
                </div>
              </div>
            </Link>
            </motion.div>
          );
        })}
      </div>

      {hasNextPage ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center mt-12 mb-4"
        >
          <motion.button
            type="button"
            onClick={() => {
              void fetchNextPage();
            }}
            disabled={isFetchingNextPage}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
          >
            {isFetchingNextPage ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Cargando...
              </span>
            ) : (
              'Cargar más contenido'
            )}
          </motion.button>
        </motion.div>
      ) : null}
    </motion.section>
  );
};

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

