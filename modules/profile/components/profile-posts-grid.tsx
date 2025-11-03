'use client';

import Image from 'next/image';
import Link from 'next/link';
import { isLocalImage } from '@/lib/image-utils';
import { type ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { getUserPosts, type UserPostsResponse } from '@/services/api/users';
import { staggerContainer, staggerItem } from '@/lib/motion-config';

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
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl glass-card" />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full max-w-5xl rounded-2xl glass-card p-8 text-center">
        <div className="size-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
          <svg className="size-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-300">No se pudieron cargar las publicaciones</p>
      </div>
    );
  }

  const posts = data.pages.flatMap((page) => page.data);

  if (posts.length === 0) {
    return (
      <div className="w-full max-w-5xl rounded-2xl glass-card p-8 text-center">
        <div className="size-12 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center mx-auto mb-3">
          <svg className="size-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-300 mb-1">Este usuario aún no ha publicado nada</p>
        <p className="text-xs text-slate-500">Las publicaciones aparecerán aquí cuando se creen</p>
      </div>
    );
  }

  return (
    <section className="w-full max-w-5xl">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-2 sm:gap-3"
      >
        {posts.map((post) => {
          const firstMedia = post.media[0];
          if (!firstMedia) {
            return null;
          }

          return (
            <motion.div
              key={post.id}
              variants={staggerItem}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href={`/posts/${post.id}`}
                className="group relative aspect-square overflow-hidden rounded-xl bg-slate-900 block"
              >
                {firstMedia.kind === 'image' ? (
                  <Image
                    src={firstMedia.url}
                    alt={post.caption}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized={isLocalImage(firstMedia.url)}
                  />
                ) : (
                  <div className="relative size-full">
                    <Image
                      src={firstMedia.thumbnailUrl}
                      alt={post.caption}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      unoptimized={isLocalImage(firstMedia.thumbnailUrl)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="size-12 rounded-full glass-dark flex items-center justify-center">
                        <svg className="size-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overlay con estadísticas en hover */}
                <div className="absolute inset-0 flex items-center justify-center gap-6 bg-gradient-to-t from-black/80 via-black/40 to-black/10 opacity-0 transition-all duration-300 group-hover:opacity-100 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-white">
                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="font-bold text-base">{post.stats.likes.toLocaleString('es')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span className="font-bold text-base">{post.stats.comments.toLocaleString('es')}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {hasNextPage ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-10 text-center"
        >
          <button
            type="button"
            onClick={() => {
              void fetchNextPage();
            }}
            disabled={isFetchingNextPage}
            className="mx-auto rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/40 transition-all duration-300 hover:from-primary-500 hover:via-accent-500 hover:to-primary-600 hover:shadow-xl hover:shadow-primary-500/50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetchingNextPage ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Cargando...
              </span>
            ) : (
              'Cargar más'
            )}
          </button>
        </motion.div>
      ) : null}
    </section>
  );
}

