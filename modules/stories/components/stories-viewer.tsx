'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { VerifiedBadge } from '@/components/verified-badge';
import type { StoryGroup, StoryItem, StoryUser } from '@/services/api/stories';
import { getStoryViewers, viewStory } from '@/services/api/stories';
import { useSessionStore } from '@/store/session';

import { StoryReactions } from './story-reactions';

interface StoriesViewerProps {
  readonly groups: StoryGroup[];
  readonly initialGroupIndex?: number;
  readonly initialStoryIndex?: number;
  readonly onClose: () => void;
}

export function StoriesViewer({
  groups,
  initialGroupIndex = 0,
  initialStoryIndex = 0,
  onClose
}: StoriesViewerProps): ReactElement {
  const queryClient = useQueryClient();
  const currentUser = useSessionStore((state) => state.user);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);

  const currentGroup: StoryGroup | undefined = groups[currentGroupIndex];
  const currentStory: StoryItem | undefined = currentGroup?.stories[currentStoryIndex];
  
  // Verificar si el usuario actual es el autor de la story
  const isAuthor = currentUser?.id === currentStory?.author.id;

  // Obtener viewers solo si es el autor y está mostrando el modal
  const { data: viewersData } = useQuery({
    queryKey: ['story-viewers', currentStory?.id],
    queryFn: () => (currentStory ? getStoryViewers(currentStory.id) : Promise.resolve({ viewers: [], count: 0 })),
    enabled: isAuthor && showViewers && !!currentStory,
    staleTime: 1000 * 60 // 1 minuto
  });

  const viewers: StoryUser[] = viewersData?.viewers ?? [];

  const storyId = currentStory?.id ?? null;
  const storyAlreadyViewed = currentStory?.hasViewed ?? false;

  useEffect(() => {
    if (!storyId || storyAlreadyViewed) {
      return;
    }

    const markAsViewed = async (): Promise<void> => {
      try {
        await viewStory(storyId);
        void queryClient.invalidateQueries({ queryKey: ['stories', 'feed'] });
      } catch {
        // Ignorar errores
      }
    };

    const timer = setTimeout(() => {
      void markAsViewed();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [queryClient, storyAlreadyViewed, storyId]);

  const handleNext = useCallback((): void => {
    const group = groups[currentGroupIndex];
    if (!group) {
      return;
    }

    if (currentStoryIndex < group.stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      return;
    }

    if (currentGroupIndex < groups.length - 1) {
      setCurrentGroupIndex((prev) => prev + 1);
      setCurrentStoryIndex(0);
      return;
    }

    onClose();
  }, [currentGroupIndex, currentStoryIndex, groups, onClose]);

  useEffect(() => {
    if (!currentStory || isPaused) {
      return;
    }

    const duration = currentStory.media.kind === 'video' ? currentStory.media.durationMs ?? 5000 : 5000;
    const timer = setTimeout(() => {
      handleNext();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [currentStory, handleNext, isPaused]);

  const handlePrevious = useCallback((): void => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      return;
    }

    if (currentGroupIndex > 0) {
      const prevGroupIndex = currentGroupIndex - 1;
      const prevGroup = groups[prevGroupIndex];

      if (prevGroup) {
        setCurrentGroupIndex(prevGroupIndex);
        setCurrentStoryIndex(prevGroup.stories.length - 1);
      }
    }
  }, [currentGroupIndex, currentStoryIndex, groups]);

  if (!currentStory || !currentGroup) {
    return <></>;
  }

  // Calcular duración real de la story actual para sincronizar la animación
  const storyDuration = currentStory.media.kind === 'video' ? currentStory.media.durationMs ?? 5000 : 5000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Progress bar superior - diseño refinado */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1.5 p-4 md:p-5">
        {currentGroup.stories.map((story, index) => {
          const isActive = index === currentStoryIndex;
          const isViewed = story.hasViewed || index < currentStoryIndex;

          return (
            <div
              key={story.id}
              className={`h-1 flex-1 rounded-full transition-all duration-300 overflow-hidden ${
                isViewed ? 'bg-white/80' : isActive ? 'bg-white/40' : 'bg-white/20'
              }`}
            >
              {isActive && !isPaused && (
                <div
                  className="h-full rounded-full bg-gradient-to-r from-white to-white/90 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                  style={{
                    width: '100%',
                    transitionDuration: `${storyDuration}ms`,
                    transitionTimingFunction: 'linear'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Header con información del autor - diseño refinado */}
      <div className="absolute top-16 left-0 right-0 z-10 flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 bg-gradient-to-b from-black/60 via-black/40 to-transparent backdrop-blur-md">
        <div className="relative size-11 md:size-13 overflow-hidden rounded-full border-2 border-white/40 ring-1 ring-black/20 shadow-lg transition-all duration-300 hover:scale-105">
          <Image
            src={
              currentGroup.author.avatarUrl ??
              `https://api.dicebear.com/7.x/thumbs/svg?seed=${currentGroup.author.handle}`
            }
            alt={currentGroup.author.displayName}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-base md:text-lg truncate">{currentGroup.author.displayName}</span>
            {currentGroup.author.isVerified && (
              <div className="size-5 md:size-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 flex-shrink-0">
                <svg className="size-3 md:size-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <span className="text-xs md:text-sm text-white/90 font-medium truncate">@{currentGroup.author.handle}</span>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Botón para ver viewers (solo si es el autor) */}
          {isAuthor && currentStory && currentStory.viewCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowViewers(true);
              }}
              className="rounded-xl px-3.5 py-2 bg-white/15 backdrop-blur-md border border-white/25 text-white transition-all duration-300 hover:bg-white/25 hover:scale-105 active:scale-95 shadow-lg shadow-black/20"
              title={`Ver ${currentStory.viewCount} ${currentStory.viewCount === 1 ? 'visualización' : 'visualizaciones'}`}
            >
              <div className="flex items-center gap-2">
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span className="text-sm font-bold">{currentStory.viewCount}</span>
              </div>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2.5 md:p-3 text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 active:scale-95 backdrop-blur-sm"
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contenido de la story con aspect ratio 9:16 vertical */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        onMouseDown={() => {
          setIsPaused(true);
        }}
        onMouseUp={() => {
          setIsPaused(false);
        }}
        onTouchStart={() => {
          setIsPaused(true);
        }}
        onTouchEnd={() => {
          setIsPaused(false);
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentGroupIndex}-${currentStoryIndex}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-[260px] md:max-w-[320px] aspect-[9/16] max-h-[70vh] md:max-h-[75vh] bg-black overflow-hidden rounded-2xl"
          >
            {currentStory.media.kind === 'image' ? (
              <div className="relative w-full h-full">
                <Image
                  src={currentStory.media.url}
                  alt="Story"
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="(max-width: 640px) 260px, (max-width: 768px) 320px, 320px"
                  priority
                />
              </div>
            ) : (
              <video
                src={currentStory.media.url}
                autoPlay
                muted
                loop={false}
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                onEnded={handleNext}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticker del post compartido - diseño refinado */}
      {currentStory?.sharedPost && (
        <Link
          href={`/posts/${currentStory.sharedPost.id}`}
          className="absolute bottom-24 left-1/2 z-20 -translate-x-1/2"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <div className="flex items-center gap-3 rounded-full border border-white/40 bg-black/70 px-4 py-2.5 backdrop-blur-md transition-all duration-300 hover:bg-black/90 hover:scale-105 hover:border-white/50 shadow-lg shadow-black/40">
            <div className="relative size-9 overflow-hidden rounded-full ring-2 ring-white/20">
              <Image
                src={currentStory.sharedPost.author.avatarUrl || '/default-avatar.png'}
                alt={currentStory.sharedPost.author.displayName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">{currentStory.sharedPost.author.displayName}</span>
              <span className="text-[10px] text-white/80 font-medium">@{currentStory.sharedPost.author.handle}</span>
            </div>
            <svg className="size-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      )}

      {/* Componente de reacciones */}
      {!isAuthor && <StoryReactions story={currentStory} />}

      {/* Navegación - diseño refinado con animaciones */}
      <motion.button
        type="button"
        onClick={handlePrevious}
        whileHover={{ scale: 1.1, x: -2 }}
        whileTap={{ scale: 0.95 }}
        className="absolute left-4 md:left-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 p-3.5 md:p-4 text-white transition-all duration-300 hover:bg-black/70 hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-black/50 shadow-lg shadow-black/30"
        disabled={currentGroupIndex === 0 && currentStoryIndex === 0}
      >
        <svg className="size-6 md:size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>

      <motion.button
        type="button"
        onClick={handleNext}
        whileHover={{ scale: 1.1, x: 2 }}
        whileTap={{ scale: 0.95 }}
        className="absolute right-4 md:right-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 p-3.5 md:p-4 text-white transition-all duration-300 hover:bg-black/70 hover:border-white/30 shadow-lg shadow-black/30"
      >
        <svg className="size-6 md:size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>

      {/* Modal de viewers - diseño refinado */}
      <AnimatePresence>
        {showViewers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => {
              setShowViewers(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative max-h-[80vh] w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.12] bg-slate-900/95 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
            {/* Header del modal */}
            <div className="border-b border-white/[0.08] px-6 py-4 bg-gradient-to-b from-slate-900/50 to-transparent">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Visualizaciones ({currentStory?.viewCount ?? 0})
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowViewers(false);
                  }}
                  className="rounded-full p-2 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white hover:scale-110 active:scale-95"
                >
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Lista de viewers */}
            <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {viewers.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-slate-400 font-medium">Aún no hay visualizaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {viewers.map((viewer) => (
                    <Link
                      key={viewer.id}
                      href={`/${viewer.handle}`}
                      onClick={() => {
                        setShowViewers(false);
                        onClose();
                      }}
                      className="flex items-center gap-3.5 px-6 py-4 transition-all duration-200 hover:bg-white/[0.08] active:bg-white/[0.05]"
                    >
                      <div className="relative size-12 overflow-hidden rounded-full ring-2 ring-white/[0.08]">
                        <Image
                          src={viewer.avatarUrl || `https://api.dicebear.com/7.x/thumbs/svg?seed=${viewer.handle}`}
                          alt={viewer.displayName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-sm truncate">{viewer.displayName}</span>
                          {viewer.isVerified && <VerifiedBadge size="sm" />}
                        </div>
                        <span className="text-sm text-slate-400 truncate block">@{viewer.handle}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

