'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, type ReactElement } from 'react';

import type { StoryGroup, StoryItem } from '@/services/api/stories';
import { viewStory, getStoryViewers, type StoryUser } from '@/services/api/stories';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useSessionStore } from '@/store/session';
import { VerifiedBadge } from '@/components/verified-badge';

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
      <div className="absolute top-16 left-0 right-0 z-10 flex items-center gap-3 px-6 py-2">
        <div className="relative size-10 overflow-hidden rounded-full border-2 border-white">
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
            <span className="font-semibold text-white">{currentGroup.author.displayName}</span>
            {currentGroup.author.isVerified && (
              <svg className="size-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 3 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82 1.89 3.2L12 21l3.4 1.5 1.89-3.19 3.61-.82-.34-3.69L23 12zm-10 5l-5-5 1.41-1.41L13 14.17l7.59-7.59L22 8l-9 9z" />
              </svg>
            )}
          </div>
          <span className="text-xs text-white/70">@{currentGroup.author.handle}</span>
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
              className="rounded-full p-2 text-white transition hover:bg-white/20"
              title={`Ver ${currentStory.viewCount} ${currentStory.viewCount === 1 ? 'visualización' : 'visualizaciones'}`}
            >
              <div className="flex items-center gap-1">
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span className="text-sm font-medium">{currentStory.viewCount}</span>
              </div>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white transition hover:bg-white/20"
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

      {/* Navegación */}
      <button
        type="button"
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white transition hover:bg-black/50"
        disabled={currentGroupIndex === 0 && currentStoryIndex === 0}
      >
        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        type="button"
        onClick={handleNext}
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white transition hover:bg-black/50"
      >
        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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

