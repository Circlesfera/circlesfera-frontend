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

