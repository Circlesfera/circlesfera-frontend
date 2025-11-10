'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, type ReactElement } from 'react';

import { fadeUpVariants, staggerContainer, staggerItem } from '@/lib/motion-config';
import { getRelatedPosts } from '@/services/api/feed';
import type { FeedItem } from '@/services/api/types/feed';

// Función para determinar si un item es un frame
const isFrame = (item: FeedItem): boolean => {
  return (
    item.media.length === 1 &&
    item.media[0]?.kind === 'video' &&
    item.media[0]?.durationMs !== undefined &&
    item.media[0].durationMs <= 60000
  );
};

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

interface RelatedPostsProps {
  readonly postId: string;
}

/**
 * Renderiza una sección con posts relacionados.
 */
export function RelatedPosts({ postId }: RelatedPostsProps): ReactElement | null {
  const { data, isLoading } = useQuery({
    queryKey: ['related-posts', postId],
    queryFn: () => getRelatedPosts(postId, 6),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const relatedPosts = data?.posts ?? [];

  if (isLoading || relatedPosts.length === 0) {
    return null; // No mostrar nada si está cargando o no hay posts relacionados
  }

  return (
    <motion.section
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="mt-10 w-full max-w-4xl"
    >
      <h2 className="mb-6 text-xl font-bold text-gradient-primary">Publicaciones relacionadas</h2>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-6"
      >
        {relatedPosts.map((post) => {
          const firstMedia = post.media[0];

          if (!firstMedia) {
            return null;
          }

          const hasThumbnail = Boolean(firstMedia.thumbnailUrl && firstMedia.thumbnailUrl.trim().length > 0);
          const fallbackSrc = hasThumbnail ? firstMedia.thumbnailUrl : firstMedia.url;
          const safeImageSrc = fallbackSrc && fallbackSrc.trim().length > 0 ? fallbackSrc : null;

          return (
            <motion.div
              key={post.id}
              variants={staggerItem}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Link
                href={`/posts/${post.id}`}
                className="group relative block aspect-square overflow-hidden rounded-2xl border border-border/60 bg-surface transition-all duration-300 hover:border-border-strong hover:shadow-xl hover:shadow-primary-500/10"
              >
                {!safeImageSrc ? (
                  <div className="flex h-full w-full items-center justify-center bg-slate-900">
                    <span className="size-5 rounded-full border-2 border-white/40 border-t-transparent animate-spin" />
                  </div>
                ) : firstMedia.kind === 'image' ? (
                <Image
                    src={safeImageSrc}
                  alt={post.caption || 'Publicación relacionada'}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : isFrame(post) ? (
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
                      src={safeImageSrc}
                    alt={post.caption || 'Publicación relacionada'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <svg className="size-6 text-white/90" fill="currentColor" viewBox="0 0 24 24">
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

              {/* Overlay con estadísticas */}
              <div className="absolute inset-0 flex items-center justify-center gap-4 bg-gradient-to-t from-black/90 via-black/70 to-black/50 opacity-0 transition-all duration-300 group-hover:opacity-100 backdrop-blur-[2px]">
                <div className="flex items-center gap-1.5 text-white">
                  <div className="rounded-full bg-red-500/20 p-1.5 backdrop-blur-sm">
                    <svg className="size-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold">{post.stats.likes.toLocaleString('es')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white">
                  <div className="rounded-full bg-blue-500/20 p-1.5 backdrop-blur-sm">
                    <svg className="size-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-bold">{post.stats.comments.toLocaleString('es')}</span>
                </div>
              </div>
            </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}

