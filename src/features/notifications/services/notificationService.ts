import api from '@/services/api'
import logger from '@/utils/logger'

export interface Notification {
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

export interface NotificationsResponse {
  notifications: Notification[]
  total: number
  unreadCount: number
  page: number
  limit: number
}

export const getNotifications = async (page = 1, limit = 20): Promise<NotificationsResponse> => {
  try {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    logger.error('Error fetching notifications', error)
    throw new Error('Error fetching notifications')
  }
}

export const markAsRead = async (notificationId: string): Promise<void> => {
  try {
    await api.put(`/notifications/${notificationId}/read`)
  } catch (error) {
    logger.error('Error marking notification as read', error)
    throw new Error('Error marking notification as read')
  }
}

export const markAllAsRead = async (): Promise<void> => {
  try {
    await api.put('/notifications/read-all')
  } catch (error) {
    logger.error('Error marking all notifications as read', error)
    throw new Error('Error marking all notifications as read')
  }
}

export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    await api.delete(`/notifications/${notificationId}`)
  } catch (error) {
    logger.error('Error deleting notification', error)
    throw new Error('Error deleting notification')
  }
}

export const getUnreadCount = async (): Promise<{ count: number }> => {
  try {
    const response = await api.get('/notifications/unread-count')
    return response.data
  } catch (error) {
    logger.error('Error fetching unread count', error)
    throw new Error('Error fetching unread count')
  }
}

export const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
}
