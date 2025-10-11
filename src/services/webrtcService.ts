'use client';

import { getLiveSocketService } from './liveSocketService';

interface WebRTCConfig {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
  screen?: boolean;
}

interface WebRTCStats {
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
}

class WebRTCService {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private socketService = getLiveSocketService();
  private isStreaming = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  constructor() {
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    // Escuchar ofertas WebRTC
    this.socketService.on('webrtc:offer', async (data: { streamId: string; offer: RTCSessionDescriptionInit; from: string }) => {
      await this.handleOffer(data.streamId, data.offer, data.from);
    });

    // Escuchar respuestas WebRTC
    this.socketService.on('webrtc:answer', async (data: { streamId: string; answer: RTCSessionDescriptionInit; from: string }) => {
      await this.handleAnswer(data.streamId, data.answer, data.from);
    });

    // Escuchar candidatos ICE
    this.socketService.on('webrtc:ice-candidate', async (data: { streamId: string; candidate: RTCIceCandidateInit; from: string }) => {
      await this.handleIceCandidate(data.streamId, data.candidate, data.from);
    });

    // Escuchar desconexiones
    this.socketService.on('webrtc:disconnect', (data: { streamId: string; from: string }) => {
      this.disconnectPeer(data.from);
    });
  }

  // Iniciar captura de medios (para el streamer)
  async startCapture(config: WebRTCConfig): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: config.video,
        audio: config.audio,
      };

      // Si es captura de pantalla
      if (config.screen) {
        this.localStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
      } else {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      // Configurar grabación para CSTV
      this.setupRecording();

      console.log('🎥 Captura de medios iniciada:', {
        videoTracks: this.localStream.getVideoTracks().length,
        audioTracks: this.localStream.getAudioTracks().length,
      });

      return this.localStream;
    } catch (error) {

      throw new Error('No se pudo acceder a la cámara/micrófono');
    }
  }

  // Configurar grabación para CSTV
  private setupRecording() {
    if (!this.localStream) return;

    try {
      const options = {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 2500000, // 2.5 Mbps
        audioBitsPerSecond: 128000,  // 128 kbps
      };

      this.mediaRecorder = new MediaRecorder(this.localStream, options);
      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.saveRecording(blob);
      };

    } catch (error) {

    }
  }

  // Iniciar grabación
  startRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
      this.mediaRecorder.start(1000); // Grabación en chunks de 1 segundo

    }
  }

  // Detener grabación
  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
          resolve(blob);
        };
        this.mediaRecorder.stop();

      } else {
        resolve(new Blob());
      }
    });
  }

  // Guardar grabación
  private async saveRecording(blob: Blob) {
    try {
      const formData = new FormData();
      formData.append('recording', blob, `live-recording-${Date.now()}.webm`);

      // Aquí podrías subir el archivo al servidor para CSTV

      // Emitir evento para que el componente maneje la subida
      this.socketService.emit('webrtc:recording-ready', {
        blob,
        size: blob.size,
        type: blob.type,
      });
    } catch (error) {

    }
  }

  // Iniciar transmisión
  async startStreaming(streamId: string): Promise<void> {
    if (!this.localStream) {
      throw new Error('No hay stream local disponible');
    }

    this.isStreaming = true;
    this.startRecording();

    // Unirse a la sala de WebRTC
    this.socketService.joinLiveStream(streamId);

  }

  // Detener transmisión
  async stopStreaming(): Promise<Blob | null> {
    this.isStreaming = false;

    // Detener grabación
    const recording = await this.stopRecording();

    // Cerrar todas las conexiones peer
    this.peerConnections.forEach((pc, peerId) => {
      pc.close();
      this.peerConnections.delete(peerId);
    });

    // Detener stream local
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    return recording;
  }

  // Unirse a transmisión (como viewer)
  async joinStream(streamId: string, viewerId: string): Promise<void> {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });

      // Manejar candidatos ICE
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.socketService.emit('webrtc:ice-candidate', {
            streamId,
            candidate: event.candidate,
            to: viewerId,
          });
        }
      };

      // Manejar stream remoto
      peerConnection.ontrack = (event) => {

        // El stream remoto se manejará en el componente
      };

      // Manejar cambios de estado
      peerConnection.onconnectionstatechange = () => {

      };

      this.peerConnections.set(viewerId, peerConnection);

      // Unirse a la sala
      this.socketService.joinLiveStream(streamId);

    } catch (error) {

      throw error;
    }
  }

  // Manejar oferta WebRTC
  private async handleOffer(_streamId: string, offer: RTCSessionDescriptionInit, from: string) {
    try {
      let peerConnection = this.peerConnections.get(from);

      if (!peerConnection) {
        peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        });

        // Agregar stream local si somos el streamer
        if (this.localStream) {
          this.localStream.getTracks().forEach(track => {
            peerConnection!.addTrack(track, this.localStream!);
          });
        }

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
        this.socketService.emit('webrtc:ice-candidate', {
          streamId: _streamId,
          candidate: event.candidate,
          to: from,
        });
          }
        };

        this.peerConnections.set(from, peerConnection);
      }

      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      this.socketService.emit('webrtc:answer', {
        streamId: _streamId,
        answer,
        to: from,
      });

    } catch (error) {

    }
  }

  // Manejar respuesta WebRTC
  private async handleAnswer(_streamId: string, answer: RTCSessionDescriptionInit, from: string) {
    try {
      const peerConnection = this.peerConnections.get(from);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);

      }
    } catch (error) {

    }
  }

  // Manejar candidato ICE
  private async handleIceCandidate(_streamId: string, candidate: RTCIceCandidateInit, from: string) {
    try {
      const peerConnection = this.peerConnections.get(from);
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate);

      }
    } catch (error) {

    }
  }

  // Desconectar peer
  private disconnectPeer(peerId: string) {
    const peerConnection = this.peerConnections.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(peerId);

    }
  }

  // Obtener estadísticas
  async getStats(): Promise<WebRTCStats | null> {
    if (!this.localStream) return null;

    try {
      const videoTrack = this.localStream.getVideoTracks()[0];
      const audioTrack = this.localStream.getAudioTracks()[0];

      if (!videoTrack || !audioTrack) return null;

      // Usar la API de settings en lugar de getStats
      const videoSettings = videoTrack.getSettings();
      const audioSettings = audioTrack.getSettings();

      return {
        video: {
          width: videoSettings.width || 0,
          height: videoSettings.height || 0,
          framerate: videoSettings.frameRate || 0,
          bitrate: 0, // No disponible en settings
        },
        audio: {
          bitrate: 0, // No disponible en settings
          sampleRate: audioSettings.sampleRate || 0,
        },
        connection: {
          state: 'active',
          bytesSent: 0,
          bytesReceived: 0,
        },
      };
    } catch (error) {

      return null;
    }
  }

  // Obtener stream local
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Verificar si está transmitiendo
  isCurrentlyStreaming(): boolean {
    return this.isStreaming;
  }

  // Obtener información del dispositivo
  async getDeviceInfo(): Promise<{
    cameras: MediaDeviceInfo[];
    microphones: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  }> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      return {
        cameras: devices.filter(device => device.kind === 'videoinput'),
        microphones: devices.filter(device => device.kind === 'audioinput'),
        speakers: devices.filter(device => device.kind === 'audiooutput'),
      };
    } catch (error) {

      return { cameras: [], microphones: [], speakers: [] };
    }
  }

  // Cambiar cámara
  async switchCamera(deviceId: string): Promise<boolean> {
    if (!this.localStream) return false;

    try {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: true,
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      if (newVideoTrack && this.localStream && videoTrack) {
        this.localStream.removeTrack(videoTrack);
        this.localStream.addTrack(newVideoTrack);
      }

      return true;
    } catch (error) {

      return false;
    }
  }

  // Cambiar micrófono
  async switchMicrophone(deviceId: string): Promise<boolean> {
    if (!this.localStream) return false;

    try {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.stop();
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: { deviceId: { exact: deviceId } },
      });

      const newAudioTrack = newStream.getAudioTracks()[0];
      if (newAudioTrack && this.localStream && audioTrack) {
        this.localStream.removeTrack(audioTrack);
        this.localStream.addTrack(newAudioTrack);
      }

      return true;
    } catch (error) {

      return false;
    }
  }

  // Obtener calidad de red
  async getNetworkQuality(): Promise<'excellent' | 'good' | 'poor' | 'unknown'> {
    try {
      if (!this.localStream) return 'unknown';

      // Usar la API de Network Information si está disponible
      if ('connection' in navigator) {
        const connection = (navigator as Navigator & { connection?: { effectiveType: string } }).connection;
        if (connection) {
          const effectiveType = connection.effectiveType;
          switch (effectiveType) {
            case '4g':
              return 'excellent';
            case '3g':
              return 'good';
            case '2g':
            case 'slow-2g':
              return 'poor';
            default:
              return 'unknown';
          }
        }
      }

      return 'unknown';
    } catch (error) {

      return 'unknown';
    }
  }

  // Limpiar recursos
  cleanup() {
    this.stopStreaming();
    this.socketService.off('webrtc:offer');
    this.socketService.off('webrtc:answer');
    this.socketService.off('webrtc:ice-candidate');
    this.socketService.off('webrtc:disconnect');
  }
}

// Singleton instance
let webrtcInstance: WebRTCService | null = null;

export const getWebRTCService = (): WebRTCService => {
  if (!webrtcInstance) {
    webrtcInstance = new WebRTCService();
  }
  return webrtcInstance;
};

export default WebRTCService;
