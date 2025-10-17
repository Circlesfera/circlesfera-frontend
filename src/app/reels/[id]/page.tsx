"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Avatar } from '@/design-system';
import { useAuth } from '@/features/auth/useAuth';
import { getReel, Reel } from '@/services/reelService';
import ProtectedRoute from '@/components/ProtectedRoute';
import CommentsModal from '@/components/CommentsModal';
import { CreateDuetForm, CreateStitchForm } from '@/features/posts/components';
import { Video, Heart, MessageCircle, Share2, MoreHorizontal, ArrowLeft, Copy, Scissors } from 'lucide-react';
import logger from '@/utils/logger';

export default function ReelPage() {
  const { id } = useParams();
  const router = useRouter();
  const { loading: authLoading, user } = useAuth();
  const [reel, setReel] = useState<Reel | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentsModal, setCommentsModal] = useState<{ isOpen: boolean; reelId: string }>({
    isOpen: false,
    reelId: ''
  });
  const [showDuetForm, setShowDuetForm] = useState(false);
  const [showStitchForm, setShowStitchForm] = useState(false);

  // Cargar reel específico
  useEffect(() => {
    const loadReel = async () => {
      if (!id || authLoading) return;

      try {
        setLoading(true);
        const response = await getReel(id as string);
        if (response.success) {
          setReel(response.reel);
        }
      } catch (loadReelError) {
        logger.error('Error loading reel in reels/[id]/page:', {
          error: loadReelError instanceof Error ? loadReelError.message : 'Unknown error',
          reelId: id
        });
        router.push('/reels');
      } finally {
        setLoading(false);
      }
    };

    loadReel();
  }, [id, authLoading, router]);

  const handleLike = async (reelId: string) => {
    if (!reel) return;
    try {
      const { likeReel, unlikeReel } = await import('@/services/reelService');
      const isCurrentlyLiked = reel.likes.some(like => like.user === user?.id);

      if (isCurrentlyLiked) {
        await unlikeReel(reelId);
      } else {
        await likeReel(reelId);
      }

      // Update local state optimistically
      setReel(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          likes: isCurrentlyLiked
            ? prev.likes.filter(like => like.user !== user?.id)
            : [...prev.likes, { user: user?.id || '', createdAt: new Date().toISOString() }]
        };
      });

      logger.info('Reel like toggled:', { reelId, isLiked: !isCurrentlyLiked });
    } catch (likeReelError) {
      logger.error('Error toggling reel like:', {
        error: likeReelError instanceof Error ? likeReelError.message : 'Unknown error',
        reelId
      });
    }
  };

  const handleComment = (reelId: string) => {
    setCommentsModal({
      isOpen: true,
      reelId
    });
  };

  const handleShare = (reelId: string) => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        const shareData: ShareData = {
          title: `Reel de ${reel?.user.username}`,
          url: shareUrl
        };
        if (reel?.caption) {
          shareData.text = reel.caption;
        }
        navigator.share(shareData).catch(shareError => {
          if (shareError instanceof Error && shareError.name !== 'AbortError') {
            logger.warn('Share dialog cancelled or failed:', { error: shareError.message, reelId });
          }
        });
      } else {
        navigator.clipboard.writeText(shareUrl);
        logger.info('Reel URL copied to clipboard:', { reelId });
        // Could show a toast notification using a notification hook
      }
    } catch (shareReelError) {
      logger.error('Error sharing reel:', {
        error: shareReelError instanceof Error ? shareReelError.message : 'Unknown error',
        reelId
      });
    }
  };

  const handleUserClick = (userId: string) => {
    router.push(`/${userId}`);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando reel...</p>
        </div>
      </div>
    );
  }

  if (!reel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Video className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Reel no encontrado
          </h2>
          <p className="text-gray-300 mb-8">
            El reel que buscas no existe o ha sido eliminado.
          </p>
          <Button
            variant="gradient"
            size="lg"
            onClick={() => router.push('/reels')}
            className="w-full"
          >
            Ver otros reels
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm border-b border-gray-800">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white dark:bg-gray-900 dark:bg-gray-900/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver
            </Button>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare(reel.id)}
                className="text-white hover:bg-white dark:bg-gray-900 dark:bg-gray-900/10"
              >
                Compartir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white dark:bg-gray-900 dark:bg-gray-900/10"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pt-16 pb-20">
          {/* Video Section */}
          <div className="relative h-[70vh] bg-black">
            <video
              className="w-full h-full object-cover"
              src={reel.video.url}
              poster={reel.video.thumbnail}
              controls
              playsInline
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Content Section */}
          <div className="px-4 py-6 space-y-6">
            {/* User info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar
                  src={reel.user.avatar}
                  alt={reel.user.username}
                  size="lg"
                  fallback={reel.user.fullName || reel.user.username}
                  interactive
                  onClick={() => handleUserClick(reel.user.id)}
                />
                <div className="ml-4">
                  <p className="text-white font-semibold text-lg">
                    {reel.user.username}
                  </p>
                  <p className="text-gray-300">
                    {reel.user.fullName}
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="bg-white dark:bg-gray-900 text-black hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600 dark:bg-gray-700"
              >
                Seguir
              </Button>
            </div>

            {/* Caption */}
            {reel.caption && (
              <div>
                <p className="text-white text-lg leading-relaxed">
                  {reel.caption}
                </p>
              </div>
            )}

            {/* Hashtags */}
            {reel.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {reel.hashtags.map((hashtag, index) => (
                  <span
                    key={index}
                    className="text-blue-400 font-medium cursor-pointer hover:text-blue-300"
                    onClick={() => router.push(`/search?q=${hashtag}`)}
                  >
                    #{hashtag}
                  </span>
                ))}
              </div>
            )}

            {/* Audio info */}
            {reel.audio && (
              <div className="flex items-center p-4 bg-gray-900/50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-3" />
                <div>
                  <p className="text-white font-medium">
                    {reel.audio.title}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {reel.audio.artist}
                  </p>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-white font-bold text-xl">{reel.views.length}</p>
                <p className="text-gray-400 dark:text-gray-500 dark:text-gray-400 text-sm">Visualizaciones</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-xl">{reel.likes.length}</p>
                <p className="text-gray-400 dark:text-gray-500 dark:text-gray-400 text-sm">Likes</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-xl">{reel.comments.length}</p>
                <p className="text-gray-400 dark:text-gray-500 dark:text-gray-400 text-sm">Comentarios</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-xl">{reel.shares.length}</p>
                <p className="text-gray-400 dark:text-gray-500 dark:text-gray-400 text-sm">Compartidos</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4 md:space-x-8">
              <Button
                variant="ghost"
                size="lg"
                className="flex flex-col items-center text-white hover:bg-white dark:bg-gray-900 dark:bg-gray-900/10"
                onClick={() => handleLike(reel.id)}
              >
                <Heart className="w-8 h-8 mb-2" fill="currentColor" />
                <span className="text-sm">Me gusta</span>
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className="flex flex-col items-center text-white hover:bg-white dark:bg-gray-900 dark:bg-gray-900/10"
                onClick={() => handleComment(reel.id)}
              >
                <MessageCircle className="w-8 h-8 mb-2" />
                <span className="text-sm">Comentar</span>
              </Button>

              {/* Duet Button */}
              {reel.allowDuets && (
                <Button
                  variant="ghost"
                  size="lg"
                  className="flex flex-col items-center text-white hover:bg-white dark:bg-gray-900 dark:bg-gray-900/10"
                  onClick={() => setShowDuetForm(true)}
                  title="Crear duet con este reel"
                >
                  <Copy className="w-8 h-8 mb-2" />
                  <span className="text-sm">Duet</span>
                </Button>
              )}

              {/* Stitch Button */}
              {reel.allowStitches && (
                <Button
                  variant="ghost"
                  size="lg"
                  className="flex flex-col items-center text-white hover:bg-white dark:bg-gray-900 dark:bg-gray-900/10"
                  onClick={() => setShowStitchForm(true)}
                  title="Crear stitch con este reel"
                >
                  <Scissors className="w-8 h-8 mb-2" />
                  <span className="text-sm">Stitch</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="lg"
                className="flex flex-col items-center text-white hover:bg-white dark:bg-gray-900 dark:bg-gray-900/10"
                onClick={() => handleShare(reel.id)}
              >
                <Share2 className="w-8 h-8 mb-2" />
                <span className="text-sm">Compartir</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Comments Modal */}
        <CommentsModal
          isOpen={commentsModal.isOpen}
          onClose={() => setCommentsModal({ isOpen: false, reelId: '' })}
          postId={commentsModal.reelId}
          postAuthor={reel.user.username}
          postImage={reel.video.thumbnail}
        />

        {/* Duet Form Modal */}
        {showDuetForm && (
          <CreateDuetForm
            originalReel={reel}
            onClose={() => setShowDuetForm(false)}
            onSuccess={() => {
              setShowDuetForm(false);
              router.push('/reels');
            }}
          />
        )}

        {/* Stitch Form Modal */}
        {showStitchForm && (
          <CreateStitchForm
            originalReel={reel}
            onClose={() => setShowStitchForm(false)}
            onSuccess={() => {
              setShowStitchForm(false);
              router.push('/reels');
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
