"use client";

import { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { getReel } from '@/services/reelService';
import { getUserProfileByUsername } from '@/services/userService';
import VideoPlayer from '@/components/VideoPlayer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/features/auth/useAuth';

interface Props {
  params: Promise<{ username: string; id: string }>;
}

export default function UserReelPage({ params }: Props) {
  const [reel, setReel] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { user: currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const { username, id } = await params;

        // Cargar reel y usuario en paralelo
        const [reelResponse, userResponse] = await Promise.all([
          getReel(id),
          getUserProfileByUsername(username)
        ]);

        if (reelResponse.success && userResponse) {
          const reelData = reelResponse.reel;
          const userData = userResponse;

          // Verificar que el reel pertenece al usuario correcto
          if (reelData.user.username !== username) {
            setError(true);
            return;
          }

          setReel(reelData);
          setUser(userData);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error loading reel:', err);
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
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !reel || !user) {
    return notFound();
  }

  const handleLike = () => {
    // Implementar lógica de like
    console.log('Like reel:', reel._id);
  };

  const handleShare = () => {
    // Implementar lógica de compartir
    console.log('Share reel:', reel._id);
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
            <span className="text-gray-900 font-medium">Reel</span>
          </div>
        </nav>

        {/* Reel */}
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
                  {new Date(reel.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Video */}
          <div className="relative">
            <VideoPlayer
              src={reel.video.url}
              poster={reel.video.thumbnail}
              autoPlay={true}
              loop={true}
              muted={false}
              isActive={true}
              className="w-full aspect-[9/16] object-cover"
            />
          </div>

          {/* Actions */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 transition-colors ${
                    reel.likes.includes(currentUser?._id || '')
                      ? 'text-red-500'
                      : 'text-gray-600 hover:text-red-500'
                  }`}
                >
                  <svg className="w-6 h-6" fill={reel.likes.includes(currentUser?._id || '') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm font-medium">{reel.likes.length}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span className="text-sm font-medium">{reel.shares}</span>
                </button>
              </div>
            </div>

            {/* Caption */}
            {reel.caption && (
              <p className="text-gray-900 mb-2">
                <span className="font-semibold">{user.username}</span> {reel.caption}
              </p>
            )}

            {/* Hashtags */}
            {reel.hashtags && reel.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {reel.hashtags.map((hashtag: string, index: number) => (
                  <span key={index} className="text-blue-500 text-sm">
                    #{hashtag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
