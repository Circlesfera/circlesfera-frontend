'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getHighlightById, removeStoryFromHighlight, type HighlightWithStories } from '../../../services/api/highlights';
import { useSessionStore } from '@/store/session';

interface HighlightViewerProps {
  readonly highlightId: string;
  readonly onClose: () => void;
}

export function HighlightViewer({ highlightId, onClose }: HighlightViewerProps): ReactElement {
  const queryClient = useQueryClient();
  const currentUser = useSessionStore((state) => state.user);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['highlight', highlightId],
    queryFn: () => getHighlightById(highlightId),
    enabled: !!highlightId
  });

  const removeStoryMutation = useMutation({
    mutationFn: (storyId: string) => removeStoryFromHighlight(highlightId, storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlight', highlightId] });
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
      toast.success('Story eliminada del highlight');
    },
    onError: () => {
      toast.error('No se pudo eliminar la story');
    }
  });

  const highlight = data?.highlight;

  useEffect(() => {
    if (!highlight || highlight.stories.length === 0) {
      return;
    }

    const currentStory = highlight.stories[currentStoryIndex];
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
  }, [highlight, currentStoryIndex, isPaused]);

  const handleNext = useCallback((): void => {
    if (!highlight) {
      return;
    }

    if (currentStoryIndex < highlight.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      onClose();
    }
  }, [highlight, currentStoryIndex, onClose]);

  const handlePrevious = useCallback((): void => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  }, [currentStoryIndex]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-white">Cargando highlight...</div>
      </div>
    );
  }

  if (!highlight || highlight.stories.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <p className="mb-4">Este highlight no tiene stories</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-primary-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-primary-400"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const currentStory = highlight.stories[currentStoryIndex];

  // Validar que currentStory existe
  if (!currentStory) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <p className="mb-4">Story no encontrada</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-primary-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-primary-400"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const storyDuration = currentStory.media.kind === 'video' ? currentStory.media.durationMs ?? 5000 : 5000;
  const isOwnHighlight = currentUser?.id === highlight.userId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Progress bar superior */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-4">
        {highlight.stories.map((story, index) => {
          const isActive = index === currentStoryIndex;
          const isViewed = index < currentStoryIndex;

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

      {/* Header con información */}
      <div className="absolute top-16 left-0 right-0 z-10 flex items-center gap-3 px-6 py-2">
        <div className="flex-1">
          <h3 className="font-semibold text-white">{highlight.name}</h3>
        </div>
        {isOwnHighlight && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Eliminar esta story del highlight?')) {
                removeStoryMutation.mutate(currentStory.id);
                if (currentStoryIndex === highlight.stories.length - 1 && currentStoryIndex > 0) {
                  setCurrentStoryIndex(currentStoryIndex - 1);
                }
              }
            }}
            className="rounded-full bg-red-900/20 p-2 text-red-400 transition hover:bg-red-900/30"
            title="Eliminar story del highlight"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
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
          <Image src={currentStory.media.url} alt={highlight.name} fill className="object-contain" unoptimized />
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
        disabled={currentStoryIndex === 0}
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
    </div>
  );
}

