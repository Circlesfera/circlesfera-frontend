'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { getWebRTCService } from '@/services/webrtcService';
import logger from '@/utils/logger';

interface UseWebRTCOptions {
  streamId?: string;
  isStreamer?: boolean;
  autoStart?: boolean;
}

interface WebRTCState {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isCapturing: boolean;
  isStreaming: boolean;
  isRecording: boolean;
  error: string | null;
  stats: {
    video: {
      width: number;
      height: number;
      framerate: number;
      bitrate: number;
    };
    audio: {
      bitrate: number;
      sampleRate: number;
    };
    connection: {
      state: string;
      bytesSent: number;
      bytesReceived: number;
    };
  } | null;
}

export const useWebRTC = (options: UseWebRTCOptions = {}) => {
  const { streamId, isStreamer = false, autoStart = false } = options;

  const [state, setState] = useState<WebRTCState>({
    localStream: null,
    remoteStreams: new Map(),
    isCapturing: false,
    isStreaming: false,
    isRecording: false,
    error: null,
    stats: null,
  });

  const webrtcService = useRef(getWebRTCService());
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Funciones de monitoreo (definir PRIMERO - usadas por otros callbacks)
  // Detener monitoreo de estadísticas
  const stopStatsMonitoring = useCallback(() => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
  }, []);

  // Iniciar monitoreo de estadísticas
  const startStatsMonitoring = useCallback(() => {
    if (statsIntervalRef.current) return;

    statsIntervalRef.current = setInterval(async () => {
      try {
        const stats = await webrtcService.current.getStats();
        if (stats) {
          setState(prev => ({ ...prev, stats }));
        }
      } catch (statsError) {
        logger.debug('Error getting stats (non-critical):', {
          error: statsError instanceof Error ? statsError.message : 'Unknown error'
        });
      }
    }, 1000); // Actualizar cada segundo
  }, []);

  // Iniciar captura de medios
  const startCapture = useCallback(async (config: {
    video?: boolean | MediaTrackConstraints;
    audio?: boolean | MediaTrackConstraints;
    screen?: boolean;
  } = {}) => {
    try {
      setState(prev => ({ ...prev, error: null, isCapturing: true }));

      const defaultConfig = {
        video: config.video ?? true,
        audio: config.audio ?? true,
        screen: config.screen ?? false,
      };

      const stream = await webrtcService.current.startCapture(defaultConfig);

      setState(prev => ({
        ...prev,
        localStream: stream,
        isCapturing: true,
      }));

      // Iniciar estadísticas si somos streamer
      if (isStreamer) {
        startStatsMonitoring();
      }

      return stream;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isCapturing: false,
      }));
      throw error;
    }
  }, [isStreamer, startStatsMonitoring]);

  // Detener transmisión (ANTES de stopCapture que lo usa)
  const stopStreaming = useCallback(async () => {
    try {
      const recording = await webrtcService.current.stopStreaming();

      setState(prev => ({
        ...prev,
        isStreaming: false,
        isRecording: false,
      }));

      stopStatsMonitoring();

      return recording;
    } catch (recordingError) {
      logger.error('Error stopping recording:', {
        error: recordingError instanceof Error ? recordingError.message : 'Unknown error'
      });
      throw recordingError;
    }
  }, [stopStatsMonitoring]);

  // Detener captura
  const stopCapture = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isCapturing: false }));

      if (isStreamer) {
        await stopStreaming();
      }

      const stream = webrtcService.current.getLocalStream();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      setState(prev => ({
        ...prev,
        localStream: null,
        isCapturing: false,
        isStreaming: false,
        isRecording: false,
      }));

      stopStatsMonitoring();

    } catch (stopError) {
      logger.error('Error stopping stream:', {
        error: stopError instanceof Error ? stopError.message : 'Unknown error'
      });
    }
  }, [isStreamer, stopStreaming, stopStatsMonitoring]);

  // Iniciar transmisión
  const startStreaming = useCallback(async () => {
    if (!streamId) {
      throw new Error('Stream ID es requerido para transmitir');
    }

    try {
      setState(prev => ({ ...prev, error: null }));

      await webrtcService.current.startStreaming(streamId);

      setState(prev => ({
        ...prev,
        isStreaming: true,
        isRecording: true,
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error iniciando transmisión';
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  }, [streamId]);

  // Unirse a transmisión como viewer
  const joinStream = useCallback(async (streamId: string, viewerId: string) => {
    try {
      setState(prev => ({ ...prev, error: null }));

      await webrtcService.current.joinStream(streamId, viewerId);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error uniéndose a transmisión';
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-iniciar si está habilitado
  useEffect(() => {
    if (autoStart && streamId && isStreamer) {
      startCapture().then(() => {
        startStreaming();
      }).catch(console.error);
    }

    return () => {
      if (autoStart) {
        stopCapture();
      }
      stopStatsMonitoring();
    };
  }, [autoStart, streamId, isStreamer, startCapture, startStreaming, stopCapture, stopStatsMonitoring]);

  // Cleanup al desmontar
  useEffect(() => {
    // Capturar el ref value para usarlo en cleanup
    const service = webrtcService.current;
    return () => {
      stopStatsMonitoring();
      service.cleanup();
    };
  }, [stopStatsMonitoring]);

  return {
    // Estado
    ...state,

    // Métodos
    startCapture,
    stopCapture,
    startStreaming,
    stopStreaming,
    joinStream,
    clearError,

    // Utilidades
    getLocalStream: () => webrtcService.current.getLocalStream(),
    isCurrentlyStreaming: () => webrtcService.current.isCurrentlyStreaming(),
    getDeviceInfo: () => webrtcService.current.getDeviceInfo(),
    switchCamera: (deviceId: string) => webrtcService.current.switchCamera(deviceId),
    switchMicrophone: (deviceId: string) => webrtcService.current.switchMicrophone(deviceId),
    getNetworkQuality: () => webrtcService.current.getNetworkQuality(),
  };
};
