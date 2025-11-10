'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { type ReactElement } from 'react';

import { fadeUpVariants, staggerContainer, staggerItem } from '@/lib/motion-config';
import { formatRelativeTime } from '@/modules/feed/utils/formatters';
// API imports
import { getPostById } from '@/services/api/feed';
import type { TaggedPost } from '@/services/api/tags';

import { useTaggedPosts } from '../hooks/use-tagged-posts';

export function TaggedPostsShell(): ReactElement {
  const { taggedPosts, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useTaggedPosts();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="size-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-slate-400">Cargando posts...</p>
        </div>
      </div>
    );
  }

  if (taggedPosts.length === 0) {
    return (
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="flex min-h-[500px] flex-col items-center justify-center"
      >
        <div className="rounded-2xl glass-card p-12 text-center max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mb-6 mx-auto"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 via-primary-400/20 to-accent-500/20 blur-2xl" />
            <div className="relative size-24 rounded-2xl border border-primary-500/30 bg-gradient-to-br from-slate-900/50 to-black/50 backdrop-blur-sm flex items-center justify-center shadow-elegant">
              <svg className="size-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-white mb-2">No estás etiquetado en ningún post</h2>
            <p className="text-sm text-slate-400">
              Cuando otros usuarios te etiqueten, aparecerán aquí
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Agrupar por postId para evitar duplicados
  const uniquePostIds = Array.from(new Set(taggedPosts.map((tp) => tp.postId)));

  return (
    <div className="space-y-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {uniquePostIds.map((postId) => {
          const taggedPost = taggedPosts.find((tp) => tp.postId === postId);
          return taggedPost ? (
            <motion.div key={postId} variants={staggerItem}>
              <TaggedPostCard taggedPost={taggedPost} />
            </motion.div>
          ) : null;
        })}
      </motion.div>

      {hasNextPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center pt-4"
        >
          <motion.button
            type="button"
            onClick={() => {
              void fetchNextPage();
            }}
            disabled={isFetchingNextPage}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
          >
            {isFetchingNextPage ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Cargando...
              </span>
            ) : (
              'Cargar más'
            )}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

interface TaggedPostCardProps {
  readonly taggedPost: TaggedPost;
}

function TaggedPostCard({ taggedPost }: TaggedPostCardProps): ReactElement {
  const { data: postData, isLoading } = useQuery({
    queryKey: ['post', taggedPost.postId],
    queryFn: () => getPostById(taggedPost.postId),
    enabled: Boolean(taggedPost.postId),
    staleTime: 1000 * 60 * 5
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl glass-card p-4 animate-pulse">
        <div className="h-48 bg-slate-800/50 rounded-lg mb-3" />
        <div className="h-4 bg-slate-800/50 rounded w-3/4 mb-2" />
        <div className="h-4 bg-slate-800/50 rounded w-1/2" />
      </div>
    );
  }

  const post = postData?.post;

  if (!post) {
    return (
      <div className="rounded-2xl glass-card p-4">
        <p className="text-sm text-slate-400">Post no disponible</p>
      </div>
    );
  }

  const taggedMedia = post.media[taggedPost.mediaIndex];

  return (
    <Link
      href={`/posts/${taggedPost.postId}`}
      className="block rounded-2xl glass-card overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-elegant-lg"
    >
      {taggedMedia && taggedMedia.kind === 'image' ? (
        <div className="relative aspect-square w-full">
          <Image
            src={taggedMedia.url}
            alt={post.caption || 'Post etiquetado'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-xs text-white/80 mb-1 flex items-center gap-1">
              <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Etiquetado {formatRelativeTime(taggedPost.createdAt)}
            </p>
            {post.caption && (
              <p className="text-sm text-white line-clamp-2">{post.caption}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>Etiquetado {formatRelativeTime(taggedPost.createdAt)}</span>
          </div>
          {post.caption && (
            <p className="text-sm text-slate-300 line-clamp-3">{post.caption}</p>
          )}
        </div>
      )}
    </Link>
  );
}

