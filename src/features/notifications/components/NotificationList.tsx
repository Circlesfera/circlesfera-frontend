import React, { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/design-system/Button'
import { Avatar } from '@/design-system/Avatar'
import {
  Heart,
  MessageCircle,
  UserPlus,
  Share2,
  Bell,
  X,
  Check,
  MoreHorizontal
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService'
import logger from '@/utils/logger'

interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'share' | 'mention' | 'system'
  title: string
  message: string
  user?: {
    id: string
    username: string
    avatar?: string
  }
  post?: {
    id: string
    thumbnail?: string
  }
  isRead: boolean
  createdAt: string
}

interface NotificationListProps {
  onClose?: () => void
  className?: string
}

const NotificationList = memo(({ onClose, className = '' }: NotificationListProps) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await getNotifications()
      setNotifications(response.notifications)
      setError(null)
    } catch (err) {
      setError('Error cargando notificaciones')
      logger.error('Error fetching notifications', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
      setNotifications(prev => prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ))
    } catch (err) {
      logger.error('Error marking notification as read', err)
    }
  }, [])

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead()
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))
    } catch (err) {
      logger.error('Error marking all notifications as read', err)
    }
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />
      case 'share':
        return <Share2 className="w-5 h-5 text-purple-500" />
      case 'mention':
        return <MessageCircle className="w-5 h-5 text-orange-500" />
      case 'system':
        return <Bell className="w-5 h-5 text-gray-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Ahora'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  if (!user) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">
          Inicia sesión para ver tus notificaciones
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg max-h-96 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Notificaciones
        </h3>
        <div className="flex items-center space-x-2">
          {notifications.some(n => !n.isRead) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Marcar todas como leídas
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Cargando notificaciones...
            </p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-500 text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotifications}
              className="mt-2"
            >
              Reintentar
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No tienes notificaciones
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {formatTime(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* User Avatar */}
                    {notification.user && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Avatar
                          src={notification.user.avatar}
                          alt={notification.user.username}
                          size="sm"
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          @{notification.user.username}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
})

NotificationList.displayName = 'NotificationList'

export default NotificationList
