"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import UserSearch from '@/components/UserSearch';
import ExploreGrid from '@/components/ExploreGrid';
import Image from 'next/image';
import { Card, Button } from '@/design-system';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getTrendingReels, Reel } from '@/services/reelService';
import { getUsersWithStories, UserWithStories } from '@/services/storyService';
import { getTrendingPosts, Post } from '@/services/postService';
import { Video, Clock, TrendingUp, Users, Tv, Radio } from 'lucide-react';
import logger from '@/utils/logger';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingReels, setTrendingReels] = useState<Reel[]>([]);
  const [recentStories, setRecentStories] = useState<UserWithStories[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const router = useRouter();

  const loadExploreContent = useCallback(async () => {
    try {

      // Cargar reels trending
      const reelsResponse = await getTrendingReels('week', 6);
      if (reelsResponse.success) {
        setTrendingReels(reelsResponse.reels || []);
      }

      // Cargar posts trending

      const postsResponse = await getTrendingPosts(8);

      if (postsResponse.success) {
        setTrendingPosts(postsResponse.posts || []);

      } else {

      }

      // Cargar stories recientes
      const storiesResponse = await getUsersWithStories();
      if (storiesResponse.success) {
        setRecentStories(storiesResponse.users?.slice(0, 8) || []);
      }
    } catch (loadContentError) {
      logger.error('Error loading explore content:', {
        error: loadContentError instanceof Error ? loadContentError.message : 'Unknown error'
      });
    }
  }, []);

  useEffect(() => {
    loadExploreContent();
  }, [loadExploreContent]);

  // Refrescar contenido cuando el usuario regresa de crear un post
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {

        loadExploreContent();
      }
    };

    const handleFocus = () => {

      loadExploreContent();
    };

    // Escuchar cambios de visibilidad y focus
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadExploreContent]);

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Explorar</h1>
          <p className="text-gray-600 dark:text-gray-400">Descubre contenido increíble y conoce nuevas personas</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <UserSearch
            query={searchQuery}
            onResultClick={() => setSearchQuery('')}
          />
        </div>

        {/* Sección de Reels Trending */}
        {trendingReels.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reels Trending</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/reels')}
                className="text-blue-600 hover:text-blue-700"
              >
                Ver todos
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {trendingReels.map((reel) => (
                <Card
                  key={reel._id}
                  className="p-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/${reel.user.username}/reel/${reel._id}`)}
                >
                  <div className="aspect-[9/16] relative">
                    <video
                      className="w-full h-full object-cover"
                      src={reel.video.url}
                      poster={reel.video.thumbnail}
                      muted
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-sm font-medium truncate">
                        @{reel.user.username}
                      </p>
                      <div className="flex items-center text-white text-xs mt-1">
                        <Video className="w-3 h-3 mr-1" />
                        <span>{reel.likes.length} likes</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Sección de Posts Trending */}
        {trendingPosts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Posts Trending</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/feed')}
                className="text-green-600 hover:text-green-700"
              >
                Ver todos
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trendingPosts.map((post) => (
                <Card
                  key={post._id}
                  className="p-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/${post.user.username}/post/${post._id}`)}
                >
                  <div className="aspect-[9/16] relative">
                    {post.content.images && post.content.images[0] ? (
                      <Image
                        fill
                        className="object-cover"
                        src={post.content.images[0].url}
                        alt={post.caption || 'Post trending'}
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    ) : post.content.video ? (
                      <video
                        className="absolute inset-0 w-full h-full object-cover"
                        src={post.content.video.url}
                        poster={post.content.video.thumbnail}
                        muted
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Sin contenido</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-sm font-medium truncate">
                        @{post.user.username}
                      </p>
                      <div className="flex items-center text-white text-xs mt-1">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{post.likes.length} likes</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Sección de Stories Recientes */}
        {recentStories.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Stories Recientes</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/stories')}
                className="text-purple-600 hover:text-purple-700"
              >
                Ver todas
              </Button>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {recentStories.map((user) => (
                <Card
                  key={user._id}
                  className="p-3 text-center cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/stories?user=${user.username}`)}
                >
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-600 p-0.5">
                      <div className="w-full h-full rounded-full bg-white p-0.5 relative">
                        <Image
                          src={user.avatar || '/default-avatar.png'}
                          alt={`Story de ${user.username}`}
                          fill
                          className="rounded-full object-cover"
                          sizes="64px"
                        />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        {user.storiesCount}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 truncate">
                    {user.username}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Sección de Descubrimiento */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Users className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Descubrir Personas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Explorar Reels</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Descubre videos cortos increíbles de la comunidad
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/reels')}
                className="w-full"
              >
                Ver Reels
              </Button>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Ver Stories</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Mantente al día con las historias de tus amigos
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/stories')}
                className="w-full"
              >
                Ver Stories
              </Button>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Buscar Personas</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Encuentra nuevos amigos y personas interesantes
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="w-full"
              >
                Buscar
              </Button>
            </Card>
          </div>
        </div>

        {/* Sección de CSTV y Live */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Radio className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Contenido en Vivo</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CSTV */}
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => router.push('/cstv')}>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Tv className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">CSTV</h3>
                    <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full">
                      ✨ NUEVO
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Descubre contenido exclusivo de CSTV, entrevistas, programas especiales y mucho más
                  </p>
                  <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                    <span>Explorar CSTV</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Card>

            {/* Live */}
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => router.push('/live')}>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Radio className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">En Vivo</h3>
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                      🔴 LIVE
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Únete a transmisiones en vivo, eventos especiales y contenido en tiempo real
                  </p>
                  <div className="flex items-center text-red-600 text-sm font-medium group-hover:text-red-700">
                    <span>Ver Transmisiones</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Grid de contenido tradicional */}
        <ExploreGrid />
      </div>
    </ProtectedRoute>
  );
}
