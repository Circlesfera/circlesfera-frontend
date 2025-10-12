import api from './axios';

export type ReportContentType =
  | 'post'
  | 'reel'
  | 'story'
  | 'comment'
  | 'user'
  | 'live_stream'
  | 'message';

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'violence'
  | 'nudity'
  | 'false_information'
  | 'copyright'
  | 'suicide_or_self_harm'
  | 'scam'
  | 'terrorism'
  | 'other';

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export type ReportAction = 'none' | 'warning' | 'content_removed' | 'user_banned' | 'user_suspended';

export interface CreateReportData {
  contentType: ReportContentType;
  contentId: string;
  reason: ReportReason;
  description?: string;
}

export interface Report {
  _id: string;
  reportedBy: {
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  contentType: ReportContentType;
  contentId: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  action: ReportAction;
  reviewedBy?: {
    _id: string;
    username: string;
    avatar?: string;
  };
  reviewedAt?: string;
  moderatorNotes?: string;
  reportedContent?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface ReportResponse {
  success: boolean;
  message: string;
  report: Report;
}

export interface ReportsListResponse {
  success: boolean;
  reports: Report[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Crear un reporte
export const createReport = async (data: CreateReportData): Promise<ReportResponse> => {
  const response = await api.post('/reports', data);
  return response.data;
};

// Obtener reportes (admin/moderador)
export const getReports = async (params?: {
  status?: ReportStatus;
  contentType?: ReportContentType;
  reason?: ReportReason;
  page?: number;
  limit?: number;
}): Promise<ReportsListResponse> => {
  const response = await api.get('/reports', { params });
  return response.data;
};

// Obtener un reporte específico (admin/moderador)
export const getReportById = async (reportId: string): Promise<{ success: boolean; report: Report }> => {
  const response = await api.get(`/reports/${reportId}`);
  return response.data;
};

// Actualizar estado de reporte (admin/moderador)
export const updateReportStatus = async (
  reportId: string,
  data: {
    status: ReportStatus;
    action?: ReportAction;
    moderatorNotes?: string;
  }
): Promise<{ success: boolean; message: string; report: Report }> => {
  const response = await api.put(`/reports/${reportId}/status`, data);
  return response.data;
};

// Obtener estadísticas de reportes (admin)
export const getReportStats = async (): Promise<{
  success: boolean;
  stats: {
    byStatus: Record<ReportStatus, number>;
    byReason: Array<{ _id: ReportReason; count: number }>;
    byContentType: Array<{ _id: ReportContentType; count: number }>;
  };
}> => {
  const response = await api.get('/reports/stats');
  return response.data;
};

// Utilidad para obtener el label de la razón de reporte
export const getReportReasonLabel = (reason: ReportReason): string => {
  const labels: Record<ReportReason, string> = {
    spam: 'Spam',
    harassment: 'Acoso o intimidación',
    hate_speech: 'Discurso de odio',
    violence: 'Violencia o contenido peligroso',
    nudity: 'Desnudez o contenido sexual',
    false_information: 'Información falsa',
    copyright: 'Infracción de derechos de autor',
    suicide_or_self_harm: 'Suicidio o autolesión',
    scam: 'Estafa o fraude',
    terrorism: 'Terrorismo',
    other: 'Otro'
  };
  return labels[reason] || reason;
};

// Utilidad para obtener el label del tipo de contenido
export const getContentTypeLabel = (contentType: ReportContentType): string => {
  const labels: Record<ReportContentType, string> = {
    post: 'Publicación',
    reel: 'Reel',
    story: 'Historia',
    comment: 'Comentario',
    user: 'Usuario',
    live_stream: 'Transmisión en vivo',
    message: 'Mensaje'
  };
  return labels[contentType] || contentType;
};

