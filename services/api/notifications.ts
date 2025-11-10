import { apiClient } from './client';

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'reply' | 'tagged' | 'share';
export type NotificationTargetModel = 'Post' | 'Frame';

export interface NotificationActor {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  actor: NotificationActor | null;
  targetModel?: NotificationTargetModel;
  targetId?: string;
  postId?: string;
  commentId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationCursorResponse {
  data: Notification[];
  nextCursor: string | null;
  unreadCount: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface MarkAsReadResponse {
  message: string;
  unreadCount: number;
}

export const fetchNotifications = async (cursor?: string | null, limit = 20, unreadOnly = false): Promise<NotificationCursorResponse> => {
  const { data } = await apiClient.get<NotificationCursorResponse>('/notifications', {
    params: { cursor: cursor ?? undefined, limit, unreadOnly: unreadOnly || undefined }
  });
  return data;
};

export const markNotificationAsRead = async (notificationId: string): Promise<MarkAsReadResponse> => {
  const { data } = await apiClient.patch<MarkAsReadResponse>(`/notifications/${notificationId}/read`);
  return data;
};

export const markAllAsRead = async (): Promise<{ message: string; unreadCount: number }> => {
  const { data } = await apiClient.post<{ message: string; unreadCount: number }>('/notifications/mark-all-read');
  return data;
};

export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const { data } = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
  return data;
};

