'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { type ReactElement } from 'react';

import { FeedItemComponent } from '@/modules/feed/components/feed-item';
import { getHashtagPosts } from '@/services/api/hashtags';

/**
 * Renderiza el listado de posts de un hashtag con soporte para carga incremental.
 */
export function HashtagPostsShell({ tag }: { tag: string }): ReactElement {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['hashtag-posts', tag],
    queryFn: ({ pageParam }) => getHashtagPosts({ tag, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-slate-400">Cargando publicaciones...</div>;
  }

  if (isError) {
    return <div className="py-16 text-center text-sm text-red-400">Error al cargar las publicaciones.</div>;
  }

  const items = data?.pages.flatMap((page) => page.data) ?? [];

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-slate-400">
        Aún no hay publicaciones con este hashtag.
      </div>
    );
  }

  return (
    <section className="flex w-full max-w-4xl flex-col gap-6">
      {items.map((item) => (
        <FeedItemComponent key={item.id} item={item} />
      ))}

      {hasNextPage ? (
        <button
          type="button"
          onClick={() => {
            void fetchNextPage();
          }}
          disabled={isFetchingNextPage}
          className="mx-auto mt-2 rounded-full bg-primary-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:bg-slate-700"
        >
          {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
        </button>
      ) : (
        <p className="mx-auto mt-2 text-xs text-slate-500">No hay más publicaciones.</p>
      )}
    </section>
  );
}

