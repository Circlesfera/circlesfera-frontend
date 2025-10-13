"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import logger from '@/utils/logger';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  onEnded?: () => void;
  isActive?: boolean;
}

/**
 * Componente de reproductor de video optimizado
 * con controles personalizados y lazy loading
 */
export default function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  muted = true,
  loop = true,
  className = '',
  onEnded,
  isActive = true
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);

  // Reproducir/pausar automáticamente según isActive
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && autoPlay) {
      video.play().catch(playError => {
        logger.warn('Video autoplay failed (expected behavior):', {
          error: playError instanceof Error ? playError.message : 'Unknown error'
        });
      });
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive, autoPlay]);

  // Actualizar progreso
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress || 0);
    };

    video.addEventListener('timeupdate', updateProgress);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(playError => {
        logger.error('Video play failed:', {
          error: playError instanceof Error ? playError.message : 'Unknown error'
        });
      });
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVideoClick = useCallback(() => {
    togglePlay();
    setShowControls(true);
    setTimeout(() => setShowControls(false), 2000);
  }, [togglePlay]);

  const handleVideoEnd = useCallback(() => {
    setIsPlaying(false);
    if (onEnded) {
      onEnded();
    }
  }, [onEnded]);

  return (
    <div
      className={`relative w-full h-full ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop={loop}
        muted={isMuted}
        playsInline
        preload="metadata"
        className="w-full h-full object-cover cursor-pointer"
        onClick={handleVideoClick}
        onEnded={handleVideoEnd}
      />

      {/* Controles superpuestos */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Botón Play/Pause central */}
        <button
          onClick={handleVideoClick}
          className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8" fill="white" />
          ) : (
            <Play className="w-8 h-8 ml-1" fill="white" />
          )}
        </button>
      </div>

      {/* Botón de sonido */}
      <button
        onClick={toggleMute}
        className={`absolute bottom-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>

      {/* Barra de progreso */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gray-600/50 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="h-full bg-white dark:bg-gray-900 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

