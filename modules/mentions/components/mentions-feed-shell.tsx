'use client';

import { type ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchMentionsFeed } from '@/services/api/feed';
import { FeedItemComponent } from '@/modules/feed/components/feed-item';
import { useSessionStore } from '@/store/session';

/**
 * Renderiza el feed de menciones (posts donde el usuario fue mencionado).
 */
export function MentionsFeedShell(): ReactElement {
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useInfiniteQuery({
    queryKey: ['feed', 'mentions'],
    queryFn: ({ pageParam }) => fetchMentionsFeed({ cursor: (pageParam as string | null) ?? null }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    staleTime: 15_000,
    enabled: isHydrated && Boolean(accessToken)
  });

  if (status === 'pending') {
    return <div className="p-6 text-sm text-slate-400">Cargando menciones...</div>;
  }

  if (status === 'error') {
    return (
      <div className="p-6 text-sm text-red-400">
        Ocurrió un error al cargar las menciones. Intenta nuevamente más tarde.
        <pre className="mt-2 text-xs text-red-500 opacity-80">{(error as Error).message}</pre>
      </div>
    );
  }

  const items = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <section className="flex w-full flex-col gap-6 p-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white">Menciones</h1>
        <p className="mt-1 text-sm text-slate-400">Publicaciones donde fuiste mencionado</p>
      </div>

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-slate-400">No tienes menciones aún</p>
          <p className="mt-2 text-sm text-slate-500">Las publicaciones donde te mencionen aparecerán aquí</p>
        </div>
      ) : (
        <>
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
            <p className="mx-auto mt-2 text-xs text-slate-500">No hay más menciones</p>
          )}
        </>
      )}
    </section>
  );
}

