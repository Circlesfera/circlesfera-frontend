"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { getUserPosts } from '@/services/postService';
import { getUserReels } from '@/services/reelService';
import { getUserStories } from '@/services/storyService';
import { Post } from '@/services/postService';
import { Reel } from '@/services/reelService';
import { Story } from '@/services/storyService';
import { formatNumber } from '@/utils/format';

interface ModernProfileTabsProps {
  username: string;
  isOwnProfile: boolean;
}

type TabType = 'posts' | 'reels' | 'stories';

interface TabData {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  count: number;
}

export default function ModernProfileTabs({ username, isOwnProfile }: ModernProfileTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para cada tipo de contenido
  const [posts, setPosts] = useState<Post[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [stories, setStories] = useState<Story[]>([]);

  // Estados de paginación
  const [postsPage, setPostsPage] = useState(1);
  const [reelsPage, setReelsPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreReels, setHasMoreReels] = useState(true);

  // Contadores de contenido
  const [contentCounts, setContentCounts] = useState({
    posts: 0,
    reels: 0,
    stories: 0
  });

  // Iconos para las pestañas
  const getTabIcon = (type: TabType) => {
    switch (type) {
      case 'posts':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'reels':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'stories':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
    }
  };

  // Cargar contenido inicial
  const loadContent = useCallback(async (type: TabType, page: number = 1, append: boolean = false) => {
    if (!username) return;

    setLoading(true);
    setError(null);

    try {
      let newContent: (Post | Reel | Story)[] = [];
      let hasMore = false;

      switch (type) {
        case 'posts':

          const postsData = await getUserPosts(username, page, 12);

          newContent = Array.isArray(postsData?.posts) ? postsData.posts : [];
          hasMore = postsData?.hasMore || false;
          setContentCounts(prev => ({ ...prev, posts: postsData?.pagination?.total || newContent.length }));

          break;
        case 'reels':
          const reelsData = await getUserReels(username, page, 12);
          newContent = Array.isArray(reelsData?.reels) ? reelsData.reels : [];
          hasMore = (reelsData?.pagination?.page || 0) < (reelsData?.pagination?.pages || 0);
          setContentCounts(prev => ({ ...prev, reels: reelsData?.pagination?.total || newContent.length }));
          break;
        case 'stories':
          const storiesData = await getUserStories(username);
          newContent = Array.isArray(storiesData) ? storiesData : [];
          setContentCounts(prev => ({ ...prev, stories: Array.isArray(storiesData) ? storiesData.length : 0 }));
          break;
      }

      if (append) {
        if (type === 'posts') {
          setPosts(prev => [...prev, ...(newContent as Post[])]);
          setHasMorePosts(hasMore);
        } else if (type === 'reels') {
          setReels(prev => [...prev, ...(newContent as Reel[])]);
          setHasMoreReels(hasMore);
        }
      } else {
        if (type === 'posts') {
          setPosts(newContent as Post[]);
          setHasMorePosts(hasMore);
        } else if (type === 'reels') {
          setReels(newContent as Reel[]);
          setHasMoreReels(hasMore);
        } else if (type === 'stories') {
          setStories(newContent as Story[]);
        }
      }
    } catch (err) {
      // Solo logear errores críticos
      if (err instanceof Error && err.message.includes('500')) {

      }
      setError(`Error al cargar ${type}`);
    } finally {
      setLoading(false);
    }
  }, [username]);

  // Cargar contenido cuando cambia la pestaña activa
  useEffect(() => {
    if (activeTab) {
      loadContent(activeTab);
    }
  }, [activeTab, loadContent]);

  // Refrescar contenido cuando el usuario regresa de crear un post
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && activeTab) {

        loadContent(activeTab);
      }
    };

    const handleFocus = () => {
      if (activeTab) {

        loadContent(activeTab);
      }
    };

    // Escuchar cambios de visibilidad y focus
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [activeTab, loadContent]);

  // Cargar más contenido
  const handleLoadMore = useCallback(async () => {
    if (loading) return;

    if (activeTab === 'posts' && hasMorePosts) {
      const nextPage = postsPage + 1;
      setPostsPage(nextPage);
      await loadContent('posts', nextPage, true);
    } else if (activeTab === 'reels' && hasMoreReels) {
      const nextPage = reelsPage + 1;
      setReelsPage(nextPage);
      await loadContent('reels', nextPage, true);
    }
  }, [activeTab, loading, hasMorePosts, hasMoreReels, postsPage, reelsPage, loadContent]);

  // Datos de las pestañas
  const tabs: TabData[] = [
    {
      id: 'posts',
      label: 'Publicaciones',
      icon: getTabIcon('posts'),
      count: contentCounts.posts
    },
    {
      id: 'reels',
      label: 'Reels',
      icon: getTabIcon('reels'),
      count: contentCounts.reels
    },
    {
      id: 'stories',
      label: 'Stories',
      icon: getTabIcon('stories'),
      count: contentCounts.stories
    }
  ];

  // Renderizar contenido de la pestaña activa
  const renderTabContent = () => {
    if (loading && (activeTab === 'posts' ? posts.length === 0 : activeTab === 'reels' ? reels.length === 0 : stories.length === 0)) {
      return <ModernContentSkeleton />;
    }

    if (error) {
      return (
        <div className="text-center py-16 px-6">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Error al cargar contenido</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => loadContent(activeTab)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Reintentar
          </button>
        </div>
      );
    }

    const currentContent = activeTab === 'posts' ? posts : activeTab === 'reels' ? reels : stories;
    const hasMore = activeTab === 'posts' ? hasMorePosts : activeTab === 'reels' ? hasMoreReels : false;

    // Asegurar que currentContent siempre sea un array
    const safeCurrentContent = Array.isArray(currentContent) ? currentContent : [];

    if (safeCurrentContent.length === 0) {
      return <ModernEmptyState tabType={activeTab} isOwnProfile={isOwnProfile} router={router} />;
    }

    return (
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header con navegación rápida */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {activeTab === 'posts' ? 'Publicaciones' : activeTab === 'reels' ? 'Reels' : 'Stories'}
          </h3>
          <div className="flex items-center gap-3">
            {safeCurrentContent.length > 0 && (
              <button
                onClick={() => {
                  switch (activeTab) {
                    case 'posts':
                      router.push(`/${username}?tab=posts`);
                      break;
                    case 'reels':
                      router.push(`/${username}?tab=reels`);
                      break;
                    case 'stories':
                      router.push(`/${username}?tab=stories`);
                      break;
                  }
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                Ver todos
              </button>
            )}
            {isOwnProfile && (
              <button
                onClick={() => {
                  switch (activeTab) {
                    case 'posts':
                      router.push('/post/create');
                      break;
                    case 'reels':
                      router.push('/create/reel');
                      break;
                    case 'stories':
                      router.push('/create/story');
                      break;
                  }
                }}
                className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
              >
                + Crear
              </button>
            )}
          </div>
        </div>

        <ModernContentGrid content={safeCurrentContent} type={activeTab} username={username} />
        {hasMore && (
          <div className="text-center mt-6">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium text-sm"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Cargando...
                </div>
              ) : (
                'Cargar más'
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Background - Simplified */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/5 to-purple-50/5 rounded-xl"></div>

      <div className="relative bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100/50 overflow-hidden">
        {/* Pestañas mejoradas */}
        <div className="border-b border-gray-200/50">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all duration-300 relative ${activeTab === tab.id
                  ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                  }`}
              >
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                )}
                <div className={`transition-colors duration-300 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}`}>
                  {tab.icon}
                </div>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">
                  {tab.id === 'posts' ? 'Posts' : tab.id === 'reels' ? 'Reels' : 'Stories'}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (tab.count > 0) {
                      switch (tab.id) {
                        case 'posts':
                          router.push(`/${username}?tab=posts`);
                          break;
                        case 'reels':
                          router.push(`/${username}?tab=reels`);
                          break;
                        case 'stories':
                          router.push(`/${username}?tab=stories`);
                          break;
                      }
                    }
                  }}
                  className={`px-2 py-1 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer hover:scale-105 ${activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } ${tab.count > 0 ? 'hover:shadow-md' : 'cursor-default'}`}
                >
                  {formatNumber(tab.count)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        {renderTabContent()}
      </div>
    </div>
  );
}

// Componente para el estado vacío mejorado
function ModernEmptyState({ tabType, isOwnProfile, router }: { tabType: TabType; isOwnProfile: boolean; router: AppRouterInstance }) {
  const getEmptyMessage = () => {
    if (isOwnProfile) {
      switch (tabType) {
        case 'posts':
          return {
            title: 'No hay publicaciones aún',
            subtitle: '¡Comienza a crear contenido para que aparezca aquí!',
            icon: '📸',
            color: 'from-blue-400 to-purple-400'
          };
        case 'reels':
          return {
            title: 'No hay reels aún',
            subtitle: '¡Crea tu primer reel y comparte tu creatividad!',
            icon: '🎬',
            color: 'from-purple-400 to-pink-400'
          };
        case 'stories':
          return {
            title: 'No hay stories aún',
            subtitle: '¡Comparte momentos efímeros con tus seguidores!',
            icon: '📱',
            color: 'from-pink-400 to-red-400'
          };
      }
    } else {
      switch (tabType) {
        case 'posts':
          return {
            title: 'No hay publicaciones',
            subtitle: 'Este usuario aún no ha compartido contenido.',
            icon: '📸',
            color: 'from-gray-400 to-gray-500'
          };
        case 'reels':
          return {
            title: 'No hay reels',
            subtitle: 'Este usuario aún no ha creado reels.',
            icon: '🎬',
            color: 'from-gray-400 to-gray-500'
          };
        case 'stories':
          return {
            title: 'No hay stories',
            subtitle: 'Este usuario aún no ha compartido stories.',
            icon: '📱',
            color: 'from-gray-400 to-gray-500'
          };
      }
    }
  };

  const message = getEmptyMessage();

  return (
    <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
      <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${message.color} rounded-2xl flex items-center justify-center text-2xl shadow-md`}>
        {message.icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{message.title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto leading-relaxed text-sm">{message.subtitle}</p>
      {isOwnProfile && (
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              switch (tabType) {
                case 'posts':
                  router.push('/create/post');
                  break;
                case 'reels':
                  router.push('/create/reel');
                  break;
                case 'stories':
                  router.push('/create/story');
                  break;
              }
            }}
            className={`px-6 py-3 bg-gradient-to-r ${message.color} text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 font-medium text-sm`}
          >
            Crear {tabType === 'posts' ? 'Publicación' : tabType === 'reels' ? 'Reel' : 'Story'}
          </button>
        </div>
      )}
    </div>
  );
}

// Componente para la cuadrícula de contenido mejorada
function ModernContentGrid({ content, type, username }: { content: (Post | Reel | Story)[]; type: TabType; username: string }) {
  const router = useRouter();

  // Asegurar que content siempre sea un array
  const safeContent = Array.isArray(content) ? content : [];

  const handleContentClick = (itemId: string) => {
    switch (type) {
      case 'posts':
        router.push(`/${username}/post/${itemId}`);
        break;
      case 'reels':
        router.push(`/${username}/reel/${itemId}`);
        break;
      case 'stories':
        router.push(`/${username}/story/${itemId}`);
        break;
    }
  };

  if (type === 'stories') {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        {safeContent.map((story) => (
          <div
            key={story._id}
            onClick={() => handleContentClick(story._id)}
            className="aspect-video rounded-2xl lg:rounded-3xl overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 relative group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0">
              <Image
                src={(story as Story).content?.image?.url || '/placeholder.png'}
                alt="Story"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 rounded-2xl lg:rounded-3xl transition-all duration-300" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
      {safeContent.map((item) => {
        const post = item as Post;
        const reel = item as Reel;
        const isCarousel = type === 'posts' && post.content?.images && post.content.images.length > 1;
        const isVideo = type === 'posts' && post.type === 'video';

        return (
          <div
            key={item._id}
            onClick={() => handleContentClick(item._id)}
            className="aspect-[9/16] rounded-2xl lg:rounded-3xl overflow-hidden bg-gray-100 relative group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0">
              {type === 'posts' ? (
                <Image
                  src={post.content?.images?.[0]?.url || '/placeholder.png'}
                  alt="Post"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              ) : (
                <video
                  src={reel.video?.url || ''}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  muted
                />
              )}
            </div>

            {/* Indicador de carrusel (múltiples imágenes) - esquina superior derecha */}
            {isCarousel && (
              <div className="absolute top-3 right-3 z-10">
                <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 5h2v14H3V5zm4 0h12c1.103 0 2 .897 2 2v10c0 1.103-.897 2-2 2H7c-1.103 0-2-.897-2-2V7c0-1.103.897-2 2-2z" />
                </svg>
              </div>
            )}

            {/* Indicador de video - esquina superior derecha */}
            {isVideo && (
              <div className="absolute top-3 right-3 z-10">
                <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 rounded-2xl lg:rounded-3xl transition-all duration-300" />

            {/* Video play icon for reels - centro, aparece al hover */}
            {type === 'reels' && (
              <>
                <div className="absolute top-3 right-3 z-10">
                  <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Componente para el skeleton de carga compacto
function ModernContentSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="aspect-square rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse shadow-md" />
        ))}
      </div>
    </div>
  );
}
