"use client";

import React, { useCallback } from 'react';
import { Button, Avatar } from '@/design-system';
import { useAuth } from '@/features/auth/useAuth';
import { likeReel, unlikeReel } from '@/services/reelService';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { Video, Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { useReels } from '@/hooks/useReels';
import VideoPlayer from '@/components/VideoPlayer';
import logger from '@/utils/logger';
import { useToast } from '@/components/Toast';

export default function ReelsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const {
    currentReel,
    loading,
    goToNext,
    goToPrevious,
    currentIndex,
    reels,
    updateReel
  } = useReels();

  const handleLike = useCallback(async (reelId: string) => {
    if (!currentReel) return;

    try {
      const isLiked = currentReel.likes.some(like => like.user === user?._id);

      // Actualizar estado optimista
      const updatedLikes = isLiked
        ? currentReel.likes.filter(like => like.user !== user?._id)
        : [...currentReel.likes, { user: user?._id || '', createdAt: new Date().toISOString() }];

      updateReel(reelId, { likes: updatedLikes });

      // Llamar al servicio
      const response = isLiked ? await unlikeReel(reelId) : await likeReel(reelId);

      if (!response.success) {
        // Revertir si falla
        updateReel(reelId, { likes: currentReel.likes });
      }
    } catch (likeReelError) {
      logger.error('Error liking reel:', {
        error: likeReelError instanceof Error ? likeReelError.message : 'Unknown error',
        reelId
      });
      // Revertir en caso de error
      if (currentReel) {
        updateReel(reelId, { likes: currentReel.likes });
      }
    }
  }, [currentReel, user, updateReel]);

  const handleComment = useCallback((reelId: string) => {
    router.push(`/reels/${reelId}`);
  }, [router]);

  const handleShare = useCallback(async (reelId: string) => {
    try {
      const reelUrl = `${window.location.origin}/reels/${reelId}`;

      if (navigator.share) {
        await navigator.share({
          title: 'Mira este reel en CircleSfera',
          text: 'Echa un vistazo a este reel',
          url: reelUrl,
        });
      } else {
        await navigator.clipboard.writeText(reelUrl);
        toast.success('¡Enlace copiado al portapapeles!');
      }
    } catch (shareReelError) {
      logger.warn('Error sharing reel:', {
        error: shareReelError instanceof Error ? shareReelError.message : 'Unknown error',
        reelId
      });
    }
  }, [toast]);

  const handleUserClick = useCallback((userId: string) => {
    router.push(`/${userId}`);
  }, [router]);

  if (loading || authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reels...</p>
        </div>
      </div>
    );
  }

  if (!currentReel) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Video className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No hay reels disponibles
          </h2>
          <p className="text-gray-600 mb-8">
            Crea tu primer reel para comenzar a compartir videos cortos con la comunidad.
          </p>
          <Button
            variant="primary"
            gradient
            size="lg"
            onClick={() => router.push('/reels/create')}
            className="w-full"
          >
            Crear mi primer reel
          </Button>
        </div>
      </div>
    );
  }

  // Configurar props del video player
  const videoPlayerProps = {
    src: currentReel.video.url,
    autoPlay: true,
    loop: true,
    muted: true,
    isActive: true,
    className: "w-full h-full",
    ...(currentReel.video.thumbnail && { poster: currentReel.video.thumbnail })
  };

  return (
    <ProtectedRoute>
      <div className="h-screen bg-black relative overflow-hidden">
        {/* Reel Video con VideoPlayer optimizado */}
        <div className="absolute inset-0 flex items-center justify-center">
          <VideoPlayer {...videoPlayerProps} />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Reel Content */}
        <div className="relative z-10 h-full flex">
          {/* Left side - User info and caption */}
          <div className="flex-1 flex flex-col justify-end p-6">
            <div className="max-w-md">
              {/* User info */}
              <div className="flex items-center mb-4">
                <Avatar
                  src={currentReel.user.avatar}
                  alt={currentReel.user.username}
                  size="md"
                  fallback={currentReel.user.fullName || currentReel.user.username}
                  interactive
                  onClick={() => handleUserClick(currentReel.user._id)}
                />
                <div className="ml-3">
                  <p className="text-white font-semibold">
                    {currentReel.user.username}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {currentReel.user.fullName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-white hover:bg-white/10"
                >
                  Seguir
                </Button>
              </div>

              {/* Caption */}
              {currentReel.caption && (
                <p className="text-white mb-4 leading-relaxed">
                  {currentReel.caption}
                </p>
              )}

              {/* Hashtags */}
              {currentReel.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentReel.hashtags.map((hashtag, index) => (
                    <span
                      key={index}
                      className="text-blue-400 font-medium"
                      onClick={() => router.push(`/search?q=${hashtag}`)}
                    >
                      #{hashtag}
                    </span>
                  ))}
                </div>
              )}

              {/* Audio info */}
              {currentReel.audio && (
                <div className="flex items-center text-gray-300 mb-4">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-2" />
                  <span className="text-sm">
                    {currentReel.audio.title} - {currentReel.audio.artist}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex flex-col justify-end items-center p-6 space-y-6">
            {/* Like */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="lg"
                className={`w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white ${currentReel.likes.some(like => like.user === user?._id) ? 'text-red-500' : ''
                  }`}
                onClick={() => handleLike(currentReel._id)}
              >
                <Heart
                  className="w-6 h-6"
                  fill={currentReel.likes.some(like => like.user === user?._id) ? "currentColor" : "none"}
                />
              </Button>
              <span className="text-white text-sm mt-1">
                {currentReel.likes.length}
              </span>
            </div>

            {/* Comments */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="lg"
                className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white"
                onClick={() => handleComment(currentReel._id)}
              >
                <MessageCircle className="w-6 h-6" />
              </Button>
              <span className="text-white text-sm mt-1">
                {currentReel.comments.length}
              </span>
            </div>

            {/* Share */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="lg"
                className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white"
                onClick={() => handleShare(currentReel._id)}
              >
                <Share2 className="w-6 h-6" />
              </Button>
              <span className="text-white text-sm mt-1">
                {currentReel.shares.length}
              </span>
            </div>

            {/* More options */}
            <Button
              variant="ghost"
              size="lg"
              className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white"
            >
              <MoreHorizontal className="w-6 h-6" />
            </Button>

            {/* Create reel button */}
            <div className="mt-8">
              <Button
                variant="primary"
                gradient
                size="lg"
                onClick={() => router.push('/reels/create')}
                className="w-12 h-12 rounded-full"
              >
                <Video className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20">
          <Button
            variant="ghost"
            size="lg"
            className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white disabled:opacity-50"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
          >
            ↑
          </Button>
        </div>

        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
          <Button
            variant="ghost"
            size="lg"
            className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white"
            onClick={goToNext}
          >
            ↓
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-1">
            {reels.slice(0, Math.min(10, reels.length)).map((_, index) => (
              <div
                key={index}
                className={`w-1 h-1 rounded-full transition-colors ${index === currentIndex ? 'bg-white' : 'bg-white/30'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
