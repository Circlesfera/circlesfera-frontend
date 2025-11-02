'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef, type ReactElement } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { FeedItem } from '@/services/api/types/feed';
import { likePost, unlikePost } from '@/services/api/likes';
import { savePost, unsavePost } from '@/services/api/saves';
import { useSessionStore } from '@/store/session';
import { VerifiedBadge } from '@/components/verified-badge';

interface ReelPlayerProps {
  readonly reel: FeedItem;
  readonly isActive: boolean;
  readonly onNext: () => void;
  readonly onPrevious: () => void;
}

export function ReelPlayer({ reel, isActive }: ReelPlayerProps): ReactElement {
  const queryClient = useQueryClient();
  const currentUser = useSessionStore((state) => state.user);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const likeMutation = useMutation({
    mutationFn: reel.isLikedByViewer ? unlikePost : likePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
    },
    onError: () => {
      toast.error('No se pudo actualizar el like');
    }
  });

  const saveMutation = useMutation({
    mutationFn: () => (reel.isSavedByViewer ? unsavePost(reel.id) : savePost(reel.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
      toast.success(reel.isSavedByViewer ? 'Eliminado de guardados' : 'Guardado');
    },
    onError: () => {
      toast.error('No se pudo guardar el reel');
    }
  });

  // Controlar reproducción del video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (isActive) {
      video.play().catch(() => {
        // Ignorar errores de autoplay
      });
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleLike = (): void => {
    likeMutation.mutate(reel.id);
  };

  const handleSave = (): void => {
    saveMutation.mutate();
  };

  const handleToggleMute = (): void => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const videoMedia = reel.media.find((m: { kind: string }) => m.kind === 'video');
  if (!videoMedia) {
    return <></>;
  }

  return (
    <div className="relative h-screen w-full">
      {/* Video */}
      <video
        ref={videoRef}
        src={videoMedia.url}
        className="h-full w-full object-cover"
        loop
        playsInline
        muted={isMuted}
        onEnded={() => {
          // Al finalizar, pasar al siguiente
        }}
      />

      {/* Overlay con información y controles */}
      <div className="absolute inset-0 flex">
        {/* Contenido principal (autor, caption) */}
        <div className="flex flex-1 flex-col justify-end p-6">
          <Link href={`/${reel.author.handle}`} className="mb-4 flex items-center gap-3">
            <div className="relative size-12 overflow-hidden rounded-full border-2 border-white">
              <Image
                src={reel.author.avatarUrl || '/default-avatar.png'}
                alt={reel.author.displayName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="text-white">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold">@{reel.author.handle}</p>
                {reel.author.isVerified && <VerifiedBadge size="sm" />}
              </div>
              {reel.caption && (
                <p className="mt-1 line-clamp-2 text-sm text-white/90">{reel.caption}</p>
              )}
            </div>
          </Link>
        </div>

        {/* Controles laterales */}
        <div className="flex flex-col items-center justify-end gap-6 p-6">
          {/* Like */}
          <button
            type="button"
            onClick={handleLike}
            className="flex flex-col items-center gap-1"
            disabled={likeMutation.isPending}
          >
            <div className={`rounded-full p-2 transition ${reel.isLikedByViewer ? 'bg-red-500/20' : 'bg-black/30'}`}>
              <svg
                className={`size-7 ${reel.isLikedByViewer ? 'fill-red-500 text-red-500' : 'text-white'}`}
                fill={reel.isLikedByViewer ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <span className="text-xs font-medium text-white">{reel.stats.likes.toLocaleString('es')}</span>
          </button>

          {/* Comentarios */}
          <Link href={`/posts/${reel.id}`} className="flex flex-col items-center gap-1">
            <div className="rounded-full bg-black/30 p-2">
              <svg className="size-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <span className="text-xs font-medium text-white">{reel.stats.comments.toLocaleString('es')}</span>
          </Link>

          {/* Guardar */}
          <button
            type="button"
            onClick={handleSave}
            className="flex flex-col items-center gap-1"
            disabled={saveMutation.isPending}
          >
            <div className={`rounded-full p-2 transition ${reel.isSavedByViewer ? 'bg-yellow-500/20' : 'bg-black/30'}`}>
              <svg
                className={`size-7 ${reel.isSavedByViewer ? 'fill-yellow-500 text-yellow-500' : 'text-white'}`}
                fill={reel.isSavedByViewer ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
          </button>

          {/* Mute/Unmute */}
          <button type="button" onClick={handleToggleMute} className="rounded-full bg-black/30 p-2">
            {isMuted ? (
              <svg className="size-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="size-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

