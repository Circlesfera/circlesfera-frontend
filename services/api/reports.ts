import { apiClient } from './client';

export type ReportTargetType = 'post' | 'comment' | 'user';
export type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'violence' | 'copyright' | 'false_information' | 'other';

export interface Report {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
  createdAt: string;
}

export interface CreateReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
}

export const createReport = async (payload: CreateReportPayload): Promise<{ report: Report }> => {
  const { data } = await apiClient.post<{ report: Report }>('/reports', payload);
  return data;
};

