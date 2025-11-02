import { apiClient } from './client';

export interface VerificationRequest {
  id: string;
  userId: string;
  userHandle: string;
  userDisplayName: string;
  status: 'pending' | 'approved' | 'rejected';
  justification?: string;
  documentsUrl?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface CreateVerificationRequestPayload {
  justification?: string;
  documentsUrl?: string;
}

export interface CreateVerificationRequestResponse {
  request: VerificationRequest;
}

export interface VerificationRequestResponse {
  request: VerificationRequest;
}

export interface PendingVerificationRequestsResponse {
  requests: VerificationRequest[];
}

export interface ReviewVerificationPayload {
  status: 'approved' | 'rejected';
  reviewNotes?: string;
}

/**
 * Crea una solicitud de verificación de cuenta.
 */
export const createVerificationRequest = async (payload: CreateVerificationRequestPayload): Promise<CreateVerificationRequestResponse> => {
  const { data } = await apiClient.post<CreateVerificationRequestResponse>('/verification/request', payload);
  return data;
};

/**
 * Obtiene la solicitud de verificación del usuario autenticado.
 */
export const getMyVerificationRequest = async (): Promise<VerificationRequestResponse> => {
  const { data } = await apiClient.get<VerificationRequestResponse>('/verification/request');
  return data;
};

/**
 * Obtiene solicitudes pendientes de verificación (solo admins).
 */
export const getPendingVerificationRequests = async (options: { limit?: number; cursor?: string } = {}): Promise<PendingVerificationRequestsResponse> => {
  const { data } = await apiClient.get<PendingVerificationRequestsResponse>('/verification/pending', {
    params: {
      limit: options.limit ?? 50,
      cursor: options.cursor
    }
  });
  return data;
};

/**
 * Revisa una solicitud de verificación (solo admins).
 */
export const reviewVerificationRequest = async (
  requestId: string,
  payload: ReviewVerificationPayload
): Promise<VerificationRequestResponse> => {
  const { data } = await apiClient.post<VerificationRequestResponse>(`/verification/${requestId}/review`, payload);
  return data;
};

