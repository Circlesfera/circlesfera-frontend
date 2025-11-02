'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Fragment, type ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchExploreFeed } from '@/services/api/feed';
import { formatNumber } from '@/lib/utils';

/**
 * Renderiza el grid de explorar con posts populares.
 */
export const ExploreGridShell = (): ReactElement => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['feed', 'explore'],
    queryFn: ({ pageParam }) => fetchExploreFeed({ cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse bg-slate-800" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="p-6 text-sm text-red-400">Error al cargar el feed de explorar.</div>;
  }

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  if (posts.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-slate-400">
        Aún no hay publicaciones para explorar.
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mb-6 px-6 pt-6">
        <h1 className="text-2xl font-bold text-white">Explorar</h1>
      </div>

      <div className="grid grid-cols-3 gap-1 md:grid-cols-4 lg:grid-cols-5">
        {posts.map((post) => {
          const firstMedia = post.media[0];
          if (!firstMedia) {
            return null;
          }

          return (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="group relative aspect-square overflow-hidden bg-slate-800"
            >
              {firstMedia.kind === 'image' ? (
                <Image
                  src={firstMedia.url}
                  alt={post.caption}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <Fragment>
                  <Image
                    src={firstMedia.thumbnailUrl}
                    alt={post.caption}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
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
              <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex items-center gap-1 text-white">
                  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="text-sm font-semibold">{formatNumber(post.stats.likes)}</span>
                </div>
                <div className="flex items-center gap-1 text-white">
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="text-sm font-semibold">{formatNumber(post.stats.comments)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {hasNextPage ? (
        <button
          type="button"
          onClick={() => {
            void fetchNextPage();
          }}
          disabled={isFetchingNextPage}
          className="mx-auto mt-6 block rounded-full bg-primary-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:bg-slate-700"
        >
          {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
        </button>
      ) : null}
    </section>
  );
};

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

