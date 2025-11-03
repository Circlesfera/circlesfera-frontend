'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, type ReactElement } from 'react';

import type { StoryGroup, StoryItem } from '@/services/api/stories';
import { viewStory, getStoryViewers, type StoryUser } from '@/services/api/stories';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useSessionStore } from '@/store/session';
import { VerifiedBadge } from '@/components/verified-badge';
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

  const currentGroup = groups[currentGroupIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];
  
  // Verificar si el usuario actual es el autor de la story
  const isAuthor = currentUser?.id === currentStory?.author.id;

  // Obtener viewers solo si es el autor y está mostrando el modal
  const { data: viewersData } = useQuery({
    queryKey: ['story-viewers', currentStory?.id],
    queryFn: () => (currentStory ? getStoryViewers(currentStory.id) : Promise.resolve({ viewers: [], count: 0 })),
    enabled: isAuthor && showViewers && !!currentStory,
    staleTime: 1000 * 60 // 1 minuto
  });

  const viewers = viewersData?.viewers ?? [];

  useEffect(() => {
    if (!currentStory || currentStory.hasViewed) {
      return;
    }

    const timer = setTimeout(() => {
      viewStory(currentStory.id)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['stories', 'feed'] });
        })
        .catch(() => {
          // Ignorar errores
        });
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [currentStory?.id, currentStory?.hasViewed, queryClient]);

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
  }, [currentStory, isPaused]);

  const handleNext = (): void => {
    if (!currentGroup) {
      return;
    }

    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else if (currentGroupIndex < groups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  };

  const handlePrevious = (): void => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else if (currentGroupIndex > 0) {
      const prevGroup = groups[currentGroupIndex - 1];
      if (prevGroup) {
        setCurrentGroupIndex(currentGroupIndex - 1);
        setCurrentStoryIndex(prevGroup.stories.length - 1);
      }
    }
  };

  if (!currentStory || !currentGroup) {
    return <></>;
  }

  // Calcular duración real de la story actual para sincronizar la animación
  const storyDuration = currentStory.media.kind === 'video' ? currentStory.media.durationMs ?? 5000 : 5000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Progress bar superior */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-4">
        {currentGroup.stories.map((story, index) => {
          const isActive = index === currentStoryIndex;
          const isViewed = story.hasViewed || index < currentStoryIndex;

          return (
            <div
              key={story.id}
              className={`h-1 flex-1 rounded-full transition-all ${
                isViewed ? 'bg-white/70' : isActive ? 'bg-white/50' : 'bg-white/20'
              }`}
            >
              {isActive && !isPaused && (
                <div
                  className="h-full rounded-full bg-white ease-linear"
                  style={{
                    width: '100%',
                    transitionDuration: `${storyDuration}ms`
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Header con información del autor */}
      <div className="absolute top-16 left-0 right-0 z-10 flex items-center gap-3 px-6 py-3 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm">
        <div className="relative size-12 overflow-hidden rounded-full border-2 border-white/30 ring-2 ring-slate-900/50 shadow-lg">
          <Image
            src={
              currentGroup.author.avatarUrl ??
              `https://api.dicebear.com/7.x/thumbs/svg?seed=${currentGroup.author.handle}`
            }
            alt={currentGroup.author.displayName}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-base">{currentGroup.author.displayName}</span>
            {currentGroup.author.isVerified && (
              <div className="size-5 rounded-full bg-primary-500 flex items-center justify-center">
                <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <span className="text-xs text-white/80 font-medium">@{currentGroup.author.handle}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Botón para ver viewers (solo si es el autor) */}
          {isAuthor && currentStory && currentStory.viewCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowViewers(true);
              }}
              className="rounded-xl px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95"
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
            className="rounded-full p-2.5 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110 active:scale-95"
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contenido de la story */}
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
        {currentStory.media.kind === 'image' ? (
          <Image
            src={currentStory.media.url}
            alt="Story"
            fill
            className="object-contain"
            unoptimized
          />
        ) : (
          <video
            src={currentStory.media.url}
            autoPlay
            muted
            loop={false}
            playsInline
            className="h-full w-full object-contain"
            onEnded={handleNext}
          />
        )}
      </div>

      {/* Sticker del post compartido */}
      {currentStory?.sharedPost && (
        <Link
          href={`/posts/${currentStory.sharedPost.id}`}
          className="absolute bottom-24 left-1/2 z-20 -translate-x-1/2"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <div className="flex items-center gap-3 rounded-full border border-white/30 bg-black/60 px-4 py-2 backdrop-blur-sm transition hover:bg-black/80">
            <div className="relative size-8 overflow-hidden rounded-full">
              <Image
                src={currentStory.sharedPost.author.avatarUrl || '/default-avatar.png'}
                alt={currentStory.sharedPost.author.displayName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">{currentStory.sharedPost.author.displayName}</span>
              <span className="text-[10px] text-white/70">@{currentStory.sharedPost.author.handle}</span>
            </div>
            <svg className="size-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      )}

      {/* Componente de reacciones */}
      {!isAuthor && <StoryReactions story={currentStory} />}

      {/* Navegación */}
      <button
        type="button"
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 p-3 text-white transition-all duration-200 hover:bg-black/60 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
        disabled={currentGroupIndex === 0 && currentStoryIndex === 0}
      >
        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        type="button"
        onClick={handleNext}
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 p-3 text-white transition-all duration-200 hover:bg-black/60 hover:scale-110 active:scale-95"
      >
        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Modal de viewers */}
      {showViewers && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => {
            setShowViewers(false);
          }}
        >
          <div
            className="relative max-h-[80vh] w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-xl"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Header del modal */}
            <div className="border-b border-white/10 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Visualizaciones ({currentStory?.viewCount ?? 0})
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowViewers(false);
                  }}
                  className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Lista de viewers */}
            <div className="max-h-[60vh] overflow-y-auto">
              {viewers.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-slate-400">
                  Aún no hay visualizaciones
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {viewers.map((viewer) => (
                    <Link
                      key={viewer.id}
                      href={`/${viewer.handle}`}
                      onClick={() => {
                        setShowViewers(false);
                        onClose();
                      }}
                      className="flex items-center gap-3 px-6 py-4 transition hover:bg-white/5"
                    >
                      <div className="relative size-12 overflow-hidden rounded-full">
                        <Image
                          src={viewer.avatarUrl || `https://api.dicebear.com/7.x/thumbs/svg?seed=${viewer.handle}`}
                          alt={viewer.displayName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white">{viewer.displayName}</span>
                          {viewer.isVerified && <VerifiedBadge size="sm" />}
                        </div>
                        <span className="text-sm text-slate-400">@{viewer.handle}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

