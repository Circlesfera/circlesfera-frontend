"use client";

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Card, PostCard, Avatar, Button } from '@/design-system';
import { useAuth } from '@/features/auth/useAuth';
import { getUsersWithStories, UserWithStories } from '@/services/storyService';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserSuggestions from '@/components/UserSuggestions';
import { useRouter } from 'next/navigation';
import { useFeed } from '@/hooks/useFeed';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import logger from '@/utils/logger';

// Lazy load componentes pesados
const CommentsModal = lazy(() => import('@/components/CommentsModal'));
const ShareModal = lazy(() => import('@/components/ShareModal'));
import { ModalLoader } from '@/components/ui/LoadingSpinner';
import { AnimatedPostList, AnimatedStoryList } from '@/components/ui/StaggeredList';

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
      } catch (loadStoriesError) {
        logger.error('Error loading stories in home:', {
          error: loadStoriesError instanceof Error ? loadStoriesError.message : 'Unknown error'
        });
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
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse p-2"></div>
                <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
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
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse p-2"></div>
                <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
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
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stories Section */}
            <Card className="p-6">
              <AnimatedStoryList stories={[{ _id: 'add-story', isAddStory: true }, ...stories]}>
                {(item) => {
                  if (item.isAddStory) {
                    return (
                      <div key="add-story" className="flex-shrink-0 flex flex-col items-center space-y-2 px-2">
                        <div className="relative p-2">
                          <Avatar
                            src={user?.avatar}
                            alt="Tu historia"
                            size="xl"
                            fallback={user?.fullName || user?.username || 'Tú'}
                            variant="primary"
                            interactive
                          />
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                            <PlusIcon />
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Tu historia</span>
                      </div>
                    );
                  }

                  return (
                    <div key={item._id} className="flex-shrink-0 flex flex-col items-center space-y-2 px-2">
                      <div className="relative p-2">
                        <Avatar
                          src={item.avatar}
                          alt={item.username}
                          size="xl"
                          fallback={item.fullName || item.username}
                          variant="story"
                          interactive
                        />
                        {item.storiesCount > 1 && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <span className="text-xs font-bold text-gray-700">
                              {item.storiesCount}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate max-w-16">
                        {item.username}
                      </span>
                    </div>
                  );
                }}
              </AnimatedStoryList>
            </Card>

            {/* Posts Feed */}
            <AnimatedPostList posts={posts || []}>
              {(post) => (
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
              )}
            </AnimatedPostList>

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
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No hay publicaciones aún
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                    Sigue a algunas personas para ver sus publicaciones aquí, o crea tu primera publicación.
                  </p>
                  <div className="space-y-3">
                    <Button
                      variant="gradient"
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

            {/* Modals con Lazy Loading */}
            <Suspense fallback={<ModalLoader text="Cargando comentarios..." />}>
              <CommentsModal
                isOpen={commentsModal.isOpen}
                onClose={() => setCommentsModal({ isOpen: false, postId: '', postAuthor: '' })}
                postId={commentsModal.postId}
                postAuthor={commentsModal.postAuthor}
                postImage={commentsModal.postImage}
              />
            </Suspense>

            <Suspense fallback={<ModalLoader text="Cargando compartir..." />}>
              <ShareModal
                isOpen={shareModal.isOpen}
                onClose={() => setShareModal({ isOpen: false, postId: '', postUrl: '', postCaption: '' })}
                postId={shareModal.postId}
                postUrl={shareModal.postUrl}
                postCaption={shareModal.postCaption}
              />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <UserSuggestions />
          </div>
        </div>
      </div>
    </ProtectedRoute >
  );
}
