import api from './axios';
import type { Conversation } from '@/types';

// Re-exportar para compatibilidad
export type { Conversation };

export interface ConversationsResponse {
  success: boolean;
  conversations: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ConversationResponse {
  success: boolean;
  conversation: Conversation;
}

// Obtener conversaciones del usuario
export const getConversations = async (page = 1, limit = 20): Promise<ConversationsResponse> => {

  try {
    const res = await api.get('/conversations', {
      params: { page, limit }
    });

    return res.data;
  } catch (error) {

    throw error;
  }
};

// Obtener una conversación específica
export const getConversation = async (conversationId: string): Promise<ConversationResponse> => {
  const res = await api.get(`/conversations/${conversationId}`);
  return res.data;
};

// Crear conversación directa
export const createDirectConversation = async (participantId: string): Promise<ConversationResponse> => {
  const res = await api.post('/conversations/direct', {
    participantId
  });
  return res.data;
};

// Crear conversación (directa o grupal)
export const createConversation = async (data: {
  participants: string[];
  type: 'direct' | 'group';
  name?: string;
  description?: string;
}): Promise<ConversationResponse> => {
  if (data.type === 'direct') {
    // Para conversación directa, usar el primer participante
    const participantId = data.participants[0];
    if (!participantId) {
      throw new Error('Se requiere al menos un participante para crear una conversación directa');
    }
    return createDirectConversation(participantId);
  } else {
    // Para conversación grupal
    return createGroupConversation(
      data.name || 'Nuevo grupo',
      data.participants,
      data.description
    );
  }
};

// Crear conversación grupal
export const createGroupConversation = async (name: string, participantIds: string[], description?: string): Promise<ConversationResponse> => {
  const res = await api.post('/conversations/group', {
    name,
    participantIds,
    description
  });
  return res.data;
};

// Agregar participante a conversación grupal
export const addParticipant = async (conversationId: string, participantId: string): Promise<ConversationResponse> => {
  const res = await api.post(`/conversations/${conversationId}/participants`, {
    participantId
  });
  return res.data;
};

// Remover participante de conversación grupal
export const removeParticipant = async (conversationId: string, participantId: string): Promise<ConversationResponse> => {
  const res = await api.delete(`/conversations/${conversationId}/participants`, {
    data: { participantId }
  });
  return res.data;
};

// Agregar administrador
export const addAdmin = async (conversationId: string, adminId: string): Promise<ConversationResponse> => {
  const res = await api.post(`/conversations/${conversationId}/admins`, {
    adminId
  });
  return res.data;
};

// Remover administrador
export const removeAdmin = async (conversationId: string, adminId: string): Promise<ConversationResponse> => {
  const res = await api.delete(`/conversations/${conversationId}/admins`, {
    data: { adminId }
  });
  return res.data;
};

// Actualizar configuración de conversación
export const updateConversation = async (conversationId: string, updates: {
  name?: string;
  description?: string;
  avatar?: string;
}): Promise<ConversationResponse> => {
  const res = await api.put(`/conversations/${conversationId}`, updates);
  return res.data;
};

// Archivar conversación
export const archiveConversation = async (conversationId: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.post(`/conversations/${conversationId}/archive`, {});
  return res.data;
};

// Desarchivar conversación
export const unarchiveConversation = async (conversationId: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.post(`/conversations/${conversationId}/unarchive`, {});
  return res.data;
};

// Eliminar conversación
export const deleteConversation = async (conversationId: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.delete(`/conversations/${conversationId}`);
  return res.data;
};

// Obtener estadísticas de conversaciones
export const getConversationStats = async (): Promise<{ success: boolean; stats: Record<string, unknown> }> => {
  const res = await api.get('/conversations/stats');
  return res.data;
};
