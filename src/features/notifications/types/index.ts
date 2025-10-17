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

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  likeNotifications: boolean
  commentNotifications: boolean
  followNotifications: boolean
  mentionNotifications: boolean
  systemNotifications: boolean
}

export interface NotificationFilters {
  type?: string
  isRead?: boolean
  dateRange?: {
    start: string
    end: string
  }
}

export interface NotificationSearchOptions {
  filters?: NotificationFilters
  page?: number
  limit?: number
}
