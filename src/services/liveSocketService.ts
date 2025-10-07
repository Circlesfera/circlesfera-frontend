'use client';

import { io, Socket } from 'socket.io-client';
import type { LiveComment, LiveStreamViewer } from '@/types/live';

interface LiveSocketEvents {
  // Comentarios
  'comment:new': (comment: LiveComment) => void;
  'comment:reaction': (commentId: string, reaction: 'like' | 'love' | 'laugh' | 'wow' | 'angry', user: { _id: string; username: string }) => void;
  'comment:reply': (parentId: string, comment: LiveComment) => void;
  'comment:moderate': (commentId: string, action: string) => void;

  // Viewers
  'viewer:join': (viewer: LiveStreamViewer) => void;
  'viewer:leave': (viewerId: string) => void;
  'viewer:count': (count: number) => void;

  // Stream status
  'stream:start': (stream: LiveStream) => void;
  'stream:end': (streamId: string) => void;
  'stream:update': (stream: Partial<LiveStream>) => void;

  // Reacciones del stream
  'stream:like': (streamId: string, user: { _id: string; username: string }) => void;
  'stream:share': (streamId: string, user: { _id: string; username: string }) => void;

  // Notificaciones
  'notification:new': (notification: { _id: string; type: string; content: string }) => void;

  // WebRTC
  'webrtc:offer': (data: { streamId: string; offer: RTCSessionDescriptionInit; from: string }) => void;
  'webrtc:answer': (data: { streamId: string; answer: RTCSessionDescriptionInit; from: string }) => void;
  'webrtc:ice-candidate': (data: { streamId: string; candidate: RTCIceCandidateInit; from: string }) => void;
  'webrtc:disconnect': (data: { streamId: string; from: string }) => void;
  'webrtc:recording-ready': (data: { blob: Blob; size: number; type: string }) => void;

  // Errores
  'error': (error: string) => void;
  'connect_error': (error: Error) => void;
}

class LiveSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.connect();
  }

  private connect() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token: token || undefined,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Conectado al servidor de Live Streaming');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('🔌 Desconectado del servidor:', reason);
      this.isConnected = false;

      if (reason === 'io server disconnect') {
        // El servidor desconectó, intentar reconectar
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('❌ Error de conexión:', error);
      this.handleReconnect();
    });

    this.socket.on('error', (error: Error) => {
      console.error('❌ Error del socket:', error);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(`🔄 Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('❌ Máximo de intentos de reconexión alcanzado');
    }
  }


  // Métodos públicos para unirse a salas
  joinLiveStream(streamId: string) {
    if (this.socket && this.isConnected) {
      console.log(`📺 Uniéndose a transmisión: ${streamId}`);
      this.socket.emit('join:stream', streamId);
    }
  }

  leaveLiveStream(streamId: string) {
    if (this.socket && this.isConnected) {
      console.log(`📺 Dejando transmisión: ${streamId}`);
      this.socket.emit('leave:stream', streamId);
    }
  }

  // Métodos para comentarios
  sendComment(streamId: string, content: string, parentId?: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('comment:send', {
        streamId,
        content,
        parentId,
        timestamp: Date.now(),
      });
    }
  }

  reactToComment(commentId: string, reaction: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('comment:react', {
        commentId,
        reaction,
      });
    }
  }

  moderateComment(commentId: string, action: 'hide' | 'delete' | 'pin' | 'unpin') {
    if (this.socket && this.isConnected) {
      this.socket.emit('comment:moderate', {
        commentId,
        action,
      });
    }
  }

  // Métodos para reacciones del stream
  likeStream(streamId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stream:like', { streamId });
    }
  }

  shareStream(streamId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stream:share', { streamId });
    }
  }

  // Métodos para listeners de eventos
  on<K extends keyof LiveSocketEvents>(event: K, callback: LiveSocketEvents[K]) {
    if (this.socket) {
      this.socket.on(event as string, callback as (...args: unknown[]) => void);
    }
  }

  off<K extends keyof LiveSocketEvents>(event: K, callback?: LiveSocketEvents[K]) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event as string, callback as (...args: unknown[]) => void);
      } else {
        this.socket.off(event as string);
      }
    }
  }

  // Emitir eventos
  emit<K extends keyof LiveSocketEvents>(event: K, data: Parameters<LiveSocketEvents[K]>[0]) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event as string, data);
    }
  }

  // Métodos de utilidad
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    return 'connecting';
  }

  // Limpiar conexión
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Actualizar token de autenticación
  updateAuthToken(token: string | null) {
    if (this.socket) {
      this.socket.auth = { token: token || undefined };
      if (token) {
        this.socket.emit('auth:update', { token });
      }
    }
  }


  // Métodos para typing indicators
  startTyping(streamId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing:start', { streamId });
    }
  }

  stopTyping(streamId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing:stop', { streamId });
    }
  }

  // Métodos para estadísticas y debugging
  getStats() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id,
      transport: this.socket?.io?.engine?.transport?.name,
    };
  }
}

// Singleton instance
let liveSocketInstance: LiveSocketService | null = null;

export const getLiveSocketService = (): LiveSocketService => {
  if (!liveSocketInstance) {
    liveSocketInstance = new LiveSocketService();
  }
  return liveSocketInstance;
};

// Hook personalizado para usar el servicio
export const useLiveSocket = () => {
  return getLiveSocketService();
};

export default LiveSocketService;
