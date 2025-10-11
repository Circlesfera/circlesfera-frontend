'use client';

import { useState, use } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Heart, Share2, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLiveStream, useStartLiveStream, useEndLiveStream } from '@/hooks/useLiveStream';
import { LivePlayer } from '@/components/live/LivePlayer';
import { useAuthContext } from '@/features/auth/AuthContext';
import { useToast } from '@/components/Toast';

interface LiveStreamPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function LiveStreamPage({ params }: LiveStreamPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthContext();
  const toast = useToast();

  const [isLiked, setIsLiked] = useState(false);

  const {
    stream,
    loading,
    error,
    refresh,
  } = useLiveStream(id);

  const { startStream, loading: starting } = useStartLiveStream();
  const { endStream, loading: ending } = useEndLiveStream();

  const isOwner = user?._id === stream?.user._id;
  const isLive = stream?.status === 'live';
  const isScheduled = stream?.status === 'scheduled';

  const handleStartStream = async () => {
    if (!stream || !user) return;

    // En un entorno real, aquí obtendrías las credenciales del streaming service
    const streamData = {
      streamKey: `stream_${stream._id}_${Date.now()}`,
      rtmpUrl: `rtmp://your-streaming-server/live/${stream._id}`,
      playbackUrl: `https://your-cdn.com/live/${stream._id}/index.m3u8`,
      ...(stream.thumbnailUrl && { thumbnailUrl: stream.thumbnailUrl }),
    };

    const result = await startStream(id, streamData);
    if (result) {
      refresh();
    }
  };

  const handleEndStream = async () => {
    if (!stream || !isOwner) return;

    const result = await endStream(id, {
      saveToCSTV: stream.saveToCSTV,
    });

    if (result) {
      router.push(`/live`);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implement like functionality
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: stream?.title || 'Transmisión en vivo',
        text: stream?.description || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado al portapapeles');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Cargando transmisión...</p>
        </div>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Transmisión no encontrada</h1>
          <p className="text-gray-400 mb-6">{error || 'La transmisión que buscas no existe'}</p>
          <button
            onClick={() => router.push('/live')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Volver a Live
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
            {isLive && (
              <div className="flex items-center space-x-2 text-white">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">EN VIVO</span>
              </div>
            )}

            {isScheduled && (
              <div className="text-white text-sm">
                <span>Programado para {formatDate(stream.scheduledAt!)}</span>
              </div>
            )}

            <button
              onClick={handleLike}
              className={`p-2 rounded-full transition-colors ${isLiked
                ? 'bg-red-600 text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
                }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stream Content */}
      <div className="h-screen">
        {isLive ? (
          <LivePlayer
            stream={stream}
            currentUser={user ? { id: user._id, username: user.username } : undefined}
            isOwner={isOwner}
          />
        ) : isScheduled ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-white max-w-md">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-white" />
              </div>

              <h1 className="text-3xl font-bold mb-4">{stream.title}</h1>

              {stream.description && (
                <p className="text-gray-300 mb-6">{stream.description}</p>
              )}

              <div className="bg-white/10 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Image
                    src={stream.user.avatar || '/default-avatar.png'}
                    alt={`Avatar de ${stream.user.username}`}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{stream.user.username}</h3>
                    <p className="text-sm text-gray-300">Transmisión programada</p>
                  </div>
                </div>

                <div className="text-sm text-gray-300 space-y-2">
                  <p><strong>Fecha:</strong> {formatDate(stream.scheduledAt!)}</p>
                  <p><strong>Notificaciones:</strong> {stream.notifyFollowers ? 'Activadas' : 'Desactivadas'}</p>
                  <p><strong>Comentarios:</strong> {stream.allowComments ? 'Permitidos' : 'Deshabilitados'}</p>
                </div>
              </div>

              {isOwner && (
                <button
                  onClick={handleStartStream}
                  disabled={starting}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2 mx-auto"
                >
                  {starting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Iniciando...</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5" />
                      <span>Iniciar Transmisión</span>
                    </>
                  )}
                </button>
              )}

              {!isOwner && (
                <div className="text-gray-400">
                  <p>La transmisión comenzará pronto</p>
                  <p className="text-sm mt-2">Te notificaremos cuando esté en vivo</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-white max-w-md">
              <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-white" />
              </div>

              <h1 className="text-3xl font-bold mb-4">{stream.title}</h1>
              <p className="text-gray-300 mb-6">Esta transmisión ha finalizado</p>

              <div className="bg-white/10 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Image
                    src={stream.user.avatar || '/default-avatar.png'}
                    alt={`Avatar de ${stream.user.username}`}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{stream.user.username}</h3>
                    <p className="text-sm text-gray-300">Transmisión finalizada</p>
                  </div>
                </div>

                <div className="text-sm text-gray-300 space-y-2">
                  <p><strong>Duración:</strong> {Math.floor(stream.duration / 60)} minutos</p>
                  <p><strong>Espectadores:</strong> {stream.viewers.total.toLocaleString()}</p>
                  <p><strong>Finalizada:</strong> {stream.endTime ? formatDate(stream.endTime) : 'Fecha no disponible'}</p>
                </div>
              </div>

              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => router.push(`/${stream.user.username}`)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ver Perfil
                </button>

                {stream.cstvVideo && (
                  <button
                    onClick={() => router.push(`/cstv/${stream.cstvVideo!._id}`)}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Ver en CSTV
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stream Info Overlay (for live streams) */}
      {isLive && (
        <div className="absolute bottom-20 left-4 right-4 z-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/50 backdrop-blur-sm rounded-lg p-4"
          >
            <h1 className="text-xl font-bold mb-2">{stream.title}</h1>

            <div className="flex items-center space-x-4 text-sm text-gray-300">
              <span>@{stream.user.username}</span>
              {stream.user.isVerified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              <span>{Math.floor(stream.duration / 60)} min</span>
            </div>

            {stream.description && (
              <p className="text-sm text-gray-300 mt-2">{stream.description}</p>
            )}
          </motion.div>
        </div>
      )}

      {/* Owner Controls (for live streams) */}
      {isLive && isOwner && (
        <div className="absolute bottom-4 left-4 z-10">
          <button
            onClick={handleEndStream}
            disabled={ending}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            {ending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Finalizando...</span>
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                <span>Finalizar Transmisión</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
