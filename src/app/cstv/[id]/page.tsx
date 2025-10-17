'use client';

import { useState, use } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Bookmark, Share2, Eye, Clock, User, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCSTVVideo, useCSTVLikes, useCSTVSaves } from '@/hooks/useCSTV';
import { useAuthContext } from '@/features/auth/AuthContext';
import { useToast } from '@/components/Toast';

interface CSTVVideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CSTVVideoPage({ params }: CSTVVideoPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthContext();
  const isAuthenticated = !!user;
  const toast = useToast();

  const [showShareModal, setShowShareModal] = useState(false);

  const {
    video,
    loading,
    error,
    refresh,
  } = useCSTVVideo(id);

  const { toggleLike, loading: likeLoading } = useCSTVLikes();
  const { toggleSave, loading: saveLoading } = useCSTVSaves();

  const isOwner = user?.id === video?.user.id;

  const handleLike = async () => {
    if (!video || !user) return;
    await toggleLike(video.id, video.isLikedByUser);
    refresh();
  };

  const handleSave = async () => {
    if (!video || !user) return;
    await toggleSave(video.id, video.isSavedByUser);
    refresh();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title || 'Video CSTV',
        text: video?.description || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado al portapapeles');
      setShowShareModal(true);
      setTimeout(() => setShowShareModal(false), 2000);
    }
  };

  const formatViewCount = (count: number) => {
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
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Cargando video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Video no encontrado</h1>
          <p className="text-gray-400 dark:text-gray-500 dark:text-gray-400 mb-6">{error || 'El video que buscas no existe'}</p>
          <button
            onClick={() => router.push('/cstv')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Volver a CSTV
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={likeLoading || !isAuthenticated}
              className={`p-2 rounded-full transition-colors ${video.isLikedByUser
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-gray-900 dark:bg-gray-900/20 text-white hover:bg-white dark:bg-gray-900/30'
                } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className={`w-5 h-5 ${video.isLikedByUser ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleSave}
              disabled={saveLoading || !isAuthenticated}
              className={`p-2 rounded-full transition-colors ${video.isSavedByUser
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-900 dark:bg-gray-900/20 text-white hover:bg-white dark:bg-gray-900/30'
                } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Bookmark className={`w-5 h-5 ${video.isSavedByUser ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white dark:bg-gray-900 dark:bg-gray-900/20 text-white hover:bg-white dark:bg-gray-900/30 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button className="p-2 rounded-full bg-white dark:bg-gray-900 dark:bg-gray-900/20 text-white hover:bg-white dark:bg-gray-900/30 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative w-full h-screen">
        <video
          className="w-full h-full object-contain bg-black"
          src={video.video.url}
          poster={video.video.thumbnail}
          controls
          autoPlay={false}
          preload="metadata"
        />

        {/* Video Info Overlay */}
        <div className="absolute bottom-20 left-4 right-4 z-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/50 backdrop-blur-sm rounded-lg p-4"
          >
            <h1 className="text-2xl font-bold mb-2">{video.title}</h1>

            <div className="flex items-center space-x-4 text-sm text-gray-300 mb-3">
              <span>@{video.user.username}</span>
              {video.user.isVerified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              <span>{video.formattedDuration}</span>
              <span>{video.quality}</span>
            </div>

            {video.description && (
              <p className="text-sm text-gray-300 mb-3">{video.description}</p>
            )}

            {/* Tags */}
            {video.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {video.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-white dark:bg-gray-900 dark:bg-gray-900/20 text-white text-xs px-2 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-300">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{formatViewCount(video.views.total)} vistas</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{formatViewCount(video.likesCount)} likes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bookmark className="w-4 h-4" />
                <span>{formatViewCount(video.savesCount)} guardados</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDate(video.publishedAt)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="absolute top-0 right-0 bottom-0 w-80 bg-white dark:bg-gray-900 transform translate-x-full transition-transform duration-300">
        {/* User Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Image
              src={video.user.avatar || '/default-avatar.png'}
              alt={`Avatar de ${video.user.username}`}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{video.user.username}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">{video.user.fullName}</p>
              {video.user.followers && (
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{formatViewCount(video.user.followers)} seguidores</p>
              )}
            </div>
            {video.user.isVerified && (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
            )}
          </div>

          {isAuthenticated && !isOwner && (
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Seguir
            </button>
          )}
        </div>

        {/* Video Details */}
        <div className="p-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Detalles del video</h4>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Categoría:</span>
              <span className="text-gray-900 dark:text-gray-100 capitalize">{video.category}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Duración:</span>
              <span className="text-gray-900 dark:text-gray-100">{video.formattedDuration}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Calidad:</span>
              <span className="text-gray-900 dark:text-gray-100">{video.quality}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Visibilidad:</span>
              <span className="text-gray-900 dark:text-gray-100 capitalize">{video.visibility.replace('_', ' ')}</span>
            </div>

            {video.isFromLiveStream && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Origen:</span>
                <span className="text-gray-900 dark:text-gray-100">Live Stream</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Acciones</h4>

          <div className="space-y-2">
            <button
              onClick={handleLike}
              disabled={likeLoading || !isAuthenticated}
              className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${video.isLikedByUser
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600'
                } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className={`w-4 h-4 ${video.isLikedByUser ? 'fill-current' : ''}`} />
              <span>{video.isLikedByUser ? 'Quitar Like' : 'Dar Like'}</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saveLoading || !isAuthenticated}
              className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${video.isSavedByUser
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600'
                } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Bookmark className={`w-4 h-4 ${video.isSavedByUser ? 'fill-current' : ''}`} />
              <span>{video.isSavedByUser ? 'Quitar de Guardados' : 'Guardar'}</span>
            </button>

            <button
              onClick={handleShare}
              className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartir</span>
            </button>

            {isOwner && (
              <button
                onClick={() => router.push(`/cstv/${video.id}/edit`)}
                className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Editar Video</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">¡Enlace copiado!</h3>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">El enlace del video se ha copiado al portapapeles.</p>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
