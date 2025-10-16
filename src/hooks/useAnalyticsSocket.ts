import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/features/auth/useAuth'

interface AnalyticsSocketData {
  type: string
  data: Record<string, unknown>
  timestamp: string
  timeRange?: string
}

interface AnalyticsAlert {
  type: string
  message: string
  severity: 'info' | 'warning' | 'error'
  data?: Record<string, unknown>
}

interface UseAnalyticsSocketReturn {
  socket: Socket | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  data: AnalyticsSocketData | null
  alerts: AnalyticsAlert[]
  connect: () => void
  disconnect: () => void
  changeTimeRange: (timeRange: string) => void
  requestData: (dataType: string, params?: Record<string, unknown>) => void
  clearAlerts: () => void
}

export function useAnalyticsSocket(): UseAnalyticsSocketReturn {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AnalyticsSocketData | null>(null)
  const [alerts, setAlerts] = useState<AnalyticsAlert[]>([])
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const connectRef = useRef<(() => void) | undefined>(undefined)
  const disconnectRef = useRef<(() => void) | undefined>(undefined)

  const connect = useCallback(() => {
    if (socket?.connected || isConnecting || !user) return

    setIsConnecting(true)
    setError(null)

    // Conectar directamente al servidor de analytics
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      path: '/analytics-socket.io',
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    socketInstance.on('connect', () => {
      console.log('Connected to analytics WebSocket')
      setIsConnected(true)
      setIsConnecting(false)
      setError(null)
      reconnectAttemptsRef.current = 0

      // Unirse a la sala de analytics
      socketInstance.emit('join-analytics', {
        userId: user._id,
        userRole: user.role,
        timeRange: '24h'
      })
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected from analytics WebSocket:', reason)
      setIsConnected(false)
      setIsConnecting(false)

      // Intentar reconectar si no fue desconexión manual
      if (reason !== 'io client disconnect' && reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
        reconnectAttemptsRef.current++

        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
          connectRef.current?.()
        }, delay)
      }
    })

    socketInstance.on('connect_error', (err) => {
      console.error('Analytics WebSocket connection error:', err)
      setError('Error de conexión con el servidor de analytics')
      setIsConnecting(false)

      // Intentar reconectar
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
        reconnectAttemptsRef.current++

        reconnectTimeoutRef.current = setTimeout(() => {
          connectRef.current?.()
        }, delay)
      }
    })

    // Eventos de analytics
    socketInstance.on('analytics-initial-data', (socketData: AnalyticsSocketData) => {
      console.log('Received initial analytics data:', socketData)
      setData(socketData)
    })

    socketInstance.on('analytics-update', (socketData: AnalyticsSocketData) => {
      console.log('Received analytics update:', socketData)
      setData(socketData)
    })

    socketInstance.on('analytics-data', (socketData: AnalyticsSocketData) => {
      console.log('Received analytics data:', socketData)
      setData(socketData)
    })

    socketInstance.on('analytics-event', (eventData: Record<string, unknown>) => {
      console.log('Received analytics event:', eventData)
      // Aquí puedes manejar eventos específicos en tiempo real
    })

    socketInstance.on('analytics-alert', (alertData: { alerts: AnalyticsAlert[] }) => {
      console.log('Received analytics alerts:', alertData)
      setAlerts(prev => [...prev, ...alertData.alerts])
    })

    socketInstance.on('analytics-error', (errorData: { message: string }) => {
      console.error('Analytics WebSocket error:', errorData)
      setError(errorData.message)
    })

    setSocket(socketInstance)
  }, [user, isConnecting]) // Removido socket para evitar bucle infinito

  // Actualizar ref
  connectRef.current = connect

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (socket) {
      socket.disconnect()
      setSocket(null)
    }

    setIsConnected(false)
    setIsConnecting(false)
    setError(null)
    reconnectAttemptsRef.current = 0
  }, []) // Sin dependencias para evitar bucle infinito

  // Actualizar ref
  disconnectRef.current = disconnect

  const changeTimeRange = useCallback((timeRange: string) => {
    if (socket?.connected && user) {
      socket.emit('change-time-range', {
        userId: user._id,
        timeRange
      })
    }
  }, [socket, user])

  const requestData = useCallback((dataType: string, params: Record<string, unknown> = {}) => {
    if (socket?.connected && user) {
      socket.emit('request-analytics-data', {
        userId: user._id,
        dataType,
        params
      })
    }
  }, [socket, user])

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  // Conectar automáticamente cuando el usuario esté disponible
  useEffect(() => {
    if (user && user.role === 'admin' && !socket) {
      connectRef.current?.()
    }

    return () => {
      disconnectRef.current?.()
    }
  }, [user, socket]) // Agregado socket para detectar cambios de estado

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return {
    socket,
    isConnected,
    isConnecting,
    error,
    data,
    alerts,
    connect,
    disconnect,
    changeTimeRange,
    requestData,
    clearAlerts
  }
}
