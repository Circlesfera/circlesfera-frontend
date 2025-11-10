'use client';

import { type InfiniteData,useInfiniteQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement } from 'react';
import { useMemo, useRef, useState } from 'react';

import { isFrameFeedItem } from '@/modules/frames/utils/is-frame-feed-item';
import { getSafeMediaUrl } from '@/modules/frames/utils/media';
import { SavedPostsShell } from '@/modules/saved/components/saved-posts-shell';
import { TaggedPostsShell } from '@/modules/tags/components/tagged-posts-shell';
import type { FeedCursorResponse, FeedItem, FeedMedia } from '@/services/api/types/feed';
import { getUserPosts } from '@/services/api/users';
import { useSessionStore } from '@/store/session';

import { ProfilePostsGrid } from './profile-posts-grid';

const TAB_CONFIG = {
  posts: {
    label: 'Publicaciones',
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    )
  },
  frames: {
    label: 'Frames',
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 4h10a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3zm0 0v.01M12 7h.01M17 7h.01M7 12h.01M12 12h.01M17 12h.01M7 17h.01M12 17h.01M17 17h.01"
        />
      </svg>
    )
  },
  tagged: {
    label: 'Etiquetados',
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    )
  },
  saved: {
    label: 'Guardados',
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    )
  }
} as const;

type TabType = 'posts' | 'frames' | 'tagged' | 'saved';

type ProfileFramesQueryKey = ['profile', 'frames', string];

interface ProfileTabsProps {
  readonly handle: string;
}

export function ProfileTabs({ handle }: ProfileTabsProps): ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const currentUser = useSessionStore((state) => state.user);
  const isOwnProfile = currentUser?.handle?.toLowerCase() === handle.toLowerCase();

  const tabs = useMemo(() => {
    const baseTabs: Array<{ id: TabType; label: string; icon: ReactElement }> = [
      { id: 'posts', label: TAB_CONFIG.posts.label, icon: TAB_CONFIG.posts.icon },
      { id: 'frames', label: TAB_CONFIG.frames.label, icon: TAB_CONFIG.frames.icon },
      { id: 'tagged', label: TAB_CONFIG.tagged.label, icon: TAB_CONFIG.tagged.icon }
    ];

    if (isOwnProfile) {
      baseTabs.push({ id: 'saved', label: TAB_CONFIG.saved.label, icon: TAB_CONFIG.saved.icon });
    }

    return baseTabs;
  }, [isOwnProfile]);

  const framesQueryKey = useMemo<ProfileFramesQueryKey>(() => ['profile', 'frames', handle], [handle]);

  const framesQuery = useInfiniteQuery<
    FeedCursorResponse,
    Error,
    InfiniteData<FeedCursorResponse>,
    ProfileFramesQueryKey,
    string | null
  >({
    queryKey: framesQueryKey,
    queryFn: ({ pageParam }) => getUserPosts({ handle, cursor: pageParam ?? null, limit: 12 }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    staleTime: 60_000
  });

  const frames = useMemo<FeedItem[]>(() => {
    const items = framesQuery.data?.pages.flatMap((page) => page.data) ?? [];
    return items.filter(isFrameFeedItem);
  }, [framesQuery.data]);

  const framesErrorMessage = framesQuery.error instanceof Error ? framesQuery.error.message : null;

  return (
    <div className="w-full">
      <div className="mb-8 border-b border-white/10">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                }}
                className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500/20 via-primary-500/10 to-transparent text-foreground shadow-lg shadow-primary-500/10'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className={isActive ? 'text-primary-400' : ''}>{tab.icon}</span>
                <span>{tab.label}</span>
                {isActive ? (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-gradient-to-r from-primary-500 via-primary-400 to-accent-500"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                ) : null}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'posts' ? <ProfilePostsGrid handle={handle} /> : null}
          {activeTab === 'frames' ? (
            <ProfileFramesPanel
              frames={frames}
              status={framesQuery.status}
              errorMessage={framesErrorMessage}
              onRetry={() => {
                void framesQuery.refetch();
              }}
              onLoadMore={() => {
                void framesQuery.fetchNextPage();
              }}
              hasNextPage={framesQuery.hasNextPage ?? false}
              isFetchingNextPage={framesQuery.isFetchingNextPage}
            />
          ) : null}
          {activeTab === 'tagged' ? (
            <div className="min-h-[400px]">
              <TaggedPostsShell />
            </div>
          ) : null}
          {activeTab === 'saved' && isOwnProfile ? (
            <div className="min-h-[400px]">
              <SavedPostsShell />
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface ProfileFramesPanelProps {
  readonly frames: FeedItem[];
  readonly status: 'pending' | 'error' | 'success';
  readonly errorMessage: string | null;
  readonly onRetry: () => void;
  readonly onLoadMore: () => void;
  readonly hasNextPage: boolean;
  readonly isFetchingNextPage: boolean;
}

function ProfileFramesPanel({
  frames,
  status,
  errorMessage,
  onRetry,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage
}: ProfileFramesPanelProps): ReactElement {
  if (status === 'pending' && frames.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex aspect-[9/16] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/50 p-4"
          >
            <div className="flex-1 rounded-2xl bg-slate-800/60 animate-pulse" />
            <div className="mt-4 flex items-center gap-2">
              <div className="size-9 rounded-full bg-slate-800/60 animate-pulse" />
              <div className="h-3 w-20 rounded bg-slate-800/60 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (status === 'error' && frames.length === 0) {
    return (
      <div className="space-y-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
        <p className="text-sm font-semibold text-red-300">No se pudieron cargar los frames.</p>
        {errorMessage ? <p className="text-xs text-red-200/80">{errorMessage}</p> : null}
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-400"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (frames.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-12 text-center">
        <p className="text-sm font-semibold text-foreground-muted">Este perfil aún no ha compartido frames.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {frames.map((frame) => {
          const cover = getFramePreview(frame.media);
          if (!cover) {
            return null;
          }

          const coverUrl = getSafeMediaUrl(cover.previewUrl, { allowDataUrls: true });
          if (!coverUrl) {
            return null;
          }

          const primaryMedia = frame.media?.[0];

          return (
            <Link
              key={frame.id}
              href={`/frames/${frame.id}`}
              className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/40 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.6)] transition-all duration-300 hover:shadow-[0_25px_60px_-20px_rgba(59,130,246,0.35)]"
            >
              <FramePreview media={primaryMedia} coverUrl={coverUrl} caption={frame.caption} authorHandle={frame.author.handle} />
            </Link>
          );
        })}
      </div>

      {hasNextPage ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="rounded-xl bg-gradient-to-r from-primary-500 via-primary-400 to-accent-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:shadow-xl hover:shadow-primary-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetchingNextPage ? 'Cargando...' : 'Ver más frames'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function getFramePreview(media?: FeedMedia[]): { previewUrl: string } | null {
  if (!media || media.length === 0) {
    return null;
  }

  const [primary] = media;
  if (!primary) {
    return null;
  }

  return {
    previewUrl: primary.thumbnailUrl ?? primary.url
  };
}

interface FramePreviewProps {
  readonly media?: FeedMedia;
  readonly coverUrl: string;
  readonly caption?: string | null;
  readonly authorHandle: string;
}

function FramePreview({ media, coverUrl, caption, authorHandle }: FramePreviewProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = (): void => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.paused) {
      void video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (): void => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <div className="relative aspect-[9/16] w-full overflow-hidden">
      {media?.kind === 'video' ? (
        <video
          ref={videoRef}
          key={media.url}
          src={media.url}
          poster={coverUrl}
          className="absolute inset-0 h-full w-full object-cover"
          preload="metadata"
          muted={isMuted}
          loop
          playsInline
          autoPlay
        />
      ) : (
        <Image
          src={coverUrl}
          alt={caption ?? `Frame de @${authorHandle}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized
        />
      )}

      {media?.kind === 'video' ? (
        <div className="absolute inset-0 flex items-end justify-between p-3">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              togglePlay();
            }}
            className="flex size-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/70"
            aria-label={isPlaying ? 'Pausar frame' : 'Reproducir frame'}
          >
            {isPlaying ? (
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.75 5.25a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0v-12a.75.75 0 0 1 .75-.75Zm4.5 0a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0v-12a.75.75 0 0 1 .75-.75Z" />
              </svg>
            ) : (
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.25 5.428c0-.856.93-1.384 1.667-.942l9.153 5.572a1.1 1.1 0 0 1 0 1.884l-9.153 5.572a1.1 1.1 0 0 1-1.667-.942V5.428Z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleMute();
            }}
            className="flex size-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/70"
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar frame'}
          >
            {isMuted ? (
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.383 3.079A1 1 0 0 1 10 4v4.382a.75.75 0 0 0 .22.53l1.95 1.95a.75.75 0 0 0 1.28-.53V4a1 1 0 0 1 1.618-.786l6 4.8A1 1 0 0 1 20.5 9.8l-5.079 4.064a.75.75 0 0 0-.271.575v2.611a1 1 0 0 1-1.618.786l-6-4.8A1 1 0 0 1 7.5 12.2l5.079-4.064a.75.75 0 0 0 .271-.575V4.95a.75.75 0 0 0-1.28-.53L9.5 6.962" />
              </svg>
            ) : (
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 9v6h3l4 4V5L8 9H5Zm11.293 3 1.353-1.353a1 1 0 0 1 1.414 1.414L17.414 13l1.646 1.646a1 1 0 0 1-1.414 1.414L16.293 14.414l-1.353 1.353a1 1 0 0 1-1.414-1.414L14.586 13l-1.646-1.646a1 1 0 0 1 1.414-1.414L16.293 11.586Z" />
              </svg>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}

