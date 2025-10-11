import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';

interface WebSocketMessage {
  type: string;
  data: unknown;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (type: string, data: unknown) => void;
  lastMessage: WebSocketMessage | null;
}

/**
 * Hook personalizado para gestionar conexión WebSocket
 * @param options - Opciones de configuración del WebSocket
 * @returns Estado y funciones para el WebSocket
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5
  } = options;

  const { token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Obtener URL del WebSocket desde variables de entorno (REQUERIDO)
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

      if (!wsUrl) {
        logger.error('NEXT_PUBLIC_WS_URL no está configurado');
        return;
      }

      const ws = new WebSocket(`${wsUrl}?token=${token}`);

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        if (onConnect) {
          onConnect();
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;

        if (onDisconnect) {
          onDisconnect();
        }

        // Intentar reconectar
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = () => {
        logger.error('WebSocket error:', {
          url: wsUrl,
          readyState: ws.readyState,
          timestamp: new Date().toISOString()
        });

        // Si hay un handler de desconexión, llamarlo
        if (onDisconnect) {
          onDisconnect();
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          if (onMessage) {
            onMessage(message);
          }
        } catch (parseError) {
          logger.error('Error parsing WebSocket message:', {
            error: parseError instanceof Error ? parseError.message : 'Unknown error',
            data: event.data
          });
        }
      };

      wsRef.current = ws;
    } catch (connectionError) {
      logger.error('Error connecting to WebSocket:', {
        error: connectionError instanceof Error ? connectionError.message : 'Unknown error',
        url: wsUrl
      });

      // Intentar reconectar si no se alcanzó el máximo de intentos
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    }
  }, [token, onConnect, onDisconnect, onMessage, reconnectInterval, maxReconnectAttempts]);

  const sendMessage = useCallback((type: string, data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        const message: WebSocketMessage = { type, data };
        wsRef.current.send(JSON.stringify(message));
      } catch (sendError) {
        logger.error('Error sending WebSocket message:', {
          error: sendError instanceof Error ? sendError.message : 'Unknown error',
          type,
          data
        });
      }
    } else {
      logger.warn('Cannot send message: WebSocket is not connected', {
        type,
        readyState: wsRef.current?.readyState,
        expectedState: WebSocket.OPEN
      });
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return {
    isConnected,
    sendMessage,
    lastMessage
  };
}

