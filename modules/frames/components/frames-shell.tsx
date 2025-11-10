'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { type ReactElement, useEffect, useMemo } from 'react';

import { FeedItemComponent as FeedItemCard } from '@/modules/feed/components/feed-item';
import { fetchExploreFeed } from '@/services/api/feed';
import { fetchFramesFeed } from '@/services/api/frames';
import { useSessionStore } from '@/store/session';

import type { FeedCursorResponse, FeedItem } from '../../../services/api/types/feed';
import { enhanceFrameVideos } from '../utils/enhance-frame-videos';

const FramesExperienceSkeleton = (): ReactElement => (
  <div className="relative mx-auto flex w-full max-w-[760px] flex-col gap-8 px-4 pb-16 pt-12 text-white sm:px-6">
    <header className="space-y-3">
      <div className="h-3 w-24 animate-pulse rounded-full bg-white/12" />
      <div className="h-7 w-48 animate-pulse rounded-full bg-white/15" />
      <div className="h-4 w-64 animate-pulse rounded-full bg-white/10" />
    </header>
    <div className="flex justify-center">
      <div className="relative w-full max-w-[min(360px,88vw)] sm:max-w-[340px]">
        <div className="pointer-events-none absolute inset-0 -z-10 mx-auto h-full w-full scale-[1.04] rounded-[26px] bg-primary-500/12 blur-[120px]" />
        <div className="aspect-[9/16] w-full overflow-hidden rounded-[22px] border border-white/12 bg-white/[0.06]">
          <div className="absolute inset-0 animate-[pulse_1.8s_ease-in-out_infinite] bg-gradient-to-br from-white/10 via-white/5 to-white/12" />
        </div>
      </div>
    </div>
  </div>
);

export function FramesShell(): ReactElement {
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);

  const framesQuery = useInfiniteQuery<FeedCursorResponse>({
    queryKey: ['frames'],
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      fetchFramesFeed({
        limit: 10,
        cursor: typeof pageParam === 'string' ? pageParam : null
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    staleTime: 60000,
    enabled: isHydrated && Boolean(accessToken)
  });

  const frames = useMemo<FeedItem[]>(() => {
    return framesQuery.data?.pages.flatMap((page) => page.data) ?? [];
  }, [framesQuery.data]);

  const shouldEnableFallback =
    ((framesQuery.status === 'success' && frames.length === 0) || framesQuery.status === 'error') &&
    isHydrated &&
    Boolean(accessToken);

  const fallbackQuery = useInfiniteQuery<FeedCursorResponse>({
    queryKey: ['frames', 'fallback'],
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      fetchExploreFeed({
        cursor: typeof pageParam === 'string' ? pageParam : null
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    staleTime: 60000,
    enabled: shouldEnableFallback
  });

  const fallbackFrames = useMemo<FeedItem[]>(() => {
    return fallbackQuery.data?.pages.flatMap((page) => page.data.filter((item) => item.media.length > 0)) ?? [];
  }, [fallbackQuery.data]);

  const usingFallback = frames.length === 0 && fallbackFrames.length > 0;
  const displayFrames = usingFallback ? fallbackFrames : frames;
  const displayFramesSignature = useMemo(
    () => displayFrames.map((frame) => frame.id).join('|'),
    [displayFrames]
  );

  useEffect(() => {
    enhanceFrameVideos('[data-frame-player="true"] video');
  }, [displayFramesSignature]);

  const isInitialLoading =
    framesQuery.status === 'pending' || (shouldEnableFallback && fallbackQuery.status === 'pending');

  const hasNextPage = framesQuery.hasNextPage ?? false;
  const fetchNextPage = framesQuery.fetchNextPage;
  const isFetchingNextPage = framesQuery.isFetchingNextPage;

  const fallbackHasNextPage = fallbackQuery.hasNextPage ?? false;
  const fetchFallbackNextPage = fallbackQuery.fetchNextPage;
  const isFetchingFallbackNextPage = fallbackQuery.isFetchingNextPage;

  const canLoadMore = usingFallback ? fallbackHasNextPage : hasNextPage;
  const isFetchingMore = usingFallback ? isFetchingFallbackNextPage : isFetchingNextPage;

  const handleLoadMore = (): void => {
    if (usingFallback) {
      if (fallbackHasNextPage && !isFetchingFallbackNextPage) {
        void fetchFallbackNextPage();
      }
    } else if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const handleRefresh = (): void => {
    void framesQuery.refetch();
    if (shouldEnableFallback) {
      void fallbackQuery.refetch();
    }
  };

  if (isInitialLoading) {
    return (
      <div className="relative min-h-screen w-full bg-[#05070C] text-white">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_55%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_55%)]"
          aria-hidden
        />
        <FramesExperienceSkeleton />
      </div>
    );
  }

  if (framesQuery.status === 'error' && fallbackQuery.status === 'error') {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center bg-[#05070C] px-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full max-w-[360px] flex-col items-center gap-6 rounded-[32px] border border-white/12 bg-black/75 px-6 py-10 text-center shadow-[0_36px_120px_-80px_rgba(15,23,42,0.85)] backdrop-blur-2xl"
        >
          <div className="flex size-20 items-center justify-center rounded-full border border-danger/30 bg-danger-500/15 text-danger-200">
            <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold uppercase tracking-[0.28em] text-white/90">No se pudieron cargar los frames</h2>
            <p className="mt-3 text-sm text-white/60">
              {framesQuery.error instanceof Error ? framesQuery.error.message : 'Verifica tu conexión e inténtalo nuevamente.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center justify-center rounded-full border border-primary-400/40 bg-primary-500/90 px-6 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white transition hover:bg-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300/60"
          >
            Reintentar
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#05070C] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_55%)]"
        aria-hidden
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-4 pb-20 pt-12 sm:px-6">
        <div className="flex w-full max-w-sm flex-col gap-4 text-center sm:max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">Reels CircleSfera</p>
          <h1 className="text-[28px] font-semibold text-white md:text-[32px]">Frames</h1>
          <p className="text-[13px] text-white/55">
            Disfruta y gestiona tus frames utilizando el mismo formato de cards del feed principal.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-4 py-2 text-xs font-medium text-white transition hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M5 19A9 9 0 0119 5" />
              </svg>
              Actualizar
            </button>
            <Link
              href="/create?type=frame"
              className="inline-flex items-center gap-2 rounded-full border border-primary-400/45 bg-gradient-to-r from-primary-500 via-primary-400 to-accent-400 px-5 py-2 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(99,102,241,0.35)] transition hover:shadow-[0_24px_60px_rgba(99,102,241,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200/60"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear frame
            </Link>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <section className="flex w-full flex-col">
            {displayFrames.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-6 rounded-[32px] border border-white/12 bg-black/75 px-6 py-10 text-center shadow-[0_36px_120px_-80px_rgba(15,23,42,0.85)] backdrop-blur-2xl"
              >
                <div className="relative flex size-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl" />
                  <div className="relative flex size-full items-center justify-center rounded-full border border-white/12 bg-black/60">
                    <svg className="size-9 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold uppercase tracking-[0.28em] text-white/90">Aún no hay frames</h2>
                  <p className="mt-3 text-sm text-white/60">
                    Los frames son videos cortos verticales. Crea el primero y comparte tu historia en formato 9:16.
                  </p>
                </div>
              </motion.div>
            ) : (
              displayFrames.map((frame) => (
                <motion.div key={frame.id} data-frame-player="true" className="mb-8 last:mb-0">
                  <FeedItemCard item={frame} />
                </motion.div>
              ))
            )}

            {canLoadMore ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isFetchingMore}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-4 py-2 text-xs font-medium text-white transition hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isFetchingMore ? (
                    <>
                      <span className="size-3 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
                      Cargando...
                    </>
                  ) : (
                    'Cargar más frames'
                  )}
                </button>
              </div>
            ) : null}
          </section>
        </div>

      </div>
    </div>
  );
}
