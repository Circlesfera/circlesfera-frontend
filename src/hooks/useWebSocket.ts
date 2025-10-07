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
      // Obtener URL del WebSocket desde variables de entorno o usar default
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';
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

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          if (onMessage) {
            onMessage(message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }, [token, onConnect, onDisconnect, onMessage, reconnectInterval, maxReconnectAttempts]);

  const sendMessage = useCallback((type: string, data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = { type, data };
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
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

