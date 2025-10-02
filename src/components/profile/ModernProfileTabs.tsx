"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getUserPosts } from '@/services/postService';
import { Post } from '@/services/postService';
import { formatNumber } from '@/utils/format';

interface ModernProfileTabsProps {
  username: string;
  isOwnProfile: boolean;
}

type TabType = 'posts';

interface TabData {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  count: number;
}

export default function ModernProfileTabs({ username, isOwnProfile }: ModernProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para posts
  const [posts, setPosts] = useState<Post[]>([]);

  // Estados de paginación
  const [postsPage, setPostsPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  // Contador de posts
  const [postsCount, setPostsCount] = useState(0);

  // Icono para posts
  const getTabIcon = () => {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  };

  // Cargar contenido inicial
  const loadContent = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!username) return;

    setLoading(true);
    setError(null);

    try {
      let newContent: any[] = [];
      let hasMore = false;

      // Solo cargar posts
      const postsData = await getUserPosts(username, page, 12);
      newContent = Array.isArray(postsData?.posts) ? postsData.posts : [];
      hasMore = (postsData as any)?.hasMore || false;
      setPostsCount((postsData as any)?.total || newContent.length);

      if (append) {
        setPosts(prev => [...prev, ...newContent]);
        setHasMorePosts(hasMore);
      } else {
        setPosts(newContent);
        setHasMorePosts(hasMore);
      }
    } catch (err) {
      console.error(`Error loading posts:`, err);
      setError(`Error al cargar posts`);
    } finally {
      setLoading(false);
    }
  }, [username]);

  // Cargar contenido cuando se monta el componente
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // Cargar más contenido
  const handleLoadMore = useCallback(async () => {
    if (loading) return;

    if (hasMorePosts) {
      const nextPage = postsPage + 1;
      setPostsPage(nextPage);
      await loadContent(nextPage, true);
    }
  }, [loading, hasMorePosts, postsPage, loadContent]);

  // Datos de las pestañas - Solo posts
  const tabs: TabData[] = [
    {
      id: 'posts',
      label: 'Publicaciones',
      icon: getTabIcon(),
      count: postsCount
    }
  ];

  // Renderizar contenido de posts
  const renderTabContent = () => {
    if (loading && posts.length === 0) {
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
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Error al cargar publicaciones</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => loadContent()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Reintentar
          </button>
        </div>
      );
    }

    // Asegurar que posts siempre sea un array
    const safePosts = Array.isArray(posts) ? posts : [];

    if (safePosts.length === 0) {
      return <ModernEmptyState isOwnProfile={isOwnProfile} />;
    }

    return (
      <div className="p-4 sm:p-6">
        <ModernContentGrid content={safePosts} />
        {hasMorePosts && (
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
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/10 to-purple-50/10"></div>
      
      <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/40 overflow-hidden">
        {/* Pestañas mejoradas */}
        <div className="border-b border-gray-200/50">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all duration-300 relative ${
                  activeTab === tab.id
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
                <span className={`px-2 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
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

// Componente para el estado vacío de posts
function ModernEmptyState({ isOwnProfile }: { isOwnProfile: boolean }) {
  const getEmptyMessage = () => {
    if (isOwnProfile) {
      return {
        title: 'No hay publicaciones aún',
        subtitle: '¡Comienza a crear contenido para que aparezca aquí!',
        icon: '📸',
        color: 'from-blue-400 to-purple-400'
      };
    } else {
      return {
        title: 'No hay publicaciones',
        subtitle: 'Este usuario aún no ha compartido contenido.',
        icon: '📸',
        color: 'from-gray-400 to-gray-500'
      };
    }
  };

  const message = getEmptyMessage();

  return (
    <div className="text-center py-12 px-6">
      <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${message.color} rounded-2xl flex items-center justify-center text-2xl shadow-md`}>
        {message.icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{message.title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto leading-relaxed text-sm">{message.subtitle}</p>
      {isOwnProfile && (
        <div className="flex justify-center gap-4">
          <button className={`px-6 py-3 bg-gradient-to-r ${message.color} text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 font-medium text-sm`}>
            Crear Publicación
          </button>
        </div>
      )}
    </div>
  );
}

// Componente para la cuadrícula de posts
function ModernContentGrid({ content }: { content: any[] }) {
  // Asegurar que content siempre sea un array
  const safeContent = Array.isArray(content) ? content : [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
      {safeContent.map((post) => (
        <div key={post._id} className="aspect-square rounded-2xl lg:rounded-3xl overflow-hidden bg-gray-100 relative group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <img 
            src={post.content?.images?.[0]?.url || ''} 
            alt="Post"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 rounded-2xl lg:rounded-3xl transition-all duration-300" />
        </div>
      ))}
    </div>
  );
}

// Componente para el skeleton de carga compacto
function ModernContentSkeleton() {
  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="aspect-square rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse shadow-md" />
        ))}
      </div>
    </div>
  );
}
