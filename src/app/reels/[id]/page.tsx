"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Avatar } from '@/design-system';
import { useAuth } from '@/features/auth/useAuth';
import { getReel, Reel } from '@/services/reelService';
import ProtectedRoute from '@/components/ProtectedRoute';
import CommentsModal from '@/components/CommentsModal';
import { Video, Heart, MessageCircle, Share2, MoreHorizontal, ArrowLeft } from 'lucide-react';

export default function ReelPage() {
  const { id } = useParams();
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [reel, setReel] = useState<Reel | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentsModal, setCommentsModal] = useState<{ isOpen: boolean; reelId: string }>({ 
    isOpen: false, 
    reelId: '' 
  });

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
      } catch (error) {

        router.push('/reels');
      } finally {
        setLoading(false);
      }
    };

    loadReel();
  }, [id, authLoading, router]);

  const handleLike = async (reelId: string) => {
    try {
      // TODO: Implementar likeReel service call

    } catch (error) {

    }
  };

  const handleComment = (reelId: string) => {
    setCommentsModal({
      isOpen: true,
      reelId
    });
  };

  const handleShare = (reelId: string) => {
    // TODO: Implementar compartir

    // Compartir URL
    if (navigator.share) {
      const shareData: ShareData = {
        title: `Reel de ${reel?.user.username}`,
        url: window.location.href
      };
      if (reel?.caption) {
        shareData.text = reel.caption;
      }
      navigator.share(shareData);
    } else {
      // Fallback: copiar al clipboard
      navigator.clipboard.writeText(window.location.href);
      // TODO: Mostrar toast de confirmación
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
            variant="primary"
            gradient
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
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver
            </Button>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare(reel._id)}
                className="text-white hover:bg-white/10"
              >
                Compartir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
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
                  onClick={() => handleUserClick(reel.user._id)}
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
                className="bg-white text-black hover:bg-gray-200"
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
                <p className="text-gray-400 text-sm">Visualizaciones</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-xl">{reel.likes.length}</p>
                <p className="text-gray-400 text-sm">Likes</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-xl">{reel.comments.length}</p>
                <p className="text-gray-400 text-sm">Comentarios</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-xl">{reel.shares.length}</p>
                <p className="text-gray-400 text-sm">Compartidos</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-8">
              <Button
                variant="ghost"
                size="lg"
                className="flex flex-col items-center text-white hover:bg-white/10"
                onClick={() => handleLike(reel._id)}
              >
                <Heart className="w-8 h-8 mb-2" fill="currentColor" />
                <span className="text-sm">Me gusta</span>
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className="flex flex-col items-center text-white hover:bg-white/10"
                onClick={() => handleComment(reel._id)}
              >
                <MessageCircle className="w-8 h-8 mb-2" />
                <span className="text-sm">Comentar</span>
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className="flex flex-col items-center text-white hover:bg-white/10"
                onClick={() => handleShare(reel._id)}
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
      </div>
    </ProtectedRoute>
  );
}
