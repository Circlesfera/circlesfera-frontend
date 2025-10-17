'use client';

import { io, Socket } from 'socket.io-client';
import logger from '@/utils/logger';
import type { Message } from '@/types';

interface MessageSocketEvents {
  // Mensajes
  'new_message': (message: Message) => void;
  'message:edited': (data: { messageId: string; content: string }) => void;
  'message:deleted': (data: { messageId: string; deletedFor: 'me' | 'everyone' }) => void;

  // Estado de usuario
  'user_online': (data: { userId: string }) => void;
  'user_offline': (data: { userId: string }) => void;

  // Typing indicators
  'user_typing': (data: { userId: string; username: string; conversationId: string }) => void;
  'user_stopped_typing': (data: { userId: string; conversationId: string }) => void;

  // Notificaciones
  'new_notification': (notification: { id: string; type: string; content: string }) => void;

  // Errores
  'error': (error: { message: string }) => void;
  'connect_error': (error: Error) => void;
}

class MessageSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private onlineUsers: Set<string> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  private connect() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      logger.warn('No token found for socket connection');
      return;
    }

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      logger.info('Socket conectado para mensajería');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason: string) => {
      logger.info(`Socket desconectado: ${reason}`);
      this.isConnected = false;

      if (reason === 'io server disconnect') {
        // El servidor desconectó, intentar reconectar
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (connectionError: Error) => {
      logger.error('Error de conexión de socket:', connectionError.message);
      this.handleReconnect();
    });

    this.socket.on('error', (socketError: { message: string }) => {
      logger.error('Error de socket:', socketError.message);
    });

    // Eventos de estado de usuario
    this.socket.on('user_online', (data: { userId: string }) => {
      this.onlineUsers.add(data.userId);
      logger.debug(`Usuario ${data.userId} ahora está online`);
    });

    this.socket.on('user_offline', (data: { userId: string }) => {
      this.onlineUsers.delete(data.userId);
      logger.debug(`Usuario ${data.userId} ahora está offline`);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      logger.info(`Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      logger.error('Máximo de intentos de reconexión alcanzado');
    }
  }

  // Unirse a una conversación
  joinConversation(conversationId: string) {
    if (this.socket && this.isConnected) {
      logger.debug(`Uniéndose a conversación ${conversationId}`);
      this.socket.emit('join_conversation', conversationId);
    }
  }

  // Salir de una conversación
  leaveConversation(conversationId: string) {
    if (this.socket && this.isConnected) {
      logger.debug(`Saliendo de conversación ${conversationId}`);
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  // Enviar mensaje
  sendMessage(conversationId: string, content: string, replyTo?: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        conversationId,
        content,
        replyTo,
      });
    }
  }

  // Editar mensaje
  editMessage(messageId: string, content: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('edit_message', {
        messageId,
        content,
      });
    }
  }

  // Borrar mensaje
  deleteMessage(messageId: string, deleteFor: 'me' | 'everyone') {
    if (this.socket && this.isConnected) {
      this.socket.emit('delete_message', {
        messageId,
        deleteFor,
      });
    }
  }

  // Indicadores de escritura
  startTyping(conversationId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { conversationId });
    }
  }

  stopTyping(conversationId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { conversationId });
    }
  }

  // Verificar si un usuario está online
  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  // Obtener usuarios online
  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers);
  }

  // Métodos para listeners de eventos
  on<K extends keyof MessageSocketEvents>(event: K, callback: MessageSocketEvents[K]) {
    if (this.socket) {
      this.socket.on(event as string, callback as (...args: unknown[]) => void);
    }
  }

  off<K extends keyof MessageSocketEvents>(event: K, callback?: MessageSocketEvents[K]) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event as string, callback as (...args: unknown[]) => void);
      } else {
        this.socket.off(event as string);
      }
    }
  }

  // Emitir eventos personalizados
  emit<K extends keyof MessageSocketEvents>(event: K, data: Parameters<MessageSocketEvents[K]>[0]) {
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
      this.onlineUsers.clear();
    }
  }

  // Actualizar token de autenticación
  updateAuthToken(token: string | null) {
    if (this.socket) {
      this.socket.auth = { token: token || undefined };
      if (token) {
        this.socket.connect();
      } else {
        this.socket.disconnect();
      }
    } else if (token) {
      this.connect();
    }
  }

  // Obtener estadísticas
  getStats() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id,
      transport: this.socket?.io?.engine?.transport?.name,
      onlineUsersCount: this.onlineUsers.size,
    };
  }
}

// Singleton instance
let messageSocketInstance: MessageSocketService | null = null;

export const getMessageSocketService = (): MessageSocketService => {
  if (!messageSocketInstance) {
    messageSocketInstance = new MessageSocketService();
  }
  return messageSocketInstance;
};

// Hook personalizado para usar el servicio
export const useMessageSocket = () => {
  return getMessageSocketService();
};

export default MessageSocketService;

