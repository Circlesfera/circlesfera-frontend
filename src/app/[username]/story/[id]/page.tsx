"use client";

import { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { getStory } from '@/services/storyService';
import { getUserProfileByUsername } from '@/services/userService';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/features/auth/useAuth';

interface Props {
  params: Promise<{ username: string; id: string }>;
}

export default function UserStoryPage({ params }: Props) {
  const [story, setStory] = useState<Story | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { user: _currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const { username, id } = await params;

        // Cargar story y usuario en paralelo
        const [storyResponse, userResponse] = await Promise.all([
          getStory(id),
          getUserProfileByUsername(username)
        ]);

        if (storyResponse.success && userResponse) {
          const storyData = storyResponse.story;
          const userData = userResponse;

          // Verificar que la story pertenece al usuario correcto
          if (storyData.user.username !== username) {
            setError(true);
            return;
          }

          setStory(storyData);
          setUser(userData);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error loading story:', err);
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
            <div className="aspect-[9/16] bg-gray-200 rounded-lg mb-4"></div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !story || !user) {
    return notFound();
  }

  const handleView = () => {
    // Implementar lógica de visualización
    console.log('View story:', story._id);
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
            <span className="text-gray-900 font-medium">Story</span>
          </div>
        </nav>

        {/* Story */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar || '/default-avatar.png'}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">{user.username}</p>
                <p className="text-sm text-gray-500">
                  {new Date(story.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                {story.isExpired ? 'Expirada' : 'Activa'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="relative">
            {story.type === 'image' && story.content?.image?.url && (
              <img
                src={story.content.image.url}
                alt={story.content.text || 'Story image'}
                className="w-full aspect-[9/16] object-cover"
              />
            )}

            {story.type === 'video' && story.content?.video?.url && (
              <video
                src={story.content.video.url}
                className="w-full aspect-[9/16] object-cover"
                controls
              />
            )}

            {story.type === 'text' && (
              <div
                className="w-full aspect-[9/16] flex items-center justify-center p-8"
                style={{
                  background: story.content?.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                <p className="text-white text-lg font-medium text-center leading-relaxed">
                  {story.content?.text}
                </p>
              </div>
            )}

            {/* Overlay con texto si hay */}
            {story.content?.text && story.type !== 'text' && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-sm leading-relaxed">
                  {story.content.text}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-medium">{story.views}</span>
                </div>

                <button
                  onClick={handleView}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span className="text-sm font-medium">Compartir</span>
                </button>
              </div>
            </div>

            {/* Location */}
            {story.location && (
              <div className="flex items-center space-x-2 text-gray-500 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{story.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
