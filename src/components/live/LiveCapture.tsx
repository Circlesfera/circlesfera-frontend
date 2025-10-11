'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Camera, CameraOff, Mic, MicOff, Monitor, Phone, PhoneOff } from 'lucide-react';
import logger from '@/utils/logger';

interface LiveCaptureProps {
  streamId: string;
  isStreaming: boolean;
  onStreamStart?: () => void;
  onStreamStop?: () => void;
  onRecordingReady?: (blob: Blob) => void;
  className?: string;
}

export function LiveCapture({
  streamId,
  isStreaming,
  onStreamStart,
  onStreamStop,
  onRecordingReady,
  className = '',
}: LiveCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    localStream,
    isCapturing,
    isStreaming: webrtcStreaming,
    isRecording,
    error,
    stats,
    startCapture,
    stopCapture,
    startStreaming,
    stopStreaming,
    clearError,
  } = useWebRTC({
    streamId,
    isStreamer: true,
    autoStart: false,
  });

  // Mostrar stream local en el video
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;

      // Actualizar estado de cámara y micrófono
      const videoTrack = localStream.getVideoTracks()[0];
      const audioTrack = localStream.getAudioTracks()[0];

      if (videoTrack) {
        setIsCameraEnabled(videoTrack.enabled);
      }
      if (audioTrack) {
        setIsMicrophoneEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Definir handlers ANTES de los useEffect que los usan
  const handleStartStream = useCallback(async () => {
    try {
      clearError();

      // Iniciar captura si no está activa
      if (!isCapturing) {
        await startCapture({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      }

      // Iniciar transmisión
      await startStreaming();
      onStreamStart?.();
      logger.info('Live stream started successfully');
    } catch (startError) {
      logger.error('Error starting live stream:', {
        error: startError instanceof Error ? startError.message : 'Unknown error'
      });
    }
  }, [isCapturing, startCapture, startStreaming, onStreamStart, clearError]);

  const handleStopStream = useCallback(async () => {
    try {
      const recording = await stopStreaming();

      // Si hay grabación, notificar al componente padre
      if (recording && recording.size > 0 && onRecordingReady) {
        onRecordingReady(recording);
      }

      onStreamStop?.();
      logger.info('Live stream stopped successfully');
    } catch (stopError) {
      logger.error('Error stopping live stream:', {
        error: stopError instanceof Error ? stopError.message : 'Unknown error'
      });
    }
  }, [stopStreaming, onRecordingReady, onStreamStop]);

  // Manejar cambios en el estado de streaming
  useEffect(() => {
    if (isStreaming && !webrtcStreaming) {
      handleStartStream();
    } else if (!isStreaming && webrtcStreaming) {
      handleStopStream();
    }
  }, [isStreaming, webrtcStreaming, handleStartStream, handleStopStream]);

  // Configurar eventos de grabación
  useEffect(() => {
    const handleRecordingReady = (event: { blob: Blob; size: number; type: string }) => {
      if (onRecordingReady && event.blob) {
        onRecordingReady(event.blob);
      }
    };

    // Escuchar eventos de grabación desde el servicio WebRTC
    const setupRecordingListener = async () => {
      try {
        const { getLiveSocketService } = await import('@/services/liveSocketService');
        const socketService = getLiveSocketService();

        // Usar directamente el servicio de socket
        socketService.on('webrtc:recording-ready', handleRecordingReady);
      } catch (setupError) {
        logger.error('Error setting up WebRTC listeners:', {
          error: setupError instanceof Error ? setupError.message : 'Unknown error'
        });
      }
    };

    setupRecordingListener();

    return () => {
      // Cleanup se manejará automáticamente
    };
  }, [onRecordingReady]);

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const handleMouseMove = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Controlar cámara
  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraEnabled(videoTrack.enabled);

      }
    }
  };

  // Controlar micrófono
  const toggleMicrophone = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicrophoneEnabled(audioTrack.enabled);

      }
    }
  };

  // Detener captura completamente
  const handleStopCapture = async () => {
    try {
      await stopCapture();
      logger.info('Capture stopped completely');
    } catch (captureError) {
      logger.error('Error stopping capture:', {
        error: captureError instanceof Error ? captureError.message : 'Unknown error'
      });
    }
  };

  const formatBitrate = (bitrate: number) => {
    if (bitrate >= 1000000) {
      return `${(bitrate / 1000000).toFixed(1)} Mbps`;
    } else if (bitrate >= 1000) {
      return `${(bitrate / 1000).toFixed(0)} kbps`;
    }
    return `${bitrate} bps`;
  };

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
        onMouseMove={handleMouseMove}
        onClick={toggleControls}
      />

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{error}</span>
              <button
                onClick={clearError}
                className="text-white hover:text-red-200 transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"
          >
            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
              {/* Status Indicators */}
              <div className="flex items-center space-x-4">
                {isRecording && (
                  <div className="flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">EN VIVO</span>
                  </div>
                )}

                {isCapturing && (
                  <div className="flex items-center space-x-2 bg-green-500 text-white px-3 py-1 rounded-full">
                    <Camera className="w-4 h-4" />
                    <span className="text-sm">Cámara</span>
                  </div>
                )}
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={handleFullscreen}
                className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
              >
                {isFullscreen ? (
                  <Monitor className="w-5 h-5" />
                ) : (
                  <Monitor className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
              {/* Stats */}
              {stats && (
                <div className="mb-4 bg-black/50 text-white p-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-300">Resolución:</span>
                      <span className="ml-2 font-medium">
                        {stats.video.width}x{stats.video.height}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-300">FPS:</span>
                      <span className="ml-2 font-medium">{stats.video.framerate}</span>
                    </div>
                    <div>
                      <span className="text-gray-300">Video:</span>
                      <span className="ml-2 font-medium">{formatBitrate(stats.video.bitrate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-300">Audio:</span>
                      <span className="ml-2 font-medium">{formatBitrate(stats.audio.bitrate)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Media Controls */}
              <div className="flex items-center justify-center space-x-4 mb-4">
                {/* Camera Toggle */}
                <button
                  onClick={toggleCamera}
                  disabled={!isCapturing}
                  className={`p-3 rounded-full transition-colors ${isCameraEnabled
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                    } disabled:bg-gray-500 disabled:cursor-not-allowed`}
                  title={isCameraEnabled ? 'Desactivar cámara' : 'Activar cámara'}
                >
                  {isCameraEnabled ? (
                    <Camera className="w-5 h-5" />
                  ) : (
                    <CameraOff className="w-5 h-5" />
                  )}
                </button>

                {/* Microphone Toggle */}
                <button
                  onClick={toggleMicrophone}
                  disabled={!isCapturing}
                  className={`p-3 rounded-full transition-colors ${isMicrophoneEnabled
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                    } disabled:bg-gray-500 disabled:cursor-not-allowed`}
                  title={isMicrophoneEnabled ? 'Desactivar micrófono' : 'Activar micrófono'}
                >
                  {isMicrophoneEnabled ? (
                    <Mic className="w-5 h-5" />
                  ) : (
                    <MicOff className="w-5 h-5" />
                  )}
                </button>

                {/* Stop Capture Button */}
                {isCapturing && (
                  <button
                    onClick={handleStopCapture}
                    className="p-3 bg-gray-700 hover:bg-gray-800 text-white rounded-full transition-colors"
                    title="Detener captura"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-4">
                {!webrtcStreaming ? (
                  <button
                    onClick={handleStartStream}
                    disabled={isCapturing}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-500 text-white px-6 py-3 rounded-full font-medium transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Iniciar Transmisión</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopStream}
                    className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-full font-medium transition-colors"
                  >
                    <PhoneOff className="w-5 h-5" />
                    <span>Detener Transmisión</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isCapturing && !localStream && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm">Iniciando captura...</p>
          </div>
        </div>
      )}
    </div>
  );
}
