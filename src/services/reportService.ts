import api from './axios';
import type {
  Report,
  ReportReason,
  ReportContentType,
  ReportStatus,
  ReportAction
} from '@/types';

// Re-exportar tipos para uso externo
export type { Report, ReportReason, ReportContentType, ReportStatus, ReportAction };

export interface CreateReportData {
  contentType: ReportContentType;
  contentId: string;
  reason: ReportReason;
  description?: string;
}

export interface ReportResponse {
  success: boolean;
  message?: string;
  data?: Report;
  report?: Report;
}

export interface ReportsListResponse {
  success: boolean;
  data?: Report[];
  reports?: Report[];
  pagination?: {
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
export const getReportById = async (reportId: string): Promise<ReportResponse> => {
  const response = await api.get(`/reports/${reportId}`);
  return response.data;
};

// Actualizar estado de reporte (admin/moderador)
export const updateReportStatus = async (
  reportId: string,
  data: {
    status: ReportStatus;
    action?: string | undefined;
    moderatorNotes?: string | undefined;
  }
): Promise<ReportResponse> => {
  const response = await api.put(`/reports/${reportId}/status`, data);
  return response.data;
};

// Obtener estadísticas de reportes (admin)
export const getReportStats = async (): Promise<{
  success: boolean;
  data?: {
    total: number;
    byStatus?: Record<string, number>;
    byReason?: Record<string, number>;
    byContentType?: Record<string, number>;
    averageResolutionTime?: string;
  };
  stats?: {
    total: number;
    byStatus?: Record<string, number>;
    byReason?: Array<{ id: string; count: number }>;
    byContentType?: Array<{ id: string; count: number }>;
    averageResolutionTime?: string;
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

