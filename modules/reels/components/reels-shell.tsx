'use client';

import React, { useState, useEffect, useRef, type ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { getReelsFeed } from '../../../services/api/feed';
import type { FeedItem } from '../../../services/api/types/feed';
import { ReelPlayer } from './reel-player';

export function ReelsShell(): ReactElement {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
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

  // Cargar más cuando se está cerca del final
  useEffect(() => {
    if (currentIndex >= reels.length - 2 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [currentIndex, reels.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Manejar scroll vertical
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let isScrolling = false;
    let touchStartY = 0;
    let touchEndY = 0;

    const handleWheel = (e: WheelEvent): void => {
      if (isScrolling) {
        return;
      }

      e.preventDefault();

      if (e.deltaY > 0 && currentIndex < reels.length - 1) {
        // Scroll hacia abajo - siguiente reel
        isScrolling = true;
        setCurrentIndex((prev) => prev + 1);
        setTimeout(() => {
          isScrolling = false;
        }, 500);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        // Scroll hacia arriba - reel anterior
        isScrolling = true;
        setCurrentIndex((prev) => prev - 1);
        setTimeout(() => {
          isScrolling = false;
        }, 500);
      }
    };

    const handleTouchStart = (e: TouchEvent): void => {
      const touch = e.touches[0];
      if (touch) {
        touchStartY = touch.clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent): void => {
      const touch = e.changedTouches[0];
      if (touch) {
        touchEndY = touch.clientY;
      }
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) > 50) {
        // Swipe significativo
        if (diff > 0 && currentIndex < reels.length - 1) {
          // Swipe hacia arriba - siguiente reel
          setCurrentIndex((prev) => prev + 1);
        } else if (diff < 0 && currentIndex > 0) {
          // Swipe hacia abajo - reel anterior
          setCurrentIndex((prev) => prev - 1);
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, reels.length]);

  if (reels.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-lg">No hay reels disponibles</p>
          <p className="mt-2 text-sm text-slate-400">Los reels son videos cortos de hasta 60 segundos</p>
        </div>
      </div>
    );
  }

  const currentReel = reels[currentIndex];

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-black">
      {currentReel && (
        <ReelPlayer
          reel={currentReel}
          isActive={true}
          onNext={() => {
            if (currentIndex < reels.length - 1) {
              setCurrentIndex(currentIndex + 1);
            }
          }}
          onPrevious={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
            }
          }}
        />
      )}

      {/* Indicador de posición */}
      <div className="absolute right-4 top-1/2 z-20 -translate-y-1/2">
        <div className="flex flex-col gap-2">
          {reels.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, i) => {
            const actualIndex = Math.max(0, currentIndex - 2) + i;
            return (
              <div
                key={reels[actualIndex]?.id ?? `placeholder-${actualIndex}`}
                className={`h-2 w-2 rounded-full transition-all ${
                  actualIndex === currentIndex ? 'h-8 bg-white' : 'bg-white/40'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

