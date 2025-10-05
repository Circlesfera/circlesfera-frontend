"use client";

import React, { useState, useEffect } from 'react';
import { Button, Avatar } from '@/design-system';
import { useAuth } from '@/features/auth/useAuth';
import { getReelsForFeed, Reel } from '@/services/reelService';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { Video, Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

export default function ReelsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLoadingMore] = useState(false);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [currentReel, setCurrentReel] = useState<Reel | null>(null);

  // Cargar reels iniciales
  useEffect(() => {
    const loadReels = async () => {
      if (authLoading || !user) return;
      
      try {
        setLoading(true);
        const response = await getReelsForFeed(1, 20);
        if (response.success) {
          setReels(response.reels || []);
          if (response.reels && response.reels.length > 0) {
            setCurrentReel(response.reels[0] || null);
          }
        }
      } catch (error) {
        console.error('Error cargando reels:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReels();
  }, [user, authLoading]);

  // Actualizar reel actual cuando cambia el índice
  useEffect(() => {
    if (reels.length > 0 && currentReelIndex < reels.length) {
      setCurrentReel(reels[currentReelIndex] || null);
    }
  }, [currentReelIndex, reels]);

  const handleLike = async (reelId: string) => {
    try {
      // Aquí implementarías la lógica de like
      console.log('Liking reel:', reelId);
      // TODO: Implementar likeReel service call
    } catch (error) {
      console.error('Error liking reel:', error);
    }
  };

  const handleComment = (reelId: string) => {
    // TODO: Abrir modal de comentarios
    console.log('Opening comments for reel:', reelId);
  };

  const handleShare = (reelId: string) => {
    // TODO: Implementar compartir
    console.log('Sharing reel:', reelId);
  };

  const handleUserClick = (userId: string) => {
    router.push(`/${userId}`);
  };

  const loadMoreReels = async () => {
    try {
      setLoadingMore(true);
      const response = await getReelsForFeed(Math.floor(reels.length / 20) + 1, 20);
      if (response.success && response.reels) {
        setReels(prev => [...prev, ...response.reels]);
      }
    } catch (error) {
      console.error('Error cargando más reels:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const nextReel = () => {
    if (currentReelIndex < reels.length - 1) {
      setCurrentReelIndex(prev => prev + 1);
    } else {
      // Cargar más reels si estamos al final
      loadMoreReels();
    }
  };

  const prevReel = () => {
    if (currentReelIndex > 0) {
      setCurrentReelIndex(prev => prev - 1);
    }
  };

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

  return (
    <ProtectedRoute>
      <div className="h-screen bg-black relative overflow-hidden">
        {/* Reel Video */}
        <div className="absolute inset-0 flex items-center justify-center">
          <video
            className="w-full h-full object-cover"
            src={currentReel.video.url}
            poster={currentReel.video.thumbnail}
            autoPlay
            loop
            muted
            playsInline
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
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
                className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white"
                onClick={() => handleLike(currentReel._id)}
              >
                <Heart className="w-6 h-6" fill="currentColor" />
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
            className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white"
            onClick={prevReel}
            disabled={currentReelIndex === 0}
          >
            ↑
          </Button>
        </div>

        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
          <Button
            variant="ghost"
            size="lg"
            className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white"
            onClick={nextReel}
          >
            ↓
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-1">
            {reels.slice(0, 10).map((_, index) => (
              <div
                key={index}
                className={`w-1 h-1 rounded-full ${
                  index === currentReelIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
