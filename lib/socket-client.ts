import { io, type Socket } from 'socket.io-client';

import { sessionStore } from '@/store/session';

import { clientEnv } from './env';
import { logger } from './logger';

let socketInstance: Socket | null = null;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

/**
 * Obtiene o crea la instancia de Socket.IO conectada al servidor.
 * Se autentica automáticamente usando el accessToken de la sesión.
 */
export const getSocketClient = (): Socket | null => {
  const { accessToken, user } = sessionStore.getState();

  // Si no hay sesión, no crear conexión
  if (!accessToken || !user) {
    // Si hay una instancia existente, desconectarla
    if (socketInstance) {
      disconnectSocket();
    }
    return null;
  }

  // Si ya existe una instancia conectada, retornarla
  if (socketInstance?.connected) {
    return socketInstance;
  }

  // Si hay demasiados intentos fallidos, no intentar más
  if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
    return null;
  }

  // Verificar que la URL esté definida
  if (!clientEnv.NEXT_PUBLIC_SOCKET_URL) {
    logger.warn('NEXT_PUBLIC_SOCKET_URL no está configurada. Socket.IO deshabilitado.');
    return null;
  }

  // Si hay una instancia desconectada, limpiarla primero
  if (socketInstance && !socketInstance.connected) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }

  // Crear nueva conexión
  try {
    socketInstance = io(clientEnv.NEXT_PUBLIC_SOCKET_URL, {
      auth: {
        token: accessToken
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 10000
    });

    socketInstance.on('connect', () => {
      connectionAttempts = 0; // Resetear contador en conexión exitosa
      logger.info('Conectado a Socket.IO');
    });

    socketInstance.on('disconnect', (reason) => {
      // Solo loggear desconexiones importantes, no las esperadas
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        logger.info('Desconectado de Socket.IO', { reason });
      } else {
        logger.warn('Desconectado de Socket.IO', { reason });
      }
    });

    socketInstance.on('connect_error', (error: Error & { type?: unknown }) => {
      connectionAttempts++;
      
      // Solo mostrar warning en lugar de error para evitar ruido en consola
      // Los errores de conexión son comunes cuando el servidor no está disponible
      if (connectionAttempts <= MAX_CONNECTION_ATTEMPTS) {
        const errorMetadata: Record<string, unknown> = {
          intento: connectionAttempts,
          maxIntentos: MAX_CONNECTION_ATTEMPTS
        };
        if (typeof error.type === 'string') {
          errorMetadata.tipo = error.type;
        }
        logger.warn('No se pudo conectar a Socket.IO', errorMetadata);
      } else {
        // Después de múltiples intentos, deshabilitar silenciosamente
        logger.warn('Socket.IO: Servidor no disponible. Funcionalidades en tiempo real deshabilitadas.');
        if (socketInstance) {
          socketInstance.removeAllListeners();
          socketInstance.disconnect();
          socketInstance = null;
        }
      }
    });

    socketInstance.on('reconnect', (attemptNumber: number) => {
      connectionAttempts = 0;
      logger.info('Reconectado a Socket.IO', { intento: attemptNumber });
    });

    socketInstance.on('reconnect_attempt', (attemptNumber: number) => {
      logger.info('Intentando reconectar a Socket.IO', { intento: attemptNumber });
    });

    socketInstance.on('reconnect_error', () => {
      // No loggear cada error de reconexión para evitar spam
    });

    socketInstance.on('reconnect_failed', () => {
      logger.warn('No se pudo reconectar a Socket.IO después de múltiples intentos');
      connectionAttempts = MAX_CONNECTION_ATTEMPTS;
    });
  } catch (error) {
    logger.error('Error al inicializar Socket.IO', { error });
    socketInstance = null;
    return null;
  }

  return socketInstance;
};

/**
 * Cierra la conexión de Socket.IO.
 */
export const disconnectSocket = (): void => {
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
    connectionAttempts = 0;
  }
};

/**
 * Reinicia la conexión de Socket.IO.
 */
export const resetSocketConnection = (): void => {
  disconnectSocket();
  connectionAttempts = 0;
  getSocketClient();
};

