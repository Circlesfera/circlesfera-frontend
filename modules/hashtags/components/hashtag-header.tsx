'use client';

import { useQuery } from '@tanstack/react-query';
import { type ReactElement } from 'react';

import { searchHashtags } from '@/services/api/hashtags';

import { FollowHashtagButton } from './follow-hashtag-button';

interface HashtagHeaderProps {
  readonly tag: string;
}

/**
 * Header para mostrar información del hashtag con botón de seguir.
 */
export function HashtagHeader({ tag }: HashtagHeaderProps): ReactElement {
  const normalizedTag = tag.replace(/^#/, '').toLowerCase().trim();

  const { data: hashtagsData, isLoading } = useQuery({
    queryKey: ['hashtag', normalizedTag],
    queryFn: () => searchHashtags(normalizedTag, 1),
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  const hashtag = hashtagsData?.hashtags.find((h) => h.tag.toLowerCase() === normalizedTag);

  if (isLoading) {
    return (
      <header className="flex w-full max-w-4xl flex-col items-center gap-4 text-center">
        <div className="size-20 animate-pulse rounded-full bg-slate-800" />
        <div className="h-8 w-32 animate-pulse rounded bg-slate-800" />
        <div className="h-4 w-24 animate-pulse rounded bg-slate-800" />
      </header>
    );
  }

  if (!hashtag) {
    return (
      <header className="flex w-full max-w-4xl flex-col items-center gap-4 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary-500/20">
          <svg className="size-10 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7.5 2h9a5.5 5.5 0 010 11h-9a5.5 5.5 0 010-11z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white">#{normalizedTag}</h1>
          <p className="text-sm text-white/60">No hay publicaciones aún</p>
        </div>
        <div className="mt-2">
          <FollowHashtagButton tag={normalizedTag} />
        </div>
      </header>
    );
  }

  return (
    <header className="flex w-full max-w-4xl flex-col items-center gap-4 text-center">
      {/* Icono de hashtag */}
      <div className="flex size-20 items-center justify-center rounded-full bg-primary-500/20">
        <svg className="size-10 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7.5 2h9a5.5 5.5 0 010 11h-9a5.5 5.5 0 010-11z" />
        </svg>
      </div>

      {/* Nombre del hashtag */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-white">#{hashtag.tag}</h1>
        <p className="text-sm text-white/60">{hashtag.postCount.toLocaleString('es')} publicaciones</p>
      </div>

      {/* Botón de seguir */}
      <div className="mt-2">
        <FollowHashtagButton tag={hashtag.tag} />
      </div>
    </header>
  );
}

