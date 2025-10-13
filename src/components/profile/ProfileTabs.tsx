"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import logger from '@/utils/logger';
import { getUserPosts } from '@/services/postService';
import { getUserReels } from '@/services/reelService';
import { getUserStories } from '@/services/storyService';
import { Post } from '@/services/postService';
import { Reel } from '@/services/reelService';
import { Story } from '@/services/storyService';
import { formatNumber } from '@/utils/format';

interface ProfileTabsProps {
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

export default function ProfileTabs({ username, isOwnProfile }: ProfileTabsProps) {
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
          hasMore = reelsData?.hasMore || false;
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
      logger.error('Error loading profile content:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        contentType: type,
        username,
        page
      });
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
      return <ContentSkeleton />;
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">Error al cargar contenido</h3>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => loadContent(activeTab)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
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
      return <EmptyState tabType={activeTab} isOwnProfile={isOwnProfile} />;
    }

    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <ContentGrid content={safeCurrentContent} type={activeTab} />
        {hasMore && (
          <div className="text-center mt-6 sm:mt-8">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 dark:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'Cargando...' : 'Cargar más'}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-none sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Pestañas */}
      <div className="border-b border-gray-200 dark:border-gray-700 dark:border-gray-700">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800'
                }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">
                {tab.id === 'posts' ? 'Posts' : tab.id === 'reels' ? 'Reels' : 'Stories'}
              </span>
              <span className="bg-gray-200 dark:bg-gray-600 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-500 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs">
                {formatNumber(tab.count)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      {renderTabContent()}
    </div>
  );
}

// Componente para el estado vacío
function EmptyState({ tabType, isOwnProfile }: { tabType: TabType; isOwnProfile: boolean }) {
  const getEmptyMessage = () => {
    if (isOwnProfile) {
      switch (tabType) {
        case 'posts':
          return {
            title: 'No hay publicaciones aún',
            subtitle: '¡Comienza a crear contenido para que aparezca aquí!',
            icon: '📸'
          };
        case 'reels':
          return {
            title: 'No hay reels aún',
            subtitle: '¡Crea tu primer reel y comparte tu creatividad!',
            icon: '🎬'
          };
        case 'stories':
          return {
            title: 'No hay stories aún',
            subtitle: '¡Comparte momentos efímeros con tus seguidores!',
            icon: '📱'
          };
      }
    } else {
      switch (tabType) {
        case 'posts':
          return {
            title: 'No hay publicaciones',
            subtitle: 'Este usuario aún no ha compartido contenido.',
            icon: '📸'
          };
        case 'reels':
          return {
            title: 'No hay reels',
            subtitle: 'Este usuario aún no ha creado reels.',
            icon: '🎬'
          };
        case 'stories':
          return {
            title: 'No hay stories',
            subtitle: 'Este usuario aún no ha compartido stories.',
            icon: '📱'
          };
      }
    }
  };

  const message = getEmptyMessage();

  return (
    <div className="text-center py-16 px-6">
      <div className="text-6xl mb-4">{message.icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">{message.title}</h3>
      <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-6">{message.subtitle}</p>
      {isOwnProfile && (
        <div className="flex justify-center gap-4">
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
            Crear {tabType === 'posts' ? 'Publicación' : tabType === 'reels' ? 'Reel' : 'Story'}
          </button>
        </div>
      )}
    </div>
  );
}

// Componente para la cuadrícula de contenido
function ContentGrid({ content, type }: { content: (Post | Reel | Story)[]; type: TabType }) {
  // Asegurar que content siempre sea un array
  const safeContent = Array.isArray(content) ? content : [];

  if (type === 'stories') {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        {safeContent.map((story) => (
          <div key={story._id} className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 relative group cursor-pointer">
            <Image
              src={(story as Story).content?.image?.url || '/placeholder.png'}
              alt="Story"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 33vw, 20vw"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-200" />
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
          <div key={item._id} className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 relative group cursor-pointer">
            {type === 'posts' ? (
              <Image
                src={post.content?.images?.[0]?.url || '/placeholder.png'}
                alt="Post"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
            ) : (
              <video
                src={reel.video?.url || ''}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                muted
              />
            )}

            {/* Indicador de carrusel (múltiples imágenes) */}
            {isCarousel && (
              <div className="absolute top-2 right-2 z-10">
                <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 5h2v14H3V5zm4 0h12c1.103 0 2 .897 2 2v10c0 1.103-.897 2-2 2H7c-1.103 0-2-.897-2-2V7c0-1.103.897-2 2-2z" />
                </svg>
              </div>
            )}

            {/* Indicador de video */}
            {(isVideo || type === 'reels') && (
              <div className="absolute top-2 right-2 z-10">
                <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}

            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
          </div>
        );
      })}
    </div>
  );
}

// Componente para el skeleton de carga
function ContentSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="aspect-square rounded-xl sm:rounded-2xl bg-gray-200 dark:bg-gray-600 dark:bg-gray-700 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
