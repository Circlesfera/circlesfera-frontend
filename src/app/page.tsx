"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, PostCard, Avatar, Button } from '@/design-system';
import { useAuth } from '@/features/auth/useAuth';
import { getUsersWithStories, UserWithStories } from '@/services/storyService';
import CommentsModal from '@/components/CommentsModal';
import ShareModal from '@/components/ShareModal';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserSuggestions from '@/components/UserSuggestions';
import { useRouter } from 'next/navigation';
import { useFeed } from '@/hooks/useFeed';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import logger from '@/utils/logger';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    posts,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    refresh,
    updatePost,
    removePost
  } = useFeed({ isAuthenticated: !!user && !authLoading });

  const [stories, setStories] = useState<UserWithStories[]>([]);
  const [commentsModal, setCommentsModal] = useState<{
    isOpen: boolean;
    postId: string;
    postAuthor: string;
    postImage?: string;
  }>({ isOpen: false, postId: '', postAuthor: '' });
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    postId: string;
    postUrl?: string;
    postCaption?: string;
  }>({ isOpen: false, postId: '', postUrl: '', postCaption: '' });

  // Configurar infinite scroll
  const observerRef = useInfiniteScroll({
    loading: loadingMore,
    hasMore,
    onLoadMore: loadMore,
    threshold: 0.5
  });

  // Cargar stories
  useEffect(() => {
    const loadStories = async () => {
      if (authLoading || !user) return;

      try {
        const storiesResponse = await getUsersWithStories();
        if (storiesResponse.success) {
          setStories(storiesResponse.users || []);
        }
      } catch (error) {

      }
    };

    loadStories();
  }, [user, authLoading]);

  // Refrescar feed cuando el usuario regresa de crear un post
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user && !authLoading) {

        refresh();
      }
    };

    const handleFocus = () => {
      if (user && !authLoading) {

        refresh();
      }
    };

    // Escuchar cambios de visibilidad y focus
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, authLoading, refresh]);

  const handleLike = useCallback((postId: string) => {
    if (!posts || !Array.isArray(posts)) return;
    const post = posts.find(p => p._id === postId);
    if (!post) return;

    updatePost(postId, {
      isLiked: !post.isLiked,
      likes: post.isLiked
        ? post.likes.filter(id => id !== user?._id)
        : [...post.likes, user?._id || '']
    });
  }, [posts, user, updatePost]);

  const handleComment = useCallback((postId: string, postAuthor: string, postImage?: string) => {
    setCommentsModal({
      isOpen: true,
      postId,
      postAuthor,
      ...(postImage && { postImage })
    });
  }, []);

  const handleShare = useCallback((postId: string, postUrl?: string, postCaption?: string) => {
    setShareModal({
      isOpen: true,
      postId,
      ...(postUrl && { postUrl }),
      ...(postCaption && { postCaption })
    });
  }, []);

  const handleUserClick = useCallback((userId: string) => {
    router.push(`/${userId}`);
  }, [router]);

  const handlePostDeleted = useCallback((postId: string) => {
    removePost(postId);
  }, [removePost]);

  const handlePostClick = useCallback((postId: string, username: string) => {
    router.push(`/${username}/post/${postId}`);
  }, [router]);

  const PlusIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 px-4">
        {/* Loading State */}
        <Card className="p-6">
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
            {/* Loading skeletons */}
            {[...Array(8)].map((_, index) => (
              <div key={index} className="flex-shrink-0 flex flex-col items-center space-y-2 px-1">
                <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse p-2"></div>
                <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </Card>

        {/* Posts Loading */}
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="h-64 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 px-4">
        {/* Stories Loading */}
        <Card className="p-6">
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
            {/* Loading skeletons */}
            {[...Array(8)].map((_, index) => (
              <div key={index} className="flex-shrink-0 flex flex-col items-center space-y-2 px-1">
                <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse p-2"></div>
                <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </Card>

        {/* Posts Loading */}
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="h-64 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
        <ProtectedRoute>
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
      {/* Stories Section */}
      <Card className="p-6">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {/* Add Story Button */}
          <div className="flex-shrink-0 flex flex-col items-center space-y-2 px-1">
            <div className="relative p-2">
              <Avatar
                src={user?.avatar}
                alt="Tu historia"
                size="xl"
                fallback={user?.fullName || user?.username || 'Tú'}
                interactive
                ring
                ringColor="blue"
              />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                <PlusIcon />
              </div>
            </div>
            <span className="text-xs text-gray-600 font-medium">Tu historia</span>
          </div>

        {/* Stories */}
        {stories.map((userWithStories) => (
          <div key={userWithStories._id} className="flex-shrink-0 flex flex-col items-center space-y-2 px-1">
            <div className="relative p-2">
              <Avatar
                src={userWithStories.avatar}
                alt={userWithStories.username}
                size="xl"
                fallback={userWithStories.fullName || userWithStories.username}
                interactive
                ring={true}
                ringColor="purple"
              />
              {userWithStories.storiesCount > 1 && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <span className="text-xs font-bold text-gray-700">
                    {userWithStories.storiesCount}
                  </span>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-600 font-medium truncate max-w-16">
              {userWithStories.username}
            </span>
          </div>
        ))}
        </div>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts && posts.length > 0 && posts.map((post) => (
          <PostCard
            key={post._id}
            post={{
              id: post._id,
              user: {
                id: post.user._id,
                username: post.user.username,
                ...(post.user.avatar && { avatar: post.user.avatar }),
                ...(post.user.fullName && { fullName: post.user.fullName }),
              },
              content: {
                type: post.type,
                url: post.content.images?.[0]?.url || post.content.video?.url || '',
                ...(post.content.text && { text: post.content.text }),
              },
              caption: post.caption,
              likes: post.likes.length,
              comments: post.comments.length,
              isLiked: post.isLiked || false,
              createdAt: post.createdAt,
            }}
            onLike={handleLike}
            onComment={(postId) => {
              if (!posts || !Array.isArray(posts)) return;
              const post = posts.find(p => p._id === postId);
              if (post) {
                handleComment(postId, post.user.username, post.content?.images?.[0]?.url);
              }
            }}
            onShare={(postId) => {
              if (!posts || !Array.isArray(posts)) return;
              const post = posts.find(p => p._id === postId);
              if (post) {
                handleShare(postId, `${window.location.origin}/${post.user.username}/post/${postId}`, post.caption);
              }
            }}
            onUserClick={(userId) => {
              if (!posts || !Array.isArray(posts)) return;
              const post = posts.find(p => p.user._id === userId);
              if (post) {
                handleUserClick(post.user._id);
              }
            }}
            onDelete={(postId) => {
              handlePostDeleted(postId);
            }}
            onPostClick={(postId) => {
              if (!posts || !Array.isArray(posts)) return;
              const post = posts.find(p => p._id === postId);
              if (post) {
                handlePostClick(postId, post.user.username);
              }
            }}
            className="animate-fade-in"
          />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {posts && posts.length > 0 && (
        <div ref={observerRef} className="flex justify-center pt-6">
          {loadingMore && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Cargando más publicaciones...</span>
            </div>
          )}
          {!hasMore && !loadingMore && (
            <p className="text-gray-500 text-sm">
              Has visto todos los posts disponibles
            </p>
          )}
        </div>
      )}

      {/* Empty State para cuando no hay posts */}
      {(!posts || posts.length === 0) && !loading && (
        <Card className="p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay publicaciones aún
            </h3>
            <p className="text-gray-600 mb-6">
              Sigue a algunas personas para ver sus publicaciones aquí, o crea tu primera publicación.
            </p>
            <div className="space-y-3">
              <Button
                variant="primary"
                gradient
                size="lg"
                leftIcon={<PlusIcon />}
                className="w-full"
                onClick={() => router.push('/post/create')}
              >
                Crear primera publicación
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={() => router.push('/explore')}
              >
                Explorar personas
              </Button>
            </div>
          </div>
        </Card>
      )}

                {/* Modals */}
                <CommentsModal
                  isOpen={commentsModal.isOpen}
                  onClose={() => setCommentsModal({ isOpen: false, postId: '', postAuthor: '' })}
                  postId={commentsModal.postId}
                  postAuthor={commentsModal.postAuthor}
                  postImage={commentsModal.postImage}
                />

                <ShareModal
                  isOpen={shareModal.isOpen}
                  onClose={() => setShareModal({ isOpen: false, postId: '', postUrl: '', postCaption: '' })}
                  postId={shareModal.postId}
                  postUrl={shareModal.postUrl}
                  postCaption={shareModal.postCaption}
                />
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <UserSuggestions />
              </div>
            </div>
          </div>
        </ProtectedRoute>
      );
}
