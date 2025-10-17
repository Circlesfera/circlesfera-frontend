import api from './axios';


export interface DashboardStats {
  users: {
    total: number;
    active: number;
    new24h: number;
    activePercentage: number;
  };
  content: {
    posts: number;
    reels: number;
    stories: number;
    posts24h: number;
    reels24h: number;
  };
  reports: {
    total: number;
    pending: number;
    resolved: number;
    rejected: number;
    underReview: number;
    trend: number;
  };
  activity: {
    liveStreams: number;
    totalMessages: number;
  };
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
}

/**
 * Obtener estadísticas generales del sistema para dashboard admin
 * Solo admin/moderators
 */
export const getDashboardStats = async (): Promise<DashboardResponse> => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};

export interface Activity {
  type: string;
  message: string;
  timestamp: string;
  user?: string;
  relatedId?: string;
  status?: string;
  severity?: 'info' | 'low' | 'medium' | 'high';
}

export interface RecentActivityResponse {
  success: boolean;
  data: Activity[];
  total: number;
}

/**
 * Obtener actividad reciente del sistema
 * Conectado con endpoint real: GET /analytics/recent-activity
 */
export const getRecentActivity = async (limit = 20): Promise<RecentActivityResponse> => {
  const response = await api.get('/analytics/recent-activity', {
    params: { limit }
  });
  return response.data;
};

export interface EngagementMetrics {
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  totalShares: number;
  currentPeriod: {
    likes: number;
    comments: number;
    views: number;
    shares: number;
  };
  changes: {
    likes: number;
    comments: number;
    views: number;
    shares: number;
  };
  engagementRate: number;
  timeRange: string;
}

export interface EngagementResponse {
  success: boolean;
  data: EngagementMetrics;
}

/**
 * Obtener métricas de engagement reales
 */
export const getEngagementMetrics = async (timeRange = '24h'): Promise<EngagementResponse> => {
  const response = await api.get('/analytics/engagement', {
    params: { timeRange }
  });
  return response.data;
};

export interface RealtimeActivityData {
  hour: number;
  activeUsers: number;
  posts: number;
  reels: number;
  timestamp: string;
}

export interface RealtimeActivityResponse {
  success: boolean;
  data: {
    activityData: RealtimeActivityData[];
    timeRange: string;
    totalActiveUsers: number;
  };
}

/**
 * Obtener actividad en tiempo real
 */
export const getRealtimeActivity = async (hours = 24): Promise<RealtimeActivityResponse> => {
  const response = await api.get('/analytics/realtime-activity-debug', {
    params: { hours }
  });
  return response.data;
};

