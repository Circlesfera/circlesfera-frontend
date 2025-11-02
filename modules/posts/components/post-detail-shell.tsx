'use client';

import { Fragment, type ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';

import { getPostById } from '@/services/api/feed';
import { formatRelativeTime } from '@/modules/feed/utils/formatters';
import { formatNumber } from '@/lib/utils';

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
import { FeedItemActions } from './feed-item-actions';
import { PostComments } from './post-comments';
import { RelatedPosts } from './related-posts';

/**
 * Renderiza la vista detallada de un post individual.
 */
export function PostDetailShell({ postId }: { postId: string }): ReactElement {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostById(postId),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-slate-400">Cargando publicación...</div>;
  }

  if (isError || !data?.post) {
    return <div className="py-16 text-center text-sm text-red-400">Error al cargar la publicación.</div>;
  }

  const post = data.post;

  return (
    <>
      <article className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-soft-lg">
      {/* Header con autor */}
      <header className="flex items-center gap-3 border-b border-slate-800 px-6 py-4">
        <Link href={`/${post.author.handle}`} className="relative size-12 shrink-0 overflow-hidden rounded-full">
          <Image
            src={post.author.avatarUrl ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${post.author.handle}`}
            alt={post.author.displayName}
            fill
            className="object-cover"
          />
        </Link>
        <div className="flex-1">
          <Link
            href={`/${post.author.handle}`}
            className="block font-semibold text-white hover:underline"
          >
            {post.author.displayName}
          </Link>
          <p className="text-xs text-slate-400">
            @{post.author.handle} • {formatRelativeTime(post.createdAt)}
          </p>
        </div>
      </header>

      {/* Media */}
      <div className="flex flex-col gap-4 px-6 py-6">
        {post.caption ? (
          <div className="whitespace-pre-wrap text-base text-slate-100">{post.caption}</div>
        ) : null}

        {post.media.map((media) => (
          <Fragment key={media.id}>
            {media.kind === 'image' ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-800">
                <Image
                  src={media.url}
                  alt={post.caption || 'Imagen'}
                  fill
                  width={media.width ?? 1080}
                  height={media.height ?? 1920}
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-800">
                <video
                  src={media.url}
                  poster={media.thumbnailUrl}
                  controls
                  preload="metadata"
                  className="size-full object-contain"
                />
                {media.durationMs ? (
                  <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                    {formatDuration(media.durationMs)}
                  </div>
                ) : null}
              </div>
            )}
          </Fragment>
        ))}
      </div>

      {/* Acciones (like, comment, save) */}
      <FeedItemActions post={post} />

      {/* Estadísticas */}
      <div className="border-t border-slate-800 px-6 py-3">
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>{formatNumber(post.stats.likes)} me gusta</span>
          <span>{formatNumber(post.stats.comments)} comentarios</span>
          {post.stats.views > 0 ? <span>{formatNumber(post.stats.views)} visualizaciones</span> : null}
        </div>
      </div>

      {/* Comentarios */}
      <PostComments postId={postId} />
      </article>

      {/* Posts relacionados */}
      <RelatedPosts postId={postId} />
    </>
  );
}

