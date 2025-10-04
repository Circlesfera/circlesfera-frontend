"use client";

import React, { useState, useEffect } from 'react';
import { Card, PostCard, Button, Avatar } from '@/design-system';
import { useAuth } from '@/features/auth/useAuth';
import { getFeedPosts, Post } from '@/services/postService';
import { getUsersWithStories, UserWithStories } from '@/services/storyService';
import CommentsModal from '@/components/CommentsModal';
import ShareModal from '@/components/ShareModal';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<UserWithStories[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [commentsModal, setCommentsModal] = useState<{ isOpen: boolean; postId: string; postAuthor: string; postImage?: string | undefined }>({ isOpen: false, postId: '', postAuthor: '' });
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; postId: string; postUrl?: string | undefined; postCaption?: string | undefined }>({ isOpen: false, postId: '', postUrl: '', postCaption: '' });

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
      prevPosts.map((post: Post) =>
        post._id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes.filter(id => id !== user?._id) : [...post.likes, user?._id || ''],
            }
          : post
      )
    );
  };

  const handleComment = (postId: string, postAuthor: string, postImage?: string) => {
    setCommentsModal({
      isOpen: true,
      postId,
      postAuthor,
      postImage
    });
  };

  const handleShare = (postId: string, postUrl?: string, postCaption?: string) => {
    setShareModal({
      isOpen: true,
      postId,
      postUrl,
      postCaption
    });
  };

  const handleUserClick = (userId: string) => {
    router.push(`/${userId}`);
  };

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

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4">
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
        {posts.map((post) => (
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
              const post = posts.find(p => p._id === postId);
              if (post) {
                handleComment(postId, post.user.username, post.content?.images?.[0]?.url);
              }
            }}
            onShare={(postId) => {
              const post = posts.find(p => p._id === postId);
              if (post) {
                handleShare(postId, `${window.location.origin}/post/${postId}`, post.caption);
              }
            }}
            onUserClick={(userId) => {
              const post = posts.find(p => p.user._id === userId);
              if (post) {
                handleUserClick(post.user._id);
              }
            }}
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
  );
}