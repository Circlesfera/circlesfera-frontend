import { apiClient } from './client';

export interface PostMetrics {
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  views: number;
  engagementRate: number;
  reach: number;
}

export interface PostAnalytics {
  postId: string;
  createdAt: string;
  caption: string;
  mediaCount: number;
  metrics: PostMetrics;
}

export interface ProfileOverview {
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
  totalLikes: number;
  totalComments: number;
  totalSaves: number;
  totalShares: number;
  totalViews: number;
  averageEngagementRate: number;
  averageViewsPerPost: number;
}

export interface ProfileGrowth {
  followersGrowth: number;
  postsGrowth: number;
  engagementTrend: 'up' | 'down' | 'stable';
}

export interface EngagementByType {
  likes: number;
  comments: number;
  saves: number;
  shares: number;
}

export interface ProfileAnalytics {
  overview: ProfileOverview;
  recentPosts: PostAnalytics[];
  topPosts: PostAnalytics[];
  growth: ProfileGrowth;
  engagementByType: EngagementByType;
}

export interface ProfileAnalyticsResponse {
  analytics: ProfileAnalytics;
}

export interface PostAnalyticsResponse {
  analytics: PostAnalytics;
}

/**
 * Obtiene analytics del perfil del usuario autenticado.
 */
export const getProfileAnalytics = async (limit = 10): Promise<ProfileAnalyticsResponse> => {
  const { data } = await apiClient.get<ProfileAnalyticsResponse>('/analytics/profile', {
    params: { limit }
  });
  return data;
};

/**
 * Obtiene analytics de un post específico.
 */
export const getPostAnalytics = async (postId: string): Promise<PostAnalyticsResponse> => {
  const { data } = await apiClient.get<PostAnalyticsResponse>(`/analytics/posts/${postId}`);
  return data;
};

