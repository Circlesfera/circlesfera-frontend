"use client";

import React, { useState, useEffect } from 'react';
import { Card, PostCard, Button, Avatar } from '@/design-system';
import { useAuth } from '@/features/auth/useAuth';
import { getFeedPosts } from '@/services/postService';
import { getUsersWithStories } from '@/services/storyService';

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Cargar posts del feed
        const postsResponse = await getFeedPosts();
        if (postsResponse.success) {
          setPosts(postsResponse.posts || []);
        }
        
        // Cargar stories
        const storiesResponse = await getUsersWithStories();
        if (storiesResponse.success) {
          setStories(storiesResponse.users || []);
        }
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user]);

  const handleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleComment = (postId: string) => {
    console.log('Comentar en post:', postId);
    // TODO: Implementar modal de comentarios
  };

  const handleShare = (postId: string) => {
    console.log('Compartir post:', postId);
    // TODO: Implementar funcionalidad de compartir
  };

  const handleUserClick = (userId: string) => {
    console.log('Ver perfil de usuario:', userId);
    // TODO: Navegar al perfil del usuario
  };

  const PlusIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Loading State */}
        <Card className="p-4">
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
            {/* Loading skeletons */}
            {[...Array(8)].map((_, index) => (
              <div key={index} className="flex-shrink-0 flex flex-col items-center space-y-2">
                <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Stories Section */}
      <Card className="p-4">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {/* Add Story Button */}
          <div className="flex-shrink-0 flex flex-col items-center space-y-2">
            <div className="relative">
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
        {stories.map((story) => (
          <div key={story.id} className="flex-shrink-0 flex flex-col items-center space-y-2">
            <div className="relative">
              <Avatar
                src={story.avatar}
                alt={story.username}
                size="xl"
                fallback={story.fullName || story.username}
                interactive
                ring={story.hasUnviewedStories}
                ringColor="purple"
              />
              {story.storiesCount > 1 && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <span className="text-xs font-bold text-gray-700">
                    {story.storiesCount}
                  </span>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-600 font-medium truncate max-w-16">
              {story.username}
            </span>
          </div>
        ))}
        </div>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onUserClick={handleUserClick}
            className="animate-fade-in"
          />
        ))}
      </div>

      {/* Load More Button */}
      {posts.length > 0 && (
        <div className="flex justify-center pt-6">
          <Button
            variant="ghost"
            size="lg"
            onClick={async () => {
              try {
                setLoadingMore(true);
                const response = await getFeedPosts({ offset: posts.length });
                if (response.success && response.posts) {
                  setPosts(prev => [...prev, ...response.posts]);
                }
              } catch (error) {
                console.error('Error cargando más posts:', error);
              } finally {
                setLoadingMore(false);
              }
            }}
            loading={loadingMore}
            className="px-8"
          >
            {loadingMore ? 'Cargando...' : 'Cargar más publicaciones'}
          </Button>
        </div>
      )}

      {/* Empty State para cuando no hay posts */}
      {posts.length === 0 && (
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
              >
                Crear primera publicación
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full"
              >
                Explorar personas
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}