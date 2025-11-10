'use client';

import { useQuery } from '@tanstack/react-query';
import { AnimatePresence,motion } from 'framer-motion';
import Image from 'next/image';
import { lazy, type ReactElement,Suspense, useEffect, useRef, useState } from 'react';

import { StoriesViewerSkeleton } from '@/components/skeletons';
import { getAvatarUrl } from '@/lib/image-utils';
import { fadeUpVariants } from '@/lib/motion-config';
import { getStoryFeed } from '@/services/api/stories';
import { useSessionStore } from '@/store/session';

import { CreateStoryDialog } from './create-story-dialog';

const StoriesViewer = lazy(() =>
  import('./stories-viewer').then((module) => ({
    default: module.StoriesViewer
  }))
);

export function StoriesBar(): ReactElement {
  const currentUser = useSessionStore((state) => state.user);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const isHydrated = useSessionStore((state) => state.isHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);

  const { data, isLoading } = useQuery({
    queryKey: ['stories', 'feed'],
    queryFn: getStoryFeed,
    staleTime: 1000 * 60, // 1 minuto
    // Solo ejecutar cuando la sesión esté hidratada y haya un token
    enabled: isHydrated && !!accessToken
  });

  // Detectar scroll para mostrar/ocultar flechas
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = (): void => {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    };

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [data]);

  if (isLoading) {
    return (
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="relative rounded-2xl glass-card p-4"
      >
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar px-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1.5">
              <div className="animate-pulse size-[64px] rounded-full bg-gradient-to-br from-slate-200 dark:from-slate-800/50 to-slate-100 dark:to-slate-900/50 border-2 border-slate-300/50 dark:border-white/10" />
              <div className="h-3 w-14 bg-slate-200 dark:bg-slate-800/50 rounded-full" />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  const handleStoryClick = (groupIndex: number): void => {
    setSelectedGroupIndex(groupIndex);
    setViewerOpen(true);
  };

  const handleScroll = (direction: 'left' | 'right'): void => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const stories = data?.groups ?? [];
  // Verificar si el usuario actual tiene stories
  const currentUserStoryGroup = stories.find((group) => group.author.id === currentUser?.id);
  const hasStories = stories.length > 0 || currentUser;

  if (!hasStories) {
    return <></>;
  }

  return (
    <>
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="relative rounded-2xl glass-card border border-slate-200/50 dark:border-white/[0.08] p-2.5 md:p-3.5 mb-1 shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
      >
        {/* Flecha izquierda */}
        <AnimatePresence>
          {showLeftArrow && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              type="button"
              onClick={() => {
                handleScroll('left');
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-black/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/20 flex items-center justify-center hover:bg-black/70 dark:hover:bg-black/70 hover:border-white/30 dark:hover:border-white/30 transition-all duration-300 shadow-lg shadow-black/30"
              aria-label="Scroll izquierda"
            >
              <svg className="size-5 text-white dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Container de stories */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar px-2 py-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Story propia - Mostrar si tiene stories, sino botón para crear */}
          {currentUser && (
            <>
              {currentUserStoryGroup ? (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  type="button"
                  onClick={() => {
                    // Buscar el índice del grupo del usuario actual
                    const currentIndex = stories.findIndex((g) => g.author.id === currentUser.id);
                    if (currentIndex !== -1) {
                      handleStoryClick(currentIndex);
                    }
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-shrink-0 flex flex-col items-center gap-2 group"
                >
                  <div className={`relative size-[64px] rounded-full transition-all duration-200 ${
                    currentUserStoryGroup.stories.some((s) => !s.hasViewed)
                      ? 'p-[2.5px] bg-gradient-to-tr from-orange-500 via-pink-500 to-purple-500 group-hover:from-orange-400 group-hover:via-pink-400 group-hover:to-purple-400 group-hover:shadow-lg group-hover:shadow-pink-500/50 group-hover:scale-105' 
                      : 'p-[2px] bg-gradient-to-br from-slate-600/80 to-slate-700/80 group-hover:from-slate-500 group-hover:to-slate-600 group-hover:shadow-lg group-hover:shadow-slate-500/20'
                  }`}>
                    <div className="relative size-full rounded-full bg-black dark:bg-black overflow-hidden ring-2 ring-black/50 dark:ring-black/50 group-hover:ring-primary-500/30 transition-all duration-300">
                      <Image
                        src={getAvatarUrl(currentUser.avatarUrl, currentUser.handle)}
                        alt={currentUser.displayName}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        unoptimized
                        sizes="64px"
                      />
                    </div>
                  </div>
                  <span className="block w-[64px] truncate text-center text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-200">
                    Tu historia
                  </span>
                </motion.button>
              ) : (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              type="button"
              onClick={() => {
                setCreateDialogOpen(true);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
            >
                  <div className="relative size-[64px] overflow-hidden rounded-full border-2 border-slate-300 dark:border-white/30 bg-gradient-to-br from-slate-100 dark:from-slate-900/90 to-white dark:to-black/90 transition-all duration-200 group-hover:border-primary-400/60 group-hover:shadow-lg group-hover:shadow-primary-500/40 group-hover:scale-105 backdrop-blur-sm">
                <Image
                  src={getAvatarUrl(currentUser.avatarUrl, currentUser.handle)}
                  alt={currentUser.displayName}
                  fill
                  className="object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-300"
                  unoptimized
                  sizes="64px"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 dark:bg-black/30 group-hover:bg-black/15 dark:group-hover:bg-black/15 transition-colors duration-300">
                      <div className="size-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/50 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                        <svg className="size-3.5 text-white dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
              </div>
                  <span className="block w-[64px] truncate text-center text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-200">
                Tu historia
              </span>
            </motion.button>
              )}
            </>
          )}

          {/* Stories de usuarios seguidos - Estilo Instagram mejorado */}
          {stories
            .filter((group) => group.author.id !== currentUser?.id) // Excluir el usuario actual (ya está arriba)
            .map((group, index) => {
            // Ajustar el índice para que coincida con el índice real en el array completo
            const realIndex = stories.findIndex((g) => g.author.id === group.author.id);
            const hasUnviewed = group.stories.some((story) => !story.hasViewed);
            
            return (
              <motion.button
                key={group.author.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                type="button"
                onClick={() => {
                  handleStoryClick(realIndex);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 flex flex-col items-center gap-2 group"
              >
                {/* Borde degradado premium para historias no vistas, borde elegante para vistas */}
                <div className={`relative size-[64px] rounded-full transition-all duration-200 ${
                  hasUnviewed 
                    ? 'p-[2.5px] bg-gradient-to-tr from-orange-500 via-pink-500 to-purple-500 group-hover:from-orange-400 group-hover:via-pink-400 group-hover:to-purple-400 group-hover:shadow-lg group-hover:shadow-pink-500/50 group-hover:scale-105' 
                    : 'p-[2px] bg-gradient-to-br from-slate-600/80 to-slate-700/80 group-hover:from-slate-500 group-hover:to-slate-600 group-hover:shadow-lg group-hover:shadow-slate-500/20'
                }`}>
                  <div className="relative size-full rounded-full bg-black overflow-hidden ring-2 ring-black/50 group-hover:ring-primary-500/30 transition-all duration-300">
                    <Image
                      src={getAvatarUrl(group.author.avatarUrl, group.author.handle)}
                      alt={group.author.displayName}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized
                      sizes="64px"
                    />
                    {hasUnviewed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 rounded-full bg-gradient-to-t from-black/30 to-transparent"
                      />
                    )}
                  </div>
                </div>
                <span className="block w-[64px] truncate text-center text-xs font-semibold text-slate-300 group-hover:text-white transition-colors duration-200">
                  {group.author.handle.length > 10 
                    ? `${group.author.handle.slice(0, 10)}...` 
                    : group.author.handle}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Flecha derecha */}
        <AnimatePresence>
          {showRightArrow && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              type="button"
              onClick={() => {
                handleScroll('right');
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-black/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/20 flex items-center justify-center hover:bg-black/70 dark:hover:bg-black/70 hover:border-white/30 dark:hover:border-white/30 transition-all duration-300 shadow-lg shadow-black/30"
              aria-label="Scroll derecha"
            >
              <svg className="size-5 text-white dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Dialog para crear story */}
      <CreateStoryDialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
        }}
      />

      {viewerOpen && data && (
        <Suspense fallback={<StoriesViewerSkeleton />}>
          <StoriesViewer
            groups={data.groups}
            initialGroupIndex={selectedGroupIndex}
            onClose={() => {
              setViewerOpen(false);
            }}
          />
        </Suspense>
      )}
    </>
  );
}
