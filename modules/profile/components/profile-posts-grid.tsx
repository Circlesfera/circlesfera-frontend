'use client';

import { type InfiniteData,useInfiniteQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { isFrameFeedItem } from '@/modules/frames/utils/is-frame-feed-item';
import { getSafeMediaUrl } from '@/modules/frames/utils/media';
import type { FeedCursorResponse, FeedItem, FeedMedia } from '@/services/api/types/feed';
import { getUserPosts } from '@/services/api/users';

interface ProfilePostsGridProps {
  readonly handle: string;
}

type ProfilePostsQueryKey = ['profile', 'posts', string];

export function ProfilePostsGrid({ handle }: ProfilePostsGridProps): ReactElement {
  const queryKey = useMemo<ProfilePostsQueryKey>(() => ['profile', 'posts', handle], [handle]);

  const postsQuery = useInfiniteQuery<
    FeedCursorResponse,
    Error,
    InfiniteData<FeedCursorResponse>,
    ProfilePostsQueryKey,
    string | null
  >({
    queryKey,
    queryFn: async ({ pageParam }) =>
      getUserPosts({ handle, cursor: pageParam ?? undefined, limit: 12 }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    staleTime: 60_000
  });

  const posts = useMemo<FeedItem[]>(() => {
    const items = postsQuery.data?.pages.flatMap((page) => page.data) ?? [];
    return items.filter((item) => !isFrameFeedItem(item));
  }, [postsQuery.data]);

  const isInitialLoading = postsQuery.status === 'pending' && posts.length === 0;

  if (isInitialLoading) {
    return <ProfilePostsSkeleton />;
  }

  if (postsQuery.status === 'success' && posts.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-12 text-center">
        <p className="text-sm font-semibold text-foreground-muted">Este perfil aún no tiene publicaciones.</p>
      </div>
    );
  }

  if (postsQuery.status === 'error' && posts.length === 0) {
    const message = postsQuery.error instanceof Error ? postsQuery.error.message : 'No se pudieron cargar las publicaciones.';
    return (
      <div className="space-y-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
        <p className="text-sm font-semibold text-red-300">Ocurrió un error al cargar las publicaciones.</p>
        <p className="text-xs text-red-200/80">{message}</p>
        <button
          type="button"
          onClick={() => {
            void postsQuery.refetch();
          }}
          className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-400"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const cover = getPrimaryMedia(post.media);
          if (!cover) {
            return null;
          }

          const safeCoverUrl = getSafeMediaUrl(cover.previewUrl);
          if (!safeCoverUrl) {
            return null;
          }

          return (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 shadow-lg transition hover:shadow-primary-500/20"
            >
              <div className="relative aspect-[4/5] w-full" data-post-preview="true">
                {cover.kind === 'image' ? (
                  <Image
                    src={safeCoverUrl}
                    alt={post.caption ?? 'Publicación sin descripción'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <video
                    src={cover.sourceUrl}
                    poster={safeCoverUrl}
                    className="absolute inset-0 h-full w-full object-cover"
                    preload="metadata"
                    muted
                    loop
                    playsInline
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {postsQuery.hasNextPage ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              void postsQuery.fetchNextPage();
            }}
            disabled={postsQuery.isFetchingNextPage}
            className="rounded-xl bg-primary-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {postsQuery.isFetchingNextPage ? 'Cargando...' : 'Ver más'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function getPrimaryMedia(media?: FeedMedia[]): {
  isPortrait: boolean;
  previewUrl: string;
  sourceUrl: string;
  kind: FeedMedia['kind'];
} | null {
  if (!media || media.length === 0) {
    return null;
  }

  const [primary] = media;
  if (!primary) {
    return null;
  }

  const width = primary.width ?? (primary.kind === 'video' ? 9 : 4);
  const height = primary.height ?? (primary.kind === 'video' ? 16 : 5);
  const isPortrait = height / width >= 1;

  return {
    isPortrait,
    previewUrl: primary.thumbnailUrl ?? primary.url,
    sourceUrl: primary.url,
    kind: primary.kind
  };
}

function ProfilePostsSkeleton(): ReactElement {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="aspect-[4/5] animate-pulse rounded-3xl bg-slate-800/60" />
      ))}
    </div>
  );
}

