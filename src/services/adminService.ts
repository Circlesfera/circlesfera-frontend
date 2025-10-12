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

/**
 * Obtener actividad reciente del sistema
 * TODO: Implementar endpoint en backend cuando sea necesario
 */
export const getRecentActivity = async (): Promise<{
  success: boolean;
  data: Array<{
    type: string;
    message: string;
    timestamp: string;
    user?: string;
    relatedId?: string;
  }>;
}> => {
  // Por ahora retorna actividad vacía, pero el endpoint puede implementarse en el backend
  return {
    success: true,
    data: []
  };
};

