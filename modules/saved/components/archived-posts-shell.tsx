'use client';

import { type ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { FeedItemComponent } from '@/modules/feed/components/feed-item';
import { getArchivedPosts } from '@/services/api/feed';

/**
 * Renderiza el listado de posts archivados con soporte para carga incremental.
 */
export function ArchivedPostsShell(): ReactElement {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['feed', 'archived'],
    queryFn: ({ pageParam }) => getArchivedPosts({ cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-slate-400">Cargando posts archivados...</div>;
  }

  if (isError) {
    return <div className="py-16 text-center text-sm text-red-400">Error al cargar los posts archivados.</div>;
  }

  const items = data?.pages.flatMap((page) => page.data) ?? [];

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-slate-400">
        No tienes posts archivados aún. Puedes archivar posts desde el menú de opciones de cada publicación.
      </div>
    );
  }

  return (
    <section className="flex w-full flex-col gap-6">
      {items.map((item) => (
        <FeedItemComponent key={item.id} item={item} isArchivedPage />
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
        <p className="mx-auto mt-2 text-xs text-slate-500">No hay más posts archivados.</p>
      )}
    </section>
  );
}

