'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { type ReactElement,useState } from 'react';

import { fadeUpVariants, staggerContainer, staggerItem } from '@/lib/motion-config';
import { FeedItemComponent } from '@/modules/feed/components/feed-item';
import { fetchSavedPosts, type SavedPostsResponse } from '@/services/api/saves';
import { useSessionStore } from '@/store/session';

import { CollectionsSidebar } from './collections-sidebar';

/**
 * Renderiza el listado de posts guardados con soporte para carga incremental y colecciones.
 */
export function SavedPostsShell(): ReactElement {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useInfiniteQuery<SavedPostsResponse>({
    queryKey: ['saved', selectedCollectionId],
    queryFn: ({ pageParam }) => fetchSavedPosts(pageParam as string | null | undefined, 20, selectedCollectionId ?? undefined),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 60000,
    // Solo ejecutar cuando la sesión esté hidratada y haya un token
    enabled: isHydrated && !!accessToken
  });

  if (status === 'pending') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="size-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Cargando posts guardados...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl glass-card p-8 text-center"
      >
        <div className="size-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="size-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-red-400 mb-2">
          Ocurrió un error al cargar los posts guardados
        </p>
        <p className="text-xs text-slate-500">
          Intenta nuevamente más tarde
        </p>
        <pre className="mt-3 text-xs text-red-500/80 opacity-80">
          {(error).message}
        </pre>
      </motion.div>
    );
  }

  const items = data?.pages.flatMap((page) => page.data) ?? [];

  if (items.length === 0) {
    return (
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="flex min-h-[500px] flex-col items-center justify-center"
      >
        <div className="rounded-2xl glass-card p-12 text-center max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mb-6 mx-auto"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 via-primary-400/20 to-accent-500/20 blur-2xl" />
            <div className="relative size-24 rounded-2xl border border-primary-500/30 bg-gradient-to-br from-slate-100 dark:from-slate-900/50 to-white dark:to-black/50 backdrop-blur-sm flex items-center justify-center shadow-elegant">
              <svg className="size-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No hay posts guardados</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Guarda posts que te gusten para verlos aquí más tarde</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex w-full">
      <CollectionsSidebar selectedCollectionId={selectedCollectionId} onSelectCollection={setSelectedCollectionId} />

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-1 flex-col items-center gap-8 p-6"
      >
        <div className="w-full max-w-sm">
          {items.map((item) => (
            <motion.div key={item.id} variants={staggerItem} className="mb-8 last:mb-0">
              <FeedItemComponent item={item} />
            </motion.div>
          ))}

          {hasNextPage ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center pt-4"
            >
              <motion.button
                type="button"
                onClick={() => {
                  void fetchNextPage();
                }}
                disabled={isFetchingNextPage}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
              >
                {isFetchingNextPage ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Cargando...
                  </span>
                ) : (
                  'Cargar más'
                )}
              </motion.button>
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mx-auto mt-4 text-center text-sm text-slate-500"
            >
              Has visto todos tus posts guardados.
            </motion.p>
          )}
        </div>
      </motion.section>
    </div>
  );
}

