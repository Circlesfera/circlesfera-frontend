'use client';

import { lazy, Suspense, useState, type ReactElement } from 'react';
import { motion } from 'framer-motion';

import { useFeedStream } from '../hooks/use-feed-stream';
import { FeedItemComponent } from './feed-item';
import { StoriesBar } from '@/modules/stories/components/stories-bar';
import { SuggestedUsers } from '@/modules/users/components/suggested-users';
import { staggerContainer, staggerItem } from '@/lib/motion-config';

const CreatePostForm = lazy(() =>
  import('./create-post-form').then((module) => ({
    default: module.CreatePostForm
  }))
);

type SortOption = 'recent' | 'relevance';

/**
 * Renderiza el listado principal del feed con soporte para carga incremental.
 */
export const FeedShell = (): ReactElement => {
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useFeedStream({ sortBy });

  if (status === 'pending') {
    return <div className="flex items-center justify-center py-16 text-sm text-slate-400">Preparando tu experiencia...</div>;
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-red-400">
        Ocurrió un error al cargar el feed. Intenta nuevamente más tarde.
        <pre className="mt-2 text-xs text-red-500 opacity-80">
          {(error as Error).message}
        </pre>
      </div>
    );
  }

  const items = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="flex gap-6 lg:gap-8">
      {/* Columna principal - Feed */}
      <section className="flex-1 flex flex-col min-w-0">
      {/* Stories Bar - Estilo Instagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="mb-8"
      >
        <StoriesBar />
      </motion.div>

      {/* Create Post Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        className="mb-8"
      >
        <Suspense
          fallback={
            <div className="animate-pulse px-4">
              <div className="h-24 rounded-lg bg-slate-900/50" />
            </div>
          }
        >
          <CreatePostForm />
        </Suspense>
      </motion.div>

      {/* Posts */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {items.map((item) => (
          <motion.div
            key={item.id}
            variants={staggerItem}
          >
            <FeedItemComponent item={item} />
          </motion.div>
        ))}
      </motion.div>

      {/* Load More */}
      {hasNextPage ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center py-10"
        >
          <button
            type="button"
            onClick={() => {
              void fetchNextPage();
            }}
            disabled={isFetchingNextPage}
            className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-8 py-3 text-sm font-semibold text-white hover:from-primary-500 hover:via-accent-500 hover:to-primary-600 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/50 active:scale-95"
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
      ) : items.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center py-12 text-center"
        >
          <div className="rounded-xl glass-card px-6 py-4">
            <p className="text-sm font-medium text-slate-400">Has visto todo lo nuevo por ahora ✨</p>
          </div>
        </motion.div>
      ) : null}
      </section>

      {/* Sidebar derecho - Usuarios sugeridos (solo desktop) */}
      <aside className="hidden lg:block w-80 shrink-0">
        <SuggestedUsers />
      </aside>
    </div>
  );
};
