'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Users, TrendingUp, Clock, Play } from 'lucide-react';
import { useLiveStreams } from '@/hooks/useLiveStream';
import { CreateLiveStreamForm } from '@/features/live/components';
// import { useAuth } from '@/features/auth/AuthContext'; // TODO: Implementar autenticación
import { useRouter } from 'next/navigation';

export default function LivePage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<'live' | 'scheduled' | 'all'>('live');

  // const { token } = useAuthContext(); // TODO: Implementar autenticación
  const isAuthenticated = false; // TODO: Implementar autenticación
  const router = useRouter();

  const {
    streams,
    loading,
    error,
    pagination,
    loadMore,
    refresh,
  } = useLiveStreams({
    ...(filter !== 'all' && { status: filter as 'live' | 'scheduled' }),
    limit: 20,
  });

  const handleCreateStream = (streamId: string) => {
    setShowCreateForm(false);
    // Redirigir a la transmisión creada
    router.push(`/live/${streamId}`);
  };

  const formatViewerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    if (diff < 7) return `${diff} días`;
    return date.toLocaleDateString('es-ES');
  };

  const getStreamStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-600';
      case 'scheduled':
        return 'bg-blue-600';
      case 'ended':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStreamStatusText = (status: string) => {
    switch (status) {
      case 'live':
        return 'EN VIVO';
      case 'scheduled':
        return 'PROGRAMADO';
      case 'ended':
        return 'FINALIZADO';
      default:
        return status.toUpperCase();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Live Streaming</h1>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Transmisiones en vivo de CircleSfera</p>
            </div>

            {isAuthenticated && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Camera className="w-5 h-5" />
                <span>Crear Transmisión</span>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 mt-4">
            <button
              onClick={() => setFilter('live')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'live'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600'
                }`}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                <span>En Vivo</span>
              </div>
            </button>

            <button
              onClick={() => setFilter('scheduled')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'scheduled'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600'
                }`}
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Programados</span>
              </div>
            </button>

            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Todos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading && streams.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Cargando transmisiones...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={refresh}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : streams.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-12 h-12 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {filter === 'live' ? 'No hay transmisiones en vivo' :
                filter === 'scheduled' ? 'No hay transmisiones programadas' :
                  'No hay transmisiones disponibles'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-6">
              {filter === 'live' ? 'Sé el primero en transmitir en vivo' :
                filter === 'scheduled' ? 'Programa tu próxima transmisión' :
                  'Explora las transmisiones disponibles'}
            </p>
            {isAuthenticated && filter === 'live' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Crear Transmisión
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streams.map((stream) => (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
                onClick={() => router.push(`/live/${stream.id}`)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-200 dark:bg-gray-600 dark:bg-gray-700">
                  {stream.thumbnailUrl ? (
                    <Image
                      src={stream.thumbnailUrl}
                      alt={stream.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600">
                      <Camera className="w-12 h-12 text-white" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className={`absolute top-3 left-3 ${getStreamStatusColor(stream.status)} text-white text-xs px-2 py-1 rounded-full font-medium`}>
                    {getStreamStatusText(stream.status)}
                  </div>

                  {/* Viewer Count */}
                  {stream.status === 'live' && (
                    <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{formatViewerCount(stream.viewers.current)}</span>
                    </div>
                  )}

                  {/* Play Button */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-900 bg-opacity-90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-gray-900 dark:text-gray-100 ml-1" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2 line-clamp-2">
                    {stream.title}
                  </h3>

                  <div className="flex items-center space-x-2 mb-3">
                    <Image
                      src={stream.user.avatar || '/default-avatar.png'}
                      alt={`Avatar de ${stream.user.username}`}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {stream.user.username}
                    </span>
                    {stream.user.isVerified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    <span>
                      {stream.status === 'live' ? 'En vivo' :
                        stream.status === 'scheduled' ? `Programado para ${formatDate(stream.scheduledAt || stream.startTime)}` :
                          `Finalizado ${formatDate(stream.endTime || stream.startTime)}`}
                    </span>
                    {stream.status === 'live' && (
                      <span className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{formatViewerCount(stream.viewers.total)} viewers</span>
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More */}
        {pagination && pagination.page < pagination.pages && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Cargando...' : 'Cargar más'}
            </button>
          </div>
        )}
      </div>

      {/* Create Stream Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCreateForm(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <CreateLiveStreamForm
                onSuccess={handleCreateStream}
                onCancel={() => setShowCreateForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
