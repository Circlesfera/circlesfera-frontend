"use client";

import { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { getPostById } from '@/services/postService';
import { getUserProfileByUsername } from '@/services/userService';
import PostCard from '@/design-system/components/PostCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/features/auth/useAuth';

interface Props {
  params: Promise<{ username: string; id: string }>;
}

export default function UserPostPage({ params }: Props) {
  const [post, setPost] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { user: currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const { username, id } = await params;

        // Cargar post y usuario en paralelo
        const [postResponse, userResponse] = await Promise.all([
          getPostById(id),
          getUserProfileByUsername(username)
        ]);

        if (postResponse.success && userResponse) {
          const postData = postResponse.post;
          const userData = userResponse;

          // Verificar que el post pertenece al usuario correcto
          if (postData.user.username !== username) {
            setError(true);
            return;
          }

          setPost(postData);
          setUser(userData);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error loading post:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="flex items-center space-x-3 mb-6">
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
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !post || !user) {
    return notFound();
  }

  const handleLike = (postId: string) => {
    // Implementar lógica de like
    console.log('Like post:', postId);
  };

  const handleComment = (postId: string) => {
    // Implementar lógica de comentario
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: string) => {
    // Implementar lógica de compartir
    console.log('Share post:', postId);
  };

  const handleUserClick = () => {
    router.push(`/${user.username}`);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <button
              onClick={() => router.push('/')}
              className="hover:text-gray-700 transition-colors"
            >
              Inicio
            </button>
            <span>/</span>
            <button
              onClick={() => router.push(`/${user.username}`)}
              className="hover:text-gray-700 transition-colors"
            >
              {user.username}
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">Post</span>
          </div>
        </nav>

        {/* Post */}
        <PostCard
          post={{
            id: post._id,
            user: {
              id: post.user._id,
              username: post.user.username,
              avatar: post.user.avatar,
              fullName: post.user.fullName,
            },
            content: {
              type: post.type,
              url: post.content.images?.[0]?.url || post.content.video?.url || '',
              text: post.content.text,
            },
            caption: post.caption,
            likes: post.likes.length,
            comments: post.comments.length,
            isLiked: post.likes.includes(currentUser?._id || ''),
            createdAt: post.createdAt,
          }}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onUserClick={handleUserClick}
          className="shadow-lg"
        />
      </div>
    </ProtectedRoute>
  );
}
