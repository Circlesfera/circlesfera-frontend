'use client';

import { type ReactElement } from 'react';

import { useFeedStream } from '../hooks/use-feed-stream';
import { CreatePostForm } from './create-post-form';
import { FeedItemComponent } from './feed-item';

/**
 * Renderiza el listado principal del feed con soporte para carga incremental.
 */
export const FeedShell = (): ReactElement => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useFeedStream();

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

