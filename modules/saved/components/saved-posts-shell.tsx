'use client';

import { useState, type ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchSavedPosts, type SavedPostsResponse } from '@/services/api/saves';
import { FeedItemComponent } from '@/modules/feed/components/feed-item';
import { CollectionsSidebar } from './collections-sidebar';

/**
 * Renderiza el listado de posts guardados con soporte para carga incremental y colecciones.
 */
export function SavedPostsShell(): ReactElement {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useInfiniteQuery<SavedPostsResponse>({
    queryKey: ['saved', selectedCollectionId],
    queryFn: ({ pageParam }) => fetchSavedPosts(pageParam as string | null | undefined, 20, selectedCollectionId ?? undefined),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 60000
  });

  if (status === 'pending') {
    return <div className="p-6 text-sm text-slate-400">Cargando posts guardados...</div>;
  }

  if (status === 'error') {
    return (
      <div className="p-6 text-sm text-red-400">
        Ocurrió un error al cargar los posts guardados. Intenta nuevamente más tarde.
        <pre className="mt-2 text-xs text-red-500 opacity-80">
          {(error as Error).message}
        </pre>
      </div>
    );
  }

  const items = data?.pages.flatMap((page) => page.data) ?? [];

  if (items.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-6">
        <svg className="size-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-300">No hay posts guardados</h2>
          <p className="mt-1 text-sm text-slate-500">Guarda posts que te gusten para verlos aquí más tarde</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full">
      <CollectionsSidebar selectedCollectionId={selectedCollectionId} onSelectCollection={setSelectedCollectionId} />

      <section className="flex flex-1 flex-col gap-6 p-6">
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
          <p className="mx-auto mt-2 text-xs text-slate-500">Has visto todos tus posts guardados.</p>
        )}
      </section>
    </div>
  );
}

