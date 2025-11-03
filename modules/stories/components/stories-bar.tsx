'use client';

import Image from 'next/image';
import { lazy, Suspense, useRef, useEffect, useState, type ReactElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { getStoryFeed, type StoryGroup } from '@/services/api/stories';
import { useQuery } from '@tanstack/react-query';
import { useSessionStore } from '@/store/session';
import { StoriesViewerSkeleton } from '@/components/skeletons';
import { getAvatarUrl } from '@/lib/image-utils';
import { CreateStoryDialog } from './create-story-dialog';
import { fadeUpVariants, staggerContainer, staggerItem } from '@/lib/motion-config';

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

  const { data, isLoading } = useQuery({
    queryKey: ['stories', 'feed'],
    queryFn: getStoryFeed,
    staleTime: 1000 * 60 // 1 minuto
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
        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar px-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1.5">
              <div className="animate-pulse size-[77px] rounded-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-white/10" />
              <div className="h-3 w-16 bg-slate-800/50 rounded-full" />
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
        className="relative rounded-2xl glass-card p-4 md:p-5 mb-1"
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
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full glass-dark border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all shadow-elegant-lg backdrop-blur-xl"
              aria-label="Scroll izquierda"
            >
              <svg className="size-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Container de stories */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Story propia - Con botón para crear */}
          {currentUser && (
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
              <div className="relative size-[78px] overflow-hidden rounded-full border-2 border-white/20 bg-gradient-to-br from-slate-900 to-black transition-all duration-300 group-hover:border-primary-400/50 group-hover:shadow-lg group-hover:shadow-primary-500/30">
                <Image
                  src={getAvatarUrl(currentUser.avatarUrl, currentUser.handle)}
                  alt={currentUser.displayName}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  unoptimized
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                  <div className="size-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="size-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
              </div>
              <span className="block w-[78px] truncate text-center text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                Tu historia
              </span>
            </motion.button>
          )}

          {/* Stories de usuarios seguidos - Estilo Instagram mejorado */}
          {stories.map((group, index) => {
            const hasUnviewed = group.stories.some((story) => !story.hasViewed);
            
            return (
              <motion.button
                key={group.author.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                type="button"
                onClick={() => {
                  handleStoryClick(index);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 flex flex-col items-center gap-2 group"
              >
                {/* Borde degradado premium para historias no vistas, borde elegante para vistas */}
                <div className={`relative size-[78px] rounded-full transition-all duration-300 ${
                  hasUnviewed 
                    ? 'p-[2.5px] bg-gradient-to-tr from-orange-500 via-pink-500 to-purple-500 group-hover:from-orange-400 group-hover:via-pink-400 group-hover:to-purple-400 group-hover:shadow-lg group-hover:shadow-pink-500/40' 
                    : 'p-[2px] bg-gradient-to-br from-slate-600 to-slate-700 group-hover:from-slate-500 group-hover:to-slate-600'
                }`}>
                  <div className="relative size-full rounded-full bg-black overflow-hidden ring-2 ring-black group-hover:ring-primary-500/20 transition-all">
                    <Image
                      src={getAvatarUrl(group.author.avatarUrl, group.author.handle)}
                      alt={group.author.displayName}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized
                    />
                    {hasUnviewed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent"
                      />
                    )}
                  </div>
                </div>
                <span className="block w-[78px] truncate text-center text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                  {group.author.handle.length > 12 
                    ? `${group.author.handle.slice(0, 12)}...` 
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
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full glass-dark border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all shadow-elegant-lg backdrop-blur-xl"
              aria-label="Scroll derecha"
            >
              <svg className="size-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
