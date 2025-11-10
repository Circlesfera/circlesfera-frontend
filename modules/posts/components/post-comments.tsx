'use client';

import { type InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { type ReactElement, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getAvatarUrl, isLocalImage } from '@/lib/image-utils';
import { fadeUpVariants } from '@/lib/motion-config';
import {
  type CommentCursorResponse,
  type CommentResourceType,
  createComment,
  fetchComments
} from '@/services/api/comments';
import { useSessionStore } from '@/store/session';

import { CommentItem } from './comment-item';

interface PostCommentsProps {
  readonly postId: string;
  readonly resourceType?: CommentResourceType;
}

const PAGE_SIZE = 20;

export function PostComments({ postId, resourceType = 'post' }: PostCommentsProps): ReactElement {
  const queryClient = useQueryClient();
  const currentUser = useSessionStore((state) => state.user);
  const [commentText, setCommentText] = useState('');

  const commentsQueryKey = [resourceType === 'frame' ? 'frame-comments' : 'comments', postId] as const;

  const commentsQuery = useInfiniteQuery({
    queryKey: commentsQueryKey,
    queryFn: async ({ pageParam }) => await fetchComments(postId, pageParam ?? null, PAGE_SIZE, resourceType),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 1000 * 60 * 2
  });

  const createCommentMutation = useMutation({
    mutationFn: (content: string) => createComment(postId, { content }, resourceType),
    onSuccess: (response) => {
      queryClient.setQueryData<InfiniteData<CommentCursorResponse> | undefined>(commentsQueryKey, (previous) => {
        if (!previous || previous.pages.length === 0) {
          return {
            pageParams: [null],
            pages: [
              {
                data: [response.comment],
                nextCursor: null
              }
            ]
          };
        }

        const firstPage = previous.pages[0];
        if (!firstPage) {
          return previous;
        }

        const rest = previous.pages.slice(1);
        const exists = firstPage.data.some((entry) => entry.id === response.comment.id);
        const updatedFirstPage = exists
          ? firstPage
          : {
              ...firstPage,
              data: [response.comment, ...firstPage.data].slice(0, PAGE_SIZE)
            };

        return {
          pageParams: previous.pageParams,
          pages: [updatedFirstPage, ...rest]
        };
      });

      void queryClient.invalidateQueries({ queryKey: commentsQueryKey });
      void queryClient.invalidateQueries({ queryKey: [resourceType === 'frame' ? 'frame' : 'post', postId] });
      setCommentText('');
      toast.success('Comentario publicado');
    },
    onError: () => {
      toast.error('No se pudo publicar el comentario');
    }
  });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (trimmed.length === 0) {
      return;
    }
    createCommentMutation.mutate(trimmed);
  };

  const comments = commentsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const totalComments = comments.length;
  const hasComments = totalComments > 0;
  const isInitialLoading = commentsQuery.isLoading && !hasComments;
  const hasMore = commentsQuery.hasNextPage;
  const isFetchingNext = commentsQuery.isFetchingNextPage;

  const avatarUrl = useMemo(() => {
    if (!currentUser) return null;
    return getAvatarUrl(currentUser.avatarUrl ?? null, currentUser.handle);
  }, [currentUser]);

  return (
    <section aria-labelledby={`comments-${postId}`} className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h3 id={`comments-${postId}`} className="text-lg font-semibold text-white">
            Comentarios
          </h3>
          <p className="text-sm text-white/50">
            {hasComments ? `${totalComments} ${totalComments === 1 ? 'comentario' : 'comentarios'}` : 'Aún no hay comentarios'}
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white/80">
          {totalComments}
        </span>
      </header>

      <div className="rounded-[32px] border border-white/[0.08] bg-white/[0.03] p-5 md:p-6 shadow-[0_35px_80px_-40px_rgba(15,23,42,0.65)] backdrop-blur-xl">
        {currentUser ? (
          <motion.form
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-slate-950/60 p-4 md:p-5 shadow-inner shadow-black/20"
          >
            <div className="flex items-start gap-3 md:gap-4">
              <div className="relative shrink-0">
                <div className="pointer-events-none absolute -inset-1 rounded-full bg-primary-500/30 blur-md" />
                <div className="relative size-10 overflow-hidden rounded-full border border-white/15">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={currentUser.displayName ?? 'Usuario'}
                      fill
                      className="object-cover"
                      unoptimized={isLocalImage(avatarUrl)}
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-sm font-semibold text-primary-200">
                      {currentUser.displayName?.charAt(0).toUpperCase() ?? currentUser.handle?.charAt(0).toUpperCase() ?? 'U'}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <textarea
                  value={commentText}
                  onChange={(e) => {
                    setCommentText(e.target.value);
                  }}
                  placeholder="Comparte algo con la comunidad..."
                  maxLength={2200}
                  rows={commentText.length > 120 ? 4 : 2}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/40 transition focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (commentText.trim().length > 0 && !createCommentMutation.isPending) {
                        handleSubmit(e);
                      }
                    }
                  }}
                />
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>{commentText.length} / 2200</span>
                  <motion.button
                    type="submit"
                    disabled={createCommentMutation.isPending || commentText.trim().length === 0}
                    whileHover={{ scale: commentText.trim().length === 0 ? 1 : 1.02, y: commentText.trim().length === 0 ? 0 : -1 }}
                    whileTap={{ scale: commentText.trim().length === 0 ? 1 : 0.97 }}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/35 transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {createCommentMutation.isPending ? (
                      <>
                        <span className="size-3.5 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                        Publicando...
                      </>
                    ) : (
                      'Publicar comentario'
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.form>
        ) : null}

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          {isInitialLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-12 text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl" />
                <div className="relative size-10 animate-spin rounded-full border-2 border-primary-500/40 border-t-primary-300" />
              </div>
              <p className="text-sm text-white/60">Recuperando comentarios...</p>
            </motion.div>
          ) : !hasComments ? (
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center gap-3 py-12 text-center"
            >
              <div className="flex size-16 items-center justify-center rounded-full border border-dashed border-white/12 bg-white/[0.02]">
                <svg className="size-7 text-white/45" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white/85">Aún no hay comentarios</p>
                <p className="text-xs text-white/40">Sé el primero en iniciar la conversación.</p>
              </div>
            </motion.div>
          ) : (
            <div className="max-h-[420px] space-y-4 overflow-y-auto px-1 py-4">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} postId={postId} resourceType={resourceType} />
              ))}
              {hasMore && (
                <motion.button
                  type="button"
                  onClick={() => {
                    if (!isFetchingNext) {
                      void commentsQuery.fetchNextPage();
                    }
                  }}
                  disabled={isFetchingNext}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="mx-auto flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-2 text-sm font-medium text-white/80 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isFetchingNext ? (
                    <>
                      <span className="size-3.5 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                      Cargando más
                    </>
                  ) : (
                    'Ver más comentarios'
                  )}
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

