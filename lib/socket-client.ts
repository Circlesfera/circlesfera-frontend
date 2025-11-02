import { io, type Socket } from 'socket.io-client';

import { clientEnv } from './env';
import { sessionStore } from '@/store/session';

let socketInstance: Socket | null = null;

/**
 * Obtiene o crea la instancia de Socket.IO conectada al servidor.
 * Se autentica automáticamente usando el accessToken de la sesión.
 */
export const getSocketClient = (): Socket | null => {
  const { accessToken, user } = sessionStore.getState();

  // Si no hay sesión, no crear conexión
  if (!accessToken || !user) {
    return null;
  }

  // Si ya existe una instancia conectada, retornarla
  if (socketInstance?.connected) {
    return socketInstance;
  }

  // Crear nueva conexión
  socketInstance = io(clientEnv.NEXT_PUBLIC_SOCKET_URL, {
    auth: {
      token: accessToken
    },
    transports: ['websocket', 'polling'],
    autoConnect: true
  });

  socketInstance.on('connect', () => {
    console.log('Conectado a Socket.IO');
  });

  socketInstance.on('disconnect', (reason) => {
    console.log('Desconectado de Socket.IO:', reason);
  });

  socketInstance.on('connect_error', (error) => {
    console.error('Error de conexión Socket.IO:', error);
  });

  return socketInstance;
};

/**
 * Cierra la conexión de Socket.IO.
 */
export const disconnectSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

