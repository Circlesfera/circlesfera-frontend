import React, { useState, useCallback, useMemo } from 'react';
import { VirtualizedList } from '@/shared/components/VirtualizedList';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useOptimizedCallback } from '@/shared/hooks/useOptimizedCallback';
import PostCard from '@/components/PostCard';
import PostSkeleton from '@/components/PostSkeleton';
import { postService } from '../services/postService';
import { Post } from '../types';
import logger from '@/utils/logger';

interface OptimizedPostFeedProps {
  userId?: string;
  initialPosts?: Post[];
  onPostDelete?: (postId: string) => void;
  className?: string;
}

const ITEM_HEIGHT = 600; // Altura estimada de cada post
const CONTAINER_HEIGHT = 800; // Altura del contenedor visible
const PAGE_SIZE = 20;

export default function OptimizedPostFeed({
  userId,
  initialPosts = [],
  onPostDelete,
  className,
}: OptimizedPostFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Función para cargar más posts
  const loadMorePosts = useCallback(async () => {
    if (loading || !hasNextPage) return;

    setLoading(true);
    setError(null);

    try {
      const response = await (postService as any).getFeedPosts?.(page + 1, PAGE_SIZE) || { data: [] };

      setPosts(prevPosts => [...prevPosts, ...response.data]);
      setPage(prevPage => prevPage + 1);
      setHasNextPage(response.data.length === PAGE_SIZE);
    } catch (error) {
      logger.error('Error loading more posts:', error);
      setError('Error al cargar más publicaciones');
    } finally {
      setLoading(false);
    }
  }, [loading, hasNextPage, page]);

  // Debounce para evitar múltiples llamadas
  const debouncedLoadMore = useDebounce(loadMorePosts, 300);

  // Callbacks optimizados
  const handlePostLike = useOptimizedCallback(
    async (postId: string) => {
      try {
        // Optimistic update
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? {
                ...post,
                isLiked: !post.isLiked,
                likesCount: post.isLiked ? (post as any).likesCount - 1 : (post as any).likesCount + 1,
              }
              : post
          )
        );

        // TODO: Implementar llamada a API para like
        logger.info(`Post ${postId} liked`);
      } catch (error) {
        logger.error('Error liking post:', error);
        // Revert optimistic update
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? {
                ...post,
                isLiked: !post.isLiked,
                likesCount: post.isLiked ? (post as any).likesCount - 1 : (post as any).likesCount + 1,
              }
              : post
          )
        );
      }
    },
    []
  );

  const handlePostComment = useOptimizedCallback(
    (postId: string, _postAuthor: string, _postImage?: string) => {
      // TODO: Implementar lógica de comentarios
      logger.info(`Comment on post ${postId}`);
    },
    []
  );

  const handlePostShare = useOptimizedCallback(
    (postId: string, _postUrl?: string, _postCaption?: string) => {
      // TODO: Implementar lógica de compartir
      logger.info(`Share post ${postId}`);
    },
    []
  );

  const handlePostDelete = useOptimizedCallback(
    (postId: string) => {
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      onPostDelete?.(postId);
    },
    [onPostDelete]
  );

  const handleUserClick = useOptimizedCallback(
    (userId: string) => {
      // TODO: Navegar al perfil del usuario
      logger.info(`Navigate to user ${userId}`);
    },
    []
  );

  const handlePostClick = useOptimizedCallback(
    (postId: string, _username: string) => {
      // TODO: Navegar al post individual
      logger.info(`Navigate to post ${postId}`);
    },
    []
  );

  // Hook de scroll infinito
  const { ref: scrollRef, isFetching } = useInfiniteScroll(
    debouncedLoadMore,
    hasNextPage,
    {
      threshold: 0.1,
      rootMargin: '100px',
    }
  );

  // Renderizar item del feed
  const renderPostItem = useCallback(
    (post: Post, _index: number) => (
      <div className="p-4">
        <PostCard
          key={post.id}
          post={post as any}
          onLike={handlePostLike}
          onComment={handlePostComment}
          onShare={handlePostShare}
          onPostDeleted={handlePostDelete}
          onUserClick={handleUserClick}
          onPostClick={handlePostClick}
        />
      </div>
    ),
    [handlePostLike, handlePostComment, handlePostShare, handlePostDelete, handleUserClick, handlePostClick]
  );

  // Componente de loading
  const LoadingComponent = useMemo(
    () => (
      <div className="space-y-4 p-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <PostSkeleton key={index} />
        ))}
      </div>
    ),
    []
  );

  // Componente de error
  const ErrorComponent = useMemo(
    () => (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Error al cargar publicaciones
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error || 'Ha ocurrido un error inesperado'}
        </p>
        <button
          onClick={() => {
            setError(null);
            loadMorePosts();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    ),
    [error, loadMorePosts]
  );

  // Componente vacío
  const EmptyComponent = useMemo(
    () => (
      <div className="p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No hay publicaciones
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {userId ? 'Este usuario no ha publicado nada aún' : 'No hay publicaciones para mostrar'}
        </p>
      </div>
    ),
    [userId]
  );

  return (
    <div className={className}>
      <VirtualizedList
        items={posts}
        renderItem={renderPostItem}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        overscan={3}
        loading={loading && posts.length === 0}
        loadingComponent={LoadingComponent}
        emptyComponent={posts.length === 0 ? EmptyComponent : undefined}
        className="rounded-lg border border-gray-200 dark:border-gray-700"
      />

      {/* Indicador de carga para posts adicionales */}
      {(loading || isFetching) && posts.length > 0 && (
        <div className="p-4 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Cargando más publicaciones...</span>
          </div>
        </div>
      )}

      {/* Ref para scroll infinito */}
      <div ref={scrollRef} className="h-1" />

      {/* Mostrar error si existe */}
      {error && posts.length === 0 && ErrorComponent}
    </div>
  );
}
