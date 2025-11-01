'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { getUserPosts, type UserPostsResponse } from '@/services/api/users';

interface ProfilePostsGridProps {
  readonly handle: string;
}

export function ProfilePostsGrid({ handle }: ProfilePostsGridProps): ReactElement {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery<UserPostsResponse>({
    queryKey: ['userPosts', handle],
    queryFn: ({ pageParam }) => getUserPosts({ handle, cursor: pageParam as string | null | undefined, limit: 20 }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 60000
  });

  if (status === 'pending') {
    return (
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-slate-900/40 p-6 text-center text-sm text-white/50">
        No se pudieron cargar las publicaciones
      </div>
    );
  }

  const posts = data.pages.flatMap((page) => page.data);

  if (posts.length === 0) {
    return (
      <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-slate-900/40 p-6 text-center text-sm text-white/50">
        Este usuario aún no ha publicado nada
      </div>
    );
  }

  return (
    <section className="w-full max-w-5xl">
      <div className="grid grid-cols-3 gap-1">
        {posts.map((post) => {
          const firstMedia = post.media[0];
          if (!firstMedia) {
            return null;
          }

          return (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="group relative aspect-square overflow-hidden rounded bg-slate-800"
            >
              {firstMedia.kind === 'image' ? (
                <Image
                  src={firstMedia.url}
                  alt={post.caption}
                  fill
                  className="object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="relative size-full">
                  <Image
                    src={firstMedia.thumbnailUrl}
                    alt={post.caption}
                    fill
                    className="object-cover transition group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="size-8 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Overlay con estadísticas en hover */}
              <div className="absolute inset-0 flex items-center justify-center gap-6 bg-black/60 opacity-0 transition group-hover:opacity-100">
                <div className="flex items-center gap-1 text-white">
                  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="font-semibold">{post.stats.likes.toLocaleString('es')}</span>
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
                  <span className="font-semibold">{post.stats.comments.toLocaleString('es')}</span>
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
}

