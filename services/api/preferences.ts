import { apiClient } from './client';

export interface UserPreferences {
  id: string;
  userId: string;
  isPrivate: boolean;
  showActivityStatus: boolean;
  whoCanComment: 'everyone' | 'followers' | 'nobody';
  whoCanMention: 'everyone' | 'followers' | 'nobody';
  notificationsLikes: boolean;
  notificationsComments: boolean;
  notificationsFollows: boolean;
  notificationsMentions: boolean;
  notificationsReplies: boolean;
  notificationsTags: boolean;
  notificationsShares: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePreferencesPayload {
  isPrivate?: boolean;
  showActivityStatus?: boolean;
  whoCanComment?: 'everyone' | 'followers' | 'nobody';
  whoCanMention?: 'everyone' | 'followers' | 'nobody';
  notificationsLikes?: boolean;
  notificationsComments?: boolean;
  notificationsFollows?: boolean;
  notificationsMentions?: boolean;
  notificationsReplies?: boolean;
  notificationsTags?: boolean;
  notificationsShares?: boolean;
  theme?: 'light' | 'dark' | 'system';
  language?: 'es' | 'en';
}

export const getPreferences = async (): Promise<{ preferences: UserPreferences }> => {
  const { data } = await apiClient.get<{ preferences: UserPreferences }>('/users/me/preferences');
  return data;
};

export const updatePreferences = async (
  payload: UpdatePreferencesPayload
): Promise<{ preferences: UserPreferences }> => {
  const { data } = await apiClient.patch<{ preferences: UserPreferences }>('/users/me/preferences', payload);
  return data;
};

