'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Fragment, type ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getRelatedPosts } from '@/services/api/feed';

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
    <section className="mt-8 w-full max-w-4xl">
      <h2 className="mb-4 text-xl font-semibold text-white">Publicaciones relacionadas</h2>
      <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {relatedPosts.map((post) => {
          const firstMedia = post.media[0];
          if (!firstMedia) {
            return null;
          }

          return (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-800"
            >
              {firstMedia.kind === 'image' ? (
                <Image
                  src={firstMedia.url}
                  alt={post.caption || 'Publicación relacionada'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <Fragment>
                  <Image
                    src={firstMedia.thumbnailUrl}
                    alt={post.caption || 'Publicación relacionada'}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
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
              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex items-center gap-1 text-white">
                  <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="text-xs font-semibold">{post.stats.likes.toLocaleString('es')}</span>
                </div>
                <div className="flex items-center gap-1 text-white">
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="text-xs font-semibold">{post.stats.comments.toLocaleString('es')}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

