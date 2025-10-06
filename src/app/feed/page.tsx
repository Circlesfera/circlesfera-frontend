"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import { getFeed, likePost, unlikePost, Post } from '@/services/postService';
import FeedCard from '@/components/feed/FeedCard';
import { Card } from '@/design-system/Card';
import { Button } from '@/design-system/Button';

// Iconos SVG
const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default function FeedPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement | null>(null);

  const fetchFeed = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!user) return;
    
    try {
      if (!append) {
        setLoading(true);
        setError(null);
      } else {
        setFetchingMore(true);
      }

      const response = await getFeed(pageNum, 10);
      
      if (append) {
        setPosts(prev => [...prev, ...response.posts]);
      } else {
        setPosts(response.posts);
      }
      
      setHasMore(response.hasMore || false);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching feed:', err);
      setError('Error al cargar el feed');
    } finally {
      setLoading(false);
      setFetchingMore(false);
      setIsRefreshing(false);
    }
  }, [user]);

  // Cargar feed inicial
  useEffect(() => {
    if (user && !authLoading) {
      fetchFeed(1);
    }
  }, [user, authLoading, fetchFeed]);

  // Intersection Observer para carga infinita
  useEffect(() => {
    if (!hasMore || loading || fetchingMore || !user) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new window.IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && hasMore) {
        setFetchingMore(true);
        fetchFeed(page + 1, true);
      }
    });
    
    if (lastPostRef.current) observer.current.observe(lastPostRef.current);
  }, [hasMore, loading, fetchingMore, page, fetchFeed, user]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchFeed(1, false);
  }, [fetchFeed]);

  const handlePostLike = useCallback(async (postId: string) => {
    try {
      const post = posts.find(p => p._id === postId);
      if (!post) return;

      const isLiked = post.likes.includes(user?._id || '');
      
      // Actualizar estado optimista
      setPosts(prevPosts =>
        prevPosts.map(p => {
          if (p._id === postId) {
            if (isLiked) {
              // Quitar like
              return {
                ...p,
                likes: p.likes.filter(id => id !== user?._id),
                isLiked: false
              };
            } else {
              // Agregar like
              return {
                ...p,
                likes: [...p.likes, user?._id || ''],
                isLiked: true
              };
            }
          }
          return p;
        })
      );

      // Llamar al servicio
      const response = isLiked ? await unlikePost(postId) : await likePost(postId);
      if (!response.success) {
        // Revertir cambio si falla
        setPosts(prevPosts =>
          prevPosts.map(p => {
            if (p._id === postId) {
              return post; // Revertir al estado original
            }
            return p;
          })
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  }, [posts, user]);

  const handlePostComment = useCallback((postId: string) => {
    // Redirigir a la página del post individual donde se pueden ver los comentarios
    router.push(`/post/${postId}`);
  }, []);

  const handlePostShare = useCallback(async (postId: string) => {
    try {
      const postUrl = `${window.location.origin}/post/${postId}`;
      
      if (navigator.share) {
        // Usar Web Share API si está disponible
        await navigator.share({
          title: 'Mira este post en CircleSfera',
          text: 'Echa un vistazo a este post',
          url: postUrl,
        });
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(postUrl);
        alert('¡Enlace copiado al portapapeles!');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      // Fallback final: copiar manualmente
      const postUrl = `${window.location.origin}/post/${postId}`;
      navigator.clipboard.writeText(postUrl).then(() => {
        alert('¡Enlace copiado al portapapeles!');
      });
    }
  }, []);

  const handlePostDelete = useCallback((postId: string) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  }, []);

  // Loading inicial
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && posts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el feed</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={handleRefresh} leftIcon={<RefreshIcon className="h-4 w-4" />}>
            Reintentar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inicio</h1>
          <p className="text-gray-600">Descubre lo que está pasando</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            leftIcon={<RefreshIcon className="h-4 w-4" />}
          >
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button
            variant="gradient"
            size="sm"
            leftIcon={<PlusIcon className="h-4 w-4" />}
          >
            Crear
          </Button>
        </div>
      </div>

      {/* Feed */}
      {loading && posts.length === 0 ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post, index) => (
            <div
              key={post._id}
              ref={index === posts.length - 1 ? lastPostRef : null}
            >
              <FeedCard
                post={post}
                onLike={handlePostLike}
                onComment={handlePostComment}
                onShare={handlePostShare}
                onDelete={handlePostDelete}
                isOwnPost={post.user._id === user?._id}
              />
            </div>
          ))}

          {/* Loading más posts */}
          {fetchingMore && (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* No hay más posts */}
          {!hasMore && posts.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay más publicaciones</p>
            </div>
          )}

          {/* Estado vacío */}
          {!loading && posts.length === 0 && (
            <Card className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay publicaciones</h3>
              <p className="text-gray-600 mb-6">Sigue a más usuarios para ver contenido en tu feed</p>
              <Button variant="gradient" leftIcon={<PlusIcon className="h-4 w-4" />}>
                Crear primera publicación
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
