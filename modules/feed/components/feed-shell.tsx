'use client';

import Image from 'next/image';
import { Fragment, type ReactElement } from 'react';

import { useFeedStream } from '../hooks/use-feed-stream';
import { formatRelativeTime } from '../utils/formatters';

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
      {items.map((item) => (
        <article
          key={item.id}
          className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-soft-lg"
        >
          <header className="flex items-center gap-3 px-6 py-4">
            <Image
              src={item.author.avatarUrl}
              alt={item.author.displayName}
              width={48}
              height={48}
              className="size-12 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-slate-50">{item.author.displayName}</span>
              <span className="text-sm text-slate-400">
                @{item.author.handle} • {formatRelativeTime(item.createdAt)}
              </span>
            </div>
          </header>

          <div className="flex flex-col gap-4 px-6">
            <p className="text-base text-slate-100">{item.caption}</p>

            {item.media.map((media) => (
              <Fragment key={media.id}>
                {media.kind === 'image' ? (
                  <Image
                    src={media.url}
                    alt={item.caption}
                    width={media.width ?? 1080}
                    height={media.height ?? 1920}
                    className="max-h-[640px] w-full rounded-2xl object-cover"
                  />
                ) : (
                  <video
                    src={media.url}
                    poster={media.thumbnailUrl}
                    controls
                    preload="metadata"
                    className="max-h-[640px] w-full rounded-2xl"
                  />
                )}
              </Fragment>
            ))}
          </div>

          <footer className="flex items-center justify-between px-6 py-4 text-sm text-slate-300">
            <div className="flex items-center gap-4">
              <span>❤️ {item.stats.likes.toLocaleString('es')}</span>
              <span>💬 {item.stats.comments.toLocaleString('es')}</span>
              <span>🔁 {item.stats.shares.toLocaleString('es')}</span>
            </div>
            <span className="text-xs text-slate-500">
              {item.stats.views.toLocaleString('es')} visualizaciones
            </span>
          </footer>
        </article>
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

