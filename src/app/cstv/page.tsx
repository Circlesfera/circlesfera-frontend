'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, TrendingUp, Clock, Search, Filter } from 'lucide-react';
import { useCSTVVideos, useTrendingVideos, useCSTVSearch } from '@/hooks/useCSTV';
import { CSTVVideoCard } from '@/components/cstv/CSTVVideoCard';
import { CSTV_CATEGORIES, type CSTVCategory } from '@/types/cstv';
import { useAuthContext } from '@/features/auth/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/services/axios';
import logger from '@/utils/logger';

export default function CSTVPage() {
  const [activeTab, setActiveTab] = useState<'trending' | 'recent' | 'search'>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CSTVCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'likes' | 'trending'>('trending');

  const { user } = useAuthContext();
  const router = useRouter();

  // Trending videos
  const {
    videos: trendingVideos,
    loading: trendingLoading,
    error: trendingError,
    refresh: refreshTrending,
  } = useTrendingVideos(20);

  // Recent videos
  const {
    videos: recentVideos,
    loading: recentLoading,
    error: recentError,
    pagination: recentPagination,
    loadMore,
    refresh: refreshRecent,
  } = useCSTVVideos({
    page: 1,
    limit: 20,
    sortBy,
    ...(selectedCategory !== 'all' && { category: selectedCategory as CSTVCategory }),
  });

  // Search videos
  const {
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    search,
    loadMore: loadMoreSearch,
    clearResults,
  } = useCSTVSearch(searchQuery, {
    page: 1,
    limit: 20,
  });

  const handleVideoPlay = (videoId: string) => {
    router.push(`/cstv/${videoId}`);
  };

  const handleVideoLike = async (videoId: string, isLiked: boolean) => {
    if (!user) {
      logger.warn('User not authenticated for video like');
      return;
    }
    try {
      const endpoint = isLiked ? `/cstv/${videoId}/unlike` : `/cstv/${videoId}/like`;
      await api.post(endpoint);
      logger.info('CSTV video like toggled:', { videoId, isLiked: !isLiked });
      // Refresh the current tab to show updated like status
      if (activeTab === 'trending') {
        refreshTrending();
      } else {
        refreshRecent();
      }
    } catch (likeVideoError) {
      logger.error('Error liking CSTV video:', {
        error: likeVideoError instanceof Error ? likeVideoError.message : 'Unknown error',
        videoId,
        isLiked
      });
    }
  };

  const handleVideoSave = async (videoId: string, isSaved: boolean) => {
    if (!user) {
      logger.warn('User not authenticated for video save');
      return;
    }
    try {
      const endpoint = isSaved ? `/cstv/${videoId}/unsave` : `/cstv/${videoId}/save`;
      await api.post(endpoint);
      logger.info('CSTV video save toggled:', { videoId, isSaved: !isSaved });
    } catch (saveVideoError) {
      logger.error('Error saving CSTV video:', {
        error: saveVideoError instanceof Error ? saveVideoError.message : 'Unknown error',
        videoId,
        isSaved
      });
    }
  };

  const handleVideoShare = (videoId: string) => {
    const shareUrl = `${window.location.origin}/cstv/${videoId}`;
    try {
      if (navigator.share) {
        navigator.share({
          title: 'Mira este video en CircleSfera CSTV',
          text: 'Echa un vistazo a este video',
          url: shareUrl,
        }).catch(shareError => {
          if (shareError instanceof Error && shareError.name !== 'AbortError') {
            logger.warn('Share dialog cancelled or failed:', { error: shareError.message, videoId });
          }
        });
      } else {
        navigator.clipboard.writeText(shareUrl);
        logger.info('CSTV video URL copied to clipboard:', { videoId });
        // Could show a toast notification here
      }
    } catch (shareVideoError) {
      logger.error('Error sharing CSTV video:', {
        error: shareVideoError instanceof Error ? shareVideoError.message : 'Unknown error',
        videoId
      });
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveTab('search');
      search();
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category as CSTVCategory | 'all');
    if (activeTab === 'recent') {
      refreshRecent();
    }
  };

  const getCurrentVideos = () => {
    switch (activeTab) {
      case 'trending':
        return trendingVideos;
      case 'recent':
        return recentVideos;
      case 'search':
        return searchResults;
      default:
        return [];
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'trending':
        return trendingLoading;
      case 'recent':
        return recentLoading;
      case 'search':
        return searchLoading;
      default:
        return false;
    }
  };

  const getCurrentError = () => {
    switch (activeTab) {
      case 'trending':
        return trendingError;
      case 'recent':
        return recentError;
      case 'search':
        return searchError;
      default:
        return null;
    }
  };

  const getCurrentLoadMore = () => {
    switch (activeTab) {
      case 'recent':
        return loadMore;
      case 'search':
        return loadMoreSearch;
      default:
        return undefined;
    }
  };

  const videos = getCurrentVideos();
  const loading = getCurrentLoading();
  const error = getCurrentError();
  const loadMoreFunc = getCurrentLoadMore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CSTV</h1>
              <p className="text-gray-600">Videos largos de CircleSfera</p>
            </div>

            {user && (
              <button
                onClick={() => router.push('/cstv/create')}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Subir Video</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar videos CSTV..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={handleSearch}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Buscar
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${activeTab === 'trending'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Trending</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('recent')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${activeTab === 'recent'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Recientes</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${activeTab === 'search'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Search className="w-4 h-4" />
                <span>Búsqueda</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {activeTab !== 'trending' && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white dark:bg-gray-900 text-gray-900"
              >
                <option value="all">Todas las categorías</option>
                {CSTV_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'views' | 'likes' | 'trending')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white dark:bg-gray-900 text-gray-900"
              >
                <option value="trending">Trending</option>
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="views">Más vistos</option>
                <option value="likes">Más populares</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && videos.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando videos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => {
                if (activeTab === 'trending') refreshTrending();
                else if (activeTab === 'recent') refreshRecent();
                else clearResults();
              }}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {activeTab === 'search' ? 'No se encontraron videos' :
                activeTab === 'trending' ? 'No hay videos trending' :
                  'No hay videos recientes'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {activeTab === 'search' ? 'Intenta con otros términos de búsqueda' :
                activeTab === 'trending' ? 'Los videos trending aparecerán aquí' :
                  'Los videos más recientes aparecerán aquí'}
            </p>
            {user && activeTab !== 'search' && (
              <button
                onClick={() => router.push('/cstv/create')}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Subir Video
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CSTVVideoCard
                    video={video}
                    onPlay={handleVideoPlay}
                    onLike={handleVideoLike}
                    onSave={handleVideoSave}
                    onShare={handleVideoShare}
                    currentUser={user ? { id: user._id, username: user.username } : undefined}
                    size="medium"
                  />
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            {loadMoreFunc && activeTab === 'recent' && recentPagination && recentPagination.page < recentPagination.pages && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMoreFunc}
                  disabled={loading}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Cargando...' : 'Cargar más'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
