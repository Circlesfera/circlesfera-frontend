'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Heart, Bookmark, MoreVertical, Eye, Clock } from 'lucide-react';
import type { CSTVVideo } from '@/types/cstv';

interface CSTVVideoCardProps {
  video: CSTVVideo;
  onPlay?: (videoId: string) => void;
  onLike?: (videoId: string, isLiked: boolean) => void;
  onSave?: (videoId: string, isSaved: boolean) => void;
  onShare?: (videoId: string) => void;
  currentUser?: {
    id: string;
    username: string;
  } | undefined;
  showUserInfo?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function CSTVVideoCard({
  video,
  onPlay,
  onLike,
  onSave,
  onShare,
  currentUser,
  showUserInfo = true,
  size = 'medium',
}: CSTVVideoCardProps) {
  const [isLiked, setIsLiked] = useState(video.isLikedByUser);
  const [isSaved, setIsSaved] = useState(video.isSavedByUser);
  const [showMenu, setShowMenu] = useState(false);

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
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    if (diff < 7) return `${diff} días`;
    if (diff < 30) return `${Math.floor(diff / 7)} sem`;
    if (diff < 365) return `${Math.floor(diff / 30)} mes`;
    return `${Math.floor(diff / 365)} año`;
  };

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    onLike?.(video._id, newLikedState);
  };

  const handleSave = () => {
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    onSave?.(video._id, newSavedState);
  };

  const handleShare = () => {
    onShare?.(video._id);
  };

  const handlePlay = () => {
    onPlay?.(video._id);
  };

  const isOwner = currentUser?.id === video.user._id;

  const sizeClasses = {
    small: 'w-64',
    medium: 'w-80',
    large: 'w-96',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${sizeClasses[size]} bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200 group cursor-pointer" onClick={handlePlay}>
        <Image
          src={video.video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            className="bg-white dark:bg-gray-900 bg-opacity-90 rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="w-6 h-6 text-gray-900 dark:text-gray-100 ml-1" />
          </motion.div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {video.formattedDuration}
        </div>

        {/* Category Badge */}
        {video.category !== 'other' && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
            {video.category}
          </div>
        )}

        {/* Quality Badge */}
        <div className="absolute top-2 right-2 bg-gray-900 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {video.quality}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2 line-clamp-2 leading-tight">
          {video.title}
        </h3>

        {/* Description */}
        {video.description && (
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 line-clamp-2">
            {video.description}
          </p>
        )}

        {/* User Info */}
        {showUserInfo && (
          <div className="flex items-center space-x-2 mb-3">
            <Image
              src={video.user.avatar || '/default-avatar.png'}
              alt={`Avatar de ${video.user.username}`}
              width={24}
              height={24}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-gray-900">
              {video.user.username}
            </span>
            {video.user.isVerified && (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{formatViewCount(video.views.total)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3" />
              <span>{formatViewCount(video.likesCount)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(video.publishedAt)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              className={`p-2 rounded-full transition-colors ${isLiked
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleSave}
              className={`p-2 rounded-full transition-colors ${isSaved
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-green-100 hover:text-green-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>

          {/* Menu */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-10 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                  <button className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50">
                    Editar
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50">
                    Estadísticas
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
