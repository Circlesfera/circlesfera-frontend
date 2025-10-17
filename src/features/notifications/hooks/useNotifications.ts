import { useState, useEffect, useCallback } from 'react'
import { Notification } from '../types'
import { notificationService } from '../services/notificationService'
import logger from '@/utils/logger'

interface UseNotificationsOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { autoRefresh = true, refreshInterval = 30000 } = options

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationService.getNotifications()
      setNotifications(response.notifications)
      setUnreadCount(response.unreadCount)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading notifications')
      logger.error('Error fetching notifications', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev => prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      logger.error('Error marking notification as read', err)
      throw err
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      logger.error('Error marking all notifications as read', err)
      throw err
    }
  }, [])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId)
      const notification = notifications.find(n => n.id === notificationId)
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      logger.error('Error deleting notification', err)
      throw err
    }
  }, [notifications])

  const refresh = useCallback(() => {
    setLoading(true)
    fetchNotifications()
  }, [fetchNotifications])

  // Initial load
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchNotifications()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification
  }
}
