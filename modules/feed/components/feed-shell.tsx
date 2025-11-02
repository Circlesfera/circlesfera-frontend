'use client';

import { useState, type ReactElement } from 'react';

import { useFeedStream } from '../hooks/use-feed-stream';
import { CreatePostForm } from './create-post-form';
import { FeedItemComponent } from './feed-item';

type SortOption = 'recent' | 'relevance';

/**
 * Renderiza el listado principal del feed con soporte para carga incremental.
 */
export const FeedShell = (): ReactElement => {
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useFeedStream({ sortBy });

  if (status === 'pending') {
    return <div className="p-6 text-sm text-slate-400">Preparando tu experiencia...</div>;
  }

  if (status === 'error') {
    return (
      <div className="p-6 text-sm text-red-400">
        Ocurrió un error al cargar el feed. Intenta nuevamente más tarde.
        <pre className="mt-2 text-xs text-red-500 opacity-80">
          {(error as Error).message}
        </pre>
      </div>
    );
  }

  const items = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <section className="flex w-full flex-col gap-6 p-6">
      {/* Header con opciones de ordenamiento */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white">Tu feed</h2>
        <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/40 p-1">
          <button
            type="button"
            onClick={() => {
              setSortBy('recent');
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              sortBy === 'recent'
                ? 'bg-primary-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Recientes
          </button>
          <button
            type="button"
            onClick={() => {
              setSortBy('relevance');
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              sortBy === 'relevance'
                ? 'bg-primary-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Relevantes
          </button>
        </div>
      </div>

      <CreatePostForm />
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
        <p className="mx-auto mt-2 text-xs text-slate-500">Te mantendremos al tanto de nuevas historias.</p>
      )}
    </section>
  );
};

