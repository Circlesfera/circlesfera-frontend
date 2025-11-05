'use client';

import { useEffect, useRef, type ReactElement } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';

import { useFeedStream } from '../hooks/use-feed-stream';
import { FeedItemComponent as FeedItem } from './feed-item';
import { CreatePostForm } from './create-post-form';
import { StoriesBar } from '@/modules/stories/components/stories-bar';
import { SuggestedUsers } from '@/modules/users/components/suggested-users';
import { fadeUpVariants } from '@/lib/motion-config';

/**
 * Renderiza el feed principal con soporte para carga incremental, diseño moderno
 * y mejor experiencia de usuario.
 */
export const FeedShell = (): ReactElement => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error, refetch } = useFeedStream();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(loadMoreRef, { once: false, margin: '200px' });

  // Cargar más posts automáticamente cuando el elemento de carga es visible
  useEffect(() => {
    if (isInView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [isInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items = data?.pages.flatMap((page) => page.data) ?? [];

  // Estado de carga inicial
  if (status === 'pending') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-6 rounded-2xl glass-card p-12 shadow-elegant-lg"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-primary-500/20 blur-2xl animate-pulse" />
            <div className="relative size-16 animate-spin rounded-full border-[3px] border-primary-500/20 border-t-primary-500" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Preparando tu feed</h3>
            <p className="text-sm text-slate-400">Cargando las últimas publicaciones...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Estado de error
  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full rounded-2xl glass-card border border-red-500/20 bg-red-500/5 p-8"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />
              <div className="relative size-12 rounded-full border-2 border-red-500/50 bg-red-500/10 flex items-center justify-center">
                <svg className="size-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Error al cargar el feed</h3>
              <p className="text-sm text-white/60 mb-4">
                Ocurrió un error al cargar las publicaciones. Intenta nuevamente más tarde.
              </p>
              {error instanceof Error && (
                <p className="text-xs text-red-400/80 font-mono bg-black/30 rounded-lg p-2 mb-4">
                  {error.message}
                </p>
              )}
            </div>
            <motion.button
              type="button"
              onClick={() => {
                void refetch();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/40"
            >
              Reintentar
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Estado vacío
  if (items.length === 0 && !isFetchingNextPage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-6 rounded-2xl glass-card p-12 max-w-md shadow-elegant-lg"
        >
          <motion.div 
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-primary-500/20 blur-2xl" />
            <div className="relative size-24 rounded-2xl border border-primary-500/30 bg-gradient-to-br from-slate-900/50 to-black/50 backdrop-blur-sm flex items-center justify-center shadow-elegant">
              <svg className="size-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </motion.div>
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-white mb-2">Tu feed está vacío</h3>
            <p className="text-sm text-slate-400 mb-6">
              Comienza a seguir a otros usuarios para ver sus publicaciones aquí
            </p>
            <CreatePostForm />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      {/* Layout de dos columnas en desktop, una columna en móvil */}
      <div className="w-full max-w-7xl lg:max-w-none mx-auto px-4 md:px-6 lg:pl-6 lg:pr-0 py-6 md:py-8">
        <div className="flex items-start gap-6 lg:gap-8 justify-center">
          {/* Columna principal - Feed (siempre centrado) */}
          <div className="w-full max-w-sm">
            {/* Stories Bar */}
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6"
            >
              <StoriesBar />
            </motion.div>

            {/* Formulario de crear post */}
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8"
            >
              <CreatePostForm
                onSuccess={() => {
                  void refetch();
                }}
              />
            </motion.div>

            {/* Lista de posts */}
            <section className="flex w-full flex-col">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ 
                    duration: 0.5,
                    delay: Math.min(index * 0.05, 0.4) + 0.2,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className="mb-8 last:mb-0"
                >
                  <FeedItem item={item} />
                </motion.div>
              ))}

              {/* Indicador de carga automática */}
              {hasNextPage && (
                <div ref={loadMoreRef} className="flex items-center justify-center py-12">
                  {isFetchingNextPage ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col items-center gap-4"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-2xl animate-pulse" />
                        <div className="relative size-10 animate-spin rounded-full border-[3px] border-primary-500/20 border-t-primary-500" />
                      </div>
                      <p className="text-sm text-slate-400 font-medium">Cargando más publicaciones...</p>
                    </motion.div>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={() => {
                        void fetchNextPage();
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-primary-500/10"
                    >
                      Cargar más
                    </motion.button>
                  )}
                </div>
              )}

              {/* Mensaje de fin del feed */}
              {!hasNextPage && items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center justify-center py-12 px-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-primary-500/10 blur-2xl" />
                    <div className="relative rounded-2xl glass-card p-8 text-center max-w-md shadow-elegant-lg">
                      <div className="mb-4 flex justify-center">
                        <div className="size-16 rounded-full border-2 border-primary-500/30 bg-gradient-to-br from-slate-900/50 to-black/50 backdrop-blur-sm flex items-center justify-center shadow-elegant">
                          <svg className="size-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">¡Has visto todo!</h3>
                      <p className="text-sm text-slate-400">
                        Has llegado al final de tu feed. Revisa más tarde para ver nuevas publicaciones.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </section>
          </div>

          {/* Columna lateral - Usuarios sugeridos (solo visible en desktop) */}
          <aside className="hidden lg:block w-80 shrink-0 mr-0">
            <SuggestedUsers />
          </aside>
        </div>
      </div>
    </div>
  );
};
