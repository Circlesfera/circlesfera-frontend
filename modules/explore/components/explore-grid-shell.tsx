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
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-full aspect-[4/3] animate-pulse rounded-lg glass-card" />
        ))}
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
            <h2 className="text-xl font-bold text-white mb-2">No hay contenido para explorar</h2>
            <p className="text-sm text-slate-400">
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
      className="mx-auto w-full max-w-6xl"
    >
      <div className="grid grid-cols-3 gap-1 md:grid-cols-4 lg:grid-cols-5">
        {posts.map((post) => {
          const firstMedia = post.media[0];
          if (!firstMedia) {
            return null;
          }

          // Calcular aspect ratio dinámicamente
          const getAspectRatio = (): string => {
            if (firstMedia.width && firstMedia.height) {
              const ratio = firstMedia.width / firstMedia.height;
              // Para imágenes, usar el ratio real
              if (firstMedia.kind === 'image') {
                return `${firstMedia.width} / ${firstMedia.height}`;
              }
              // Para videos, usar el ratio real también
              return `${firstMedia.width} / ${firstMedia.height}`;
            }
            // Valores por defecto si no hay dimensiones
            if (firstMedia.kind === 'image') {
              return '1 / 1'; // Cuadrado por defecto para imágenes
            }
            return '16 / 9'; // 16:9 por defecto para videos
          };

          return (
            <motion.div
              key={post.id}
              variants={staggerItem}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
              style={{
                aspectRatio: getAspectRatio()
              }}
            >
              <Link
                href={`/posts/${post.id}`}
                className="group relative block w-full h-full overflow-hidden rounded-lg bg-slate-900"
              >
              {firstMedia.kind === 'image' ? (
                <Image
                  src={firstMedia.url}
                  alt={post.caption || 'Imagen'}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized={isLocalImage(firstMedia.url)}
                  sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              ) : isReel(post) ? (
                <video
                  src={firstMedia.url}
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <Fragment>
                  <Image
                    src={firstMedia.thumbnailUrl || firstMedia.url}
                    alt={post.caption || 'Video'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized={isLocalImage(firstMedia.thumbnailUrl || firstMedia.url)}
                    sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <svg className="size-8 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  {firstMedia.durationMs ? (
                    <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                      {formatDuration(firstMedia.durationMs)}
                    </div>
                  ) : null}
                </Fragment>
              )}

              {/* Overlay con estadísticas en hover */}
              <div className="absolute inset-0 flex items-center justify-center gap-6 bg-gradient-to-t from-black/90 via-black/70 to-black/50 opacity-0 transition-all duration-300 group-hover:opacity-100 backdrop-blur-[2px]">
                <div className="flex items-center gap-2 text-white">
                  <div className="rounded-full bg-red-500/20 p-2 backdrop-blur-sm">
                    <svg className="size-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <span className="text-base font-bold">{formatNumber(Math.max(0, post.stats.likes))}</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <div className="rounded-full bg-blue-500/20 p-2 backdrop-blur-sm">
                    <svg className="size-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <span className="text-base font-bold">{formatNumber(post.stats.comments)}</span>
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
          className="flex justify-center mt-10"
        >
          <motion.button
            type="button"
            onClick={() => {
              void fetchNextPage();
            }}
            disabled={isFetchingNextPage}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
          >
            {isFetchingNextPage ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Cargando...
              </span>
            ) : (
              'Cargar más'
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

