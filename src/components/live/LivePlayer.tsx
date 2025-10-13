'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Users, Heart, Share2, MoreVertical } from 'lucide-react';
import { LiveChat } from './LiveChat';
import { LiveCapture } from './LiveCapture';
import { useLiveStreamViewers } from '@/hooks/useLiveStream';
import type { LiveStream } from '@/types/live';
import logger from '@/utils/logger';

interface LivePlayerProps {
  stream: LiveStream;
  currentUser?: {
    id: string;
    username: string;
  } | undefined;
  isOwner?: boolean;
}

export function LivePlayer({ stream, currentUser, isOwner = false }: LivePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isStreaming, setIsStreaming] = useState(stream.status === 'live');

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { viewers, addViewer, removeViewer } = useLiveStreamViewers(stream._id);

  // Auto-hide controls
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // Handle mouse movement
  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle recording ready (para CSTV)
  const handleRecordingReady = async (blob: Blob) => {
    // Aquí podrías subir automáticamente el archivo para crear un CSTV
    logger.info('Recording ready for CSTV upload:', {
      size: blob.size,
      type: blob.type,
      streamId: stream._id
    });
    // TODO: Implementar subida automática a CSTV
    // const formData = new FormData();
    // formData.append('video', blob);
    // await uploadCSTVVideo(formData);
  };

  // Handle stream start
  const handleStreamStart = () => {
    setIsStreaming(true);

  };

  // Handle stream stop
  const handleStreamStop = () => {
    setIsStreaming(false);

  };

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle like
  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implement like functionality
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: stream.title,
        text: stream.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Format viewer count
  const formatViewerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Add/remove viewer when component mounts/unmounts
  useEffect(() => {
    if (stream.status === 'live') {
      addViewer();
    }

    return () => {
      if (stream.status === 'live') {
        removeViewer();
      }
    };
  }, [stream.status, addViewer, removeViewer]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-black">
      {/* Video Player */}
      <div
        ref={playerRef}
        className="relative w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Video Element - LiveCapture para streamers, video normal para viewers */}
        {isOwner && stream.status === 'live' ? (
          <LiveCapture
            streamId={stream._id}
            isStreaming={isStreaming}
            onStreamStart={handleStreamStart}
            onStreamStop={handleStreamStop}
            onRecordingReady={handleRecordingReady}
            className="w-full h-full"
          />
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={stream.playbackUrl}
            poster={stream.thumbnailUrl}
            autoPlay
            muted={isMuted}
            loop={false}
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadedData={() => setIsPlaying(true)}
          />
        )}

        {/* Live Badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-red-600 text-white px-3 py-1 rounded-full flex items-center space-x-2">
            <div className="w-2 h-2 bg-white dark:bg-gray-900 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">EN VIVO</span>
          </div>
        </div>

        {/* Viewer Count */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">{formatViewerCount(viewers.current)}</span>
          </div>
        </div>

        {/* Stream Info */}
        <div className="absolute bottom-20 left-4 right-4 z-10">
          <div className="text-white">
            <h1 className="text-xl font-bold mb-1">{stream.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-300">
              <span>@{stream.user.username}</span>
              {stream.user.isVerified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              <span>{formatDuration(stream.duration)}</span>
            </div>
          </div>
        </div>

        {/* Controls Overlay */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
            >
              {/* Center Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="bg-white dark:bg-gray-900 bg-opacity-20 backdrop-blur-sm rounded-full p-4 hover:bg-opacity-30 transition-all"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                {/* Left Controls */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-6 h-6" />
                    ) : (
                      <Volume2 className="w-6 h-6" />
                    )}
                  </button>

                  <div className="text-white text-sm">
                    {formatDuration(stream.duration)}
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-1 transition-colors ${
                      isLiked ? 'text-red-500' : 'text-white hover:text-gray-300'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{viewers.total}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    <Maximize className="w-6 h-6" />
                  </button>

                  {isOwner && (
                    <button className="text-white hover:text-gray-300 transition-colors">
                      <MoreVertical className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Toggle */}
        <div className="absolute bottom-4 right-4 z-10">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-3 rounded-full transition-all ${
              showChat
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-gray-900 dark:bg-gray-900 bg-opacity-20 backdrop-blur-sm text-white hover:bg-opacity-30'
            }`}
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Live Chat */}
      <AnimatePresence>
        {showChat && stream.allowComments && (
          <LiveChat
            streamId={stream._id}
            allowComments={stream.allowComments}
            currentUser={currentUser}
            canModerate={isOwner}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
