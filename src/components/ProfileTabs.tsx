"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { getUserPosts } from '@/services/postService';
import { getUserReels } from '@/services/reelService';
import { getUserLongVideos } from '@/services/longVideoService';
import { getUserStories } from '@/services/storyService';
import { Post } from '@/services/postService';
import { Reel } from '@/services/reelService';
import { LongVideo } from '@/services/longVideoService';
import { Story } from '@/services/storyService';

interface ProfileTabsProps {
  username: string;
  isOwnProfile: boolean;
}

type TabType = 'posts' | 'reels' | 'videos' | 'stories';

interface TabData {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  count: number;
}

export default function ProfileTabs({ username, isOwnProfile }: ProfileTabsProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para cada tipo de contenido
  const [posts, setPosts] = useState<Post[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [longVideos, setLongVideos] = useState<LongVideo[]>([]);
  const [stories, setStories] = useState<Story[]>([]);

  // Estados de paginación
  const [postsPage, setPostsPage] = useState(1);
  const [reelsPage, setReelsPage] = useState(1);
  const [videosPage, setVideosPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreReels, setHasMoreReels] = useState(true);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);

  // Contadores de contenido
  const [contentCounts, setContentCounts] = useState({
    posts: 0,
    reels: 0,
    videos: 0,
    stories: 0
  });

  // Iconos para las pestañas
  const tabs: TabData[] = [
    {
      id: 'posts',
      label: 'Publicaciones',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
        </svg>
      ),
      count: contentCounts.posts
    },
    {
      id: 'reels',
      label: 'Reels',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      count: contentCounts.reels
    },
    {
      id: 'videos',
      label: 'Videos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 14l2-2 4-4M9 14l4 4M9 14l2-2" />
        </svg>
      ),
      count: contentCounts.videos
    },
    {
      id: 'stories',
      label: 'Stories',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      count: contentCounts.stories
    }
  ];

  // Cargar contenido inicial
  useEffect(() => {
    if (username) {
      loadInitialContent();
    }
  }, [username]);

  // Cargar contenido cuando cambie la pestaña
  useEffect(() => {
    const loadTabContent = async () => {
      try {
        if (activeTab === 'posts' && posts.length === 0) {
          await loadPosts();
        } else if (activeTab === 'reels' && reels.length === 0) {
          await loadReels();
        } else if (activeTab === 'videos' && longVideos.length === 0) {
          await loadLongVideos();
        } else if (activeTab === 'stories' && stories.length === 0) {
          await loadStories();
        }
      } catch (error) {
        console.error('Error loading tab content:', error);
        // No propagar el error, solo loggear
      }
    };

    loadTabContent();
  }, [activeTab]);

  // Cargar contenido inicial
  const loadInitialContent = async () => {
    setLoading(true);
    setError(null);

    try {
      // Cargar posts iniciales
      await loadPosts();
      
      // Cargar contadores
      await loadContentCounts();
      
    } catch (error) {
      console.error('Error loading initial content:', error);
      setError('Error al cargar el contenido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar contadores de contenido
  const loadContentCounts = async () => {
    try {
      // Aquí podrías hacer una llamada específica para obtener solo los contadores
      // Por ahora usamos los datos ya cargados
      setContentCounts({
        posts: posts.length,
        reels: reels.length,
        videos: longVideos.length,
        stories: stories.length
      });
    } catch (error) {
      console.error('Error loading content counts:', error);
    }
  };

  // Cargar posts
  const loadPosts = async (page: number = 1, append: boolean = false) => {
    try {
      const response = await getUserPosts(username, page, 12);
      if (response.success) {
        if (append) {
          setPosts(prev => [...prev, ...response.posts]);
        } else {
          setPosts(response.posts);
        }
        setHasMorePosts(response.posts.length === 12);
        setPostsPage(page);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      throw error;
    }
  };

  // Cargar reels
  const loadReels = async (page: number = 1, append: boolean = false) => {
    try {
      console.log('🔄 loadReels llamado con:', { username, page, append });
      const response = await getUserReels(username, page, 12);
      console.log('✅ loadReels respuesta:', response);
      if (response.success) {
        if (append) {
          setReels(prev => [...prev, ...response.reels]);
        } else {
          setReels(response.reels);
        }
        setHasMoreReels(response.reels.length === 12);
        setReelsPage(page);
      }
    } catch (error: any) {
      console.error('❌ Error loading reels:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method
      });
      // No propagar el error, solo establecer reels vacío
      if (!append) {
        setReels([]);
      }
      setHasMoreReels(false);
    }
  };

  // Cargar videos largos
  const loadLongVideos = async (page: number = 1, append: boolean = false) => {
    try {
      const response = await getUserLongVideos(username, page, 12);
      if (response.success) {
        if (append) {
          setLongVideos(prev => [...prev, ...response.longVideos]);
        } else {
          setLongVideos(response.longVideos);
        }
        setHasMoreVideos(response.longVideos.length === 12);
        setVideosPage(page);
      }
    } catch (error) {
      console.error('Error loading long videos:', error);
      // No propagar el error, solo establecer videos vacío
      if (!append) {
        setLongVideos([]);
      }
      setHasMoreVideos(false);
    }
  };

  // Cargar stories
  const loadStories = async () => {
    try {
      const response = await getUserStories(username);
      if (response.success) {
        setStories(response.stories);
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      // No propagar el error, solo establecer stories vacío
      setStories([]);
    }
  };

  // Cargar más contenido (paginación)
  const loadMoreContent = async () => {
    if (loading) return;

    try {
      setLoading(true);
      
      if (activeTab === 'posts' && hasMorePosts) {
        await loadPosts(postsPage + 1, true);
      } else if (activeTab === 'reels' && hasMoreReels) {
        await loadReels(reelsPage + 1, true);
      } else if (activeTab === 'videos' && hasMoreVideos) {
        await loadLongVideos(videosPage + 1, true);
      }
    } catch (error) {
      console.error('Error loading more content:', error);
      // No establecer error global, solo loggear
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar pestaña
  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setError(null);
  };

  // Renderizar contenido de la pestaña activa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {posts.map((post) => (
              <div key={post._id} className="aspect-square relative group cursor-pointer">
                {post.content.images && post.content.images.length > 0 ? (
                  <img
                    src={post.content.images[0].url}
                    alt={post.caption || 'Post'}
                    className="w-full h-full object-cover"
                  />
                ) : post.content.video ? (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                    <video
                      src={post.content.video.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                )}
                
                {/* Overlay con estadísticas */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center space-x-4 text-white">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                      </svg>
                      <span className="text-sm font-medium">{post.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'reels':
        if (reels.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium mb-2">No hay reels aún</h3>
              <p className="text-sm text-center">Cuando subas reels, aparecerán aquí</p>
            </div>
          );
        }
        return (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {reels.map((reel) => (
              <div key={reel._id} className="aspect-[9/16] relative group cursor-pointer">
                <video
                  src={reel.video.url}
                  className="w-full h-full object-cover rounded-lg"
                  muted
                />
                
                {/* Overlay con estadísticas */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center space-x-4 text-white">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <span className="text-sm font-medium">{reel.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      <span className="text-sm font-medium">{reel.views?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Indicador de video */}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Reel
                </div>
              </div>
            ))}
          </div>
        );

      case 'videos':
        if (longVideos.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 14l2-2 4-4M9 14l4 4M9 14l2-2" />
              </svg>
              <h3 className="text-lg font-medium mb-2">No hay videos aún</h3>
              <p className="text-sm text-center">Cuando subas videos largos, aparecerán aquí</p>
            </div>
          );
        }
        return (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {longVideos.map((video) => (
              <div key={video._id} className="aspect-[16/9] relative group cursor-pointer">
                <video
                  src={video.video.url}
                  className="w-full h-full object-cover rounded-lg"
                  muted
                />
                
                {/* Overlay con estadísticas */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center space-x-4 text-white">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <span className="text-sm font-medium">{video.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      <span className="text-sm font-medium">{video.views?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Indicador de video largo */}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 14l2-2 4-4M9 14l4 4M9 14l2-2" />
                  </svg>
                  IGTV
                </div>

                {/* Título del video */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-white text-xs font-medium truncate">{video.title}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'stories':
        if (stories.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-lg font-medium mb-2">No hay stories activos</h3>
              <p className="text-sm text-center">Cuando subas stories, aparecerán aquí</p>
            </div>
          );
        }
        return (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {stories.map((story) => (
              <div key={story._id} className="aspect-square relative group cursor-pointer">
                {story.content.image ? (
                  <img
                    src={story.content.image.url}
                    alt="Story"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : story.content.video ? (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center relative rounded-lg">
                    <video
                      src={story.content.video.url}
                      className="w-full h-full object-cover rounded-lg"
                      muted
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center rounded-lg">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                )}

                {/* Indicador de story */}
                <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                  <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Story
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  // Renderizar mensaje cuando no hay contenido
  const renderEmptyState = () => {
    const messages = {
      posts: 'No hay publicaciones aún',
      reels: 'No hay reels aún',
      videos: 'No hay videos largos aún',
      stories: 'No hay stories activos'
    };

    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          {tabs.find(tab => tab.id === activeTab)?.icon}
        </div>
        <p className="text-gray-500 text-lg font-medium">{messages[activeTab]}</p>
        {isOwnProfile && (
          <p className="text-gray-400 text-sm mt-2">
            ¡Comienza a crear contenido para que aparezca aquí!
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Pestañas */}
      <div className="border-t border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span className="text-sm font-medium hidden sm:block">{tab.label}</span>
              <span className="text-xs text-gray-400">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenido de la pestaña */}
      <div className="p-4">
        {error && (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={loadInitialContent}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {!error && (
          <>
            {renderTabContent()}
            
            {/* Estado vacío */}
            {!loading && 
              ((activeTab === 'posts' && posts.length === 0) ||
               (activeTab === 'reels' && reels.length === 0) ||
               (activeTab === 'videos' && longVideos.length === 0) ||
               (activeTab === 'stories' && stories.length === 0)) && 
              renderEmptyState()
            }

            {/* Botón de cargar más */}
            {!loading && 
              ((activeTab === 'posts' && hasMorePosts) ||
               (activeTab === 'reels' && hasMoreReels) ||
               (activeTab === 'videos' && hasMoreVideos)) && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreContent}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cargar más
                </button>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 mt-2">Cargando...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
