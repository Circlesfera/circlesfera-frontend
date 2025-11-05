'use client';

import React, { useState, useEffect, useRef, useCallback, type ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

import { getReelsFeed } from '../../../services/api/feed';
import type { FeedItem } from '../../../services/api/types/feed';
import { ReelPlayer } from './reel-player';

export function ReelsShell(): ReactElement {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['reels'],
    queryFn: ({ pageParam }: { pageParam: string | null }) =>
      getReelsFeed({
        limit: 10,
        cursor: pageParam
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    staleTime: 60000
  });

  const reels = data?.pages.flatMap((page) => page.data) ?? [];

  // Pre-cargar el siguiente reel cuando estamos cerca del final
  useEffect(() => {
    if (currentIndex >= reels.length - 3 && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [currentIndex, reels.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Navegación con debounce
  const navigateToReel = useCallback((index: number, direction: 'next' | 'prev'): void => {
    if (isNavigating || index < 0 || index >= reels.length) {
      return;
    }

    setIsNavigating(true);
    setCurrentIndex(index);

    // Limpiar timeout anterior
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Permitir navegación después de la animación
    scrollTimeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
    }, 500);
  }, [isNavigating, reels.length]);

  const handleNext = useCallback((): void => {
    if (currentIndex < reels.length - 1) {
      navigateToReel(currentIndex + 1, 'next');
    }
  }, [currentIndex, reels.length, navigateToReel]);

  const handlePrevious = useCallback((): void => {
    if (currentIndex > 0) {
      navigateToReel(currentIndex - 1, 'prev');
    }
  }, [currentIndex, navigateToReel]);

  // Manejar scroll vertical con mejor UX
  useEffect(() => {
    const container = containerRef.current;
    if (!container || reels.length === 0) {
      return;
    }

    let touchStartY = 0;
    let touchStartTime = 0;
    let isScrolling = false;

    const handleWheel = (e: WheelEvent): void => {
      if (isNavigating || isScrolling) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
        isScrolling = true;

      if (e.deltaY > 30 && currentIndex < reels.length - 1) {
        handleNext();
      } else if (e.deltaY < -30 && currentIndex > 0) {
        handlePrevious();
      }

        setTimeout(() => {
          isScrolling = false;
      }, 800);
    };

    const handleTouchStart = (e: TouchEvent): void => {
      const touch = e.touches[0];
      if (touch) {
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
      }
    };

    const handleTouchEnd = (e: TouchEvent): void => {
      const touch = e.changedTouches[0];
      if (!touch) return;

      const touchEndY = touch.clientY;
      const touchEndTime = Date.now();
      const diff = touchStartY - touchEndY;
      const timeDiff = touchEndTime - touchStartTime;

      // Swipe más rápido y significativo (mínimo 100px en menos de 300ms)
      if (Math.abs(diff) > 100 && timeDiff < 300) {
        if (diff > 0 && currentIndex < reels.length - 1) {
          handleNext();
        } else if (diff < 0 && currentIndex > 0) {
          handlePrevious();
        }
      }
    };

    // Soporte para teclado (flechas arriba/abajo)
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowDown' && currentIndex < reels.length - 1) {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        handlePrevious();
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentIndex, reels.length, isNavigating, handleNext, handlePrevious]);

  // Estado de carga
  if (status === 'pending') {
    return (
      <div className="relative flex h-screen items-center justify-center bg-black dark:bg-black">
        {/* Background effects consistentes con el diseño del proyecto */}
        <div className="pointer-events-none fixed inset-0 bg-hero-grid bg-[length:80px_80px] opacity-[0.15]" aria-hidden />
        <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-primary-500/3 via-transparent to-accent-500/3" aria-hidden />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mx-auto mb-6 size-16">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-primary-500/20 blur-2xl" />
            <div className="relative flex size-full items-center justify-center">
              <div className="size-12 animate-spin rounded-full border-4 border-primary-500/30 border-t-primary-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white dark:text-white">Cargando Reels</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Preparando contenido para ti...</p>
        </motion.div>
      </div>
    );
  }

  // Estado vacío
  if (reels.length === 0) {
    return (
      <div className="relative flex h-screen items-center justify-center bg-black dark:bg-black">
        {/* Background effects consistentes con el diseño del proyecto */}
        <div className="pointer-events-none fixed inset-0 bg-hero-grid bg-[length:80px_80px] opacity-[0.15]" aria-hidden />
        <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-primary-500/3 via-transparent to-accent-500/3" aria-hidden />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md px-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative mx-auto mb-6"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-primary-500/20 blur-2xl" />
            <div className="relative flex size-24 items-center justify-center rounded-2xl glass-card border border-primary-500/30 shadow-elegant-lg">
              <svg className="size-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold text-white dark:text-white mb-2">No hay reels disponibles</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Los reels son videos cortos verticales de hasta 60 segundos. ¡Sé el primero en crear uno!
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const currentReel = reels[currentIndex];
  const prevReel = currentIndex > 0 ? reels[currentIndex - 1] : null;
  const nextReel = currentIndex < reels.length - 1 ? reels[currentIndex + 1] : null;

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-black dark:bg-black">
      {/* Background effects consistentes con el diseño del proyecto */}
      <div className="pointer-events-none fixed inset-0 bg-hero-grid bg-[length:80px_80px] opacity-[0.15]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-primary-500/3 via-transparent to-accent-500/3" aria-hidden />
      <AnimatePresence mode="wait" initial={false}>
      {currentReel && (
          <motion.div
            key={currentReel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
        <ReelPlayer
          reel={currentReel}
          isActive={true}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pre-cargar reels adyacentes (ocultos) para mejor performance */}
      {prevReel && (
        <div className="absolute inset-0 pointer-events-none opacity-0">
          <ReelPlayer reel={prevReel} isActive={false} onNext={() => {}} onPrevious={() => {}} />
        </div>
      )}
      {nextReel && (
        <div className="absolute inset-0 pointer-events-none opacity-0">
          <ReelPlayer reel={nextReel} isActive={false} onNext={() => {}} onPrevious={() => {}} />
        </div>
      )}

      {/* Indicador de posición mejorado */}
      <div className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
        <div className="flex flex-col gap-2.5 rounded-2xl bg-black/60 dark:bg-black/60 backdrop-blur-md p-2.5 border border-white/10 dark:border-white/10">
          {reels.slice(Math.max(0, currentIndex - 2), Math.min(reels.length, currentIndex + 3)).map((_, i) => {
            const actualIndex = Math.max(0, currentIndex - 2) + i;
            const isActive = actualIndex === currentIndex;
            return (
              <motion.div
                key={reels[actualIndex]?.id ?? `indicator-${actualIndex}`}
                initial={false}
                animate={{
                  width: isActive ? 4 : 3,
                  height: isActive ? 32 : 3,
                  opacity: isActive ? 1 : 0.4
                }}
                transition={{ duration: 0.2 }}
                className={`rounded-full transition-colors ${
                  isActive ? 'bg-white' : 'bg-white/50'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Indicador de carga de más contenido */}
      {isFetchingNextPage && (
        <div className="absolute bottom-20 left-1/2 z-30 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-black/60 dark:bg-black/60 backdrop-blur-md px-4 py-2 border border-white/10 dark:border-white/10">
            <div className="size-2 animate-pulse rounded-full bg-primary-400" />
            <span className="text-xs font-medium text-white dark:text-white">Cargando más...</span>
          </div>
        </div>
      )}
    </div>
  );
}
