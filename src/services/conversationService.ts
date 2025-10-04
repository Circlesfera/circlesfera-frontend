import api from './axios';

export interface Conversation {
  _id: string;
  type: 'direct' | 'group';
  name?: string;
  description?: string;
  avatar?: string;
  participants: Array<{
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  }>;
  admins?: Array<{
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  }>;
  lastMessage?: {
    _id: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'contact';
    content: {
      text?: string;
      image?: {
        url: string;
        alt?: string;
      };
      video?: {
        url: string;
        thumbnail: string;
      };
      location?: {
        name: string;
        address?: string;
      };
    };
    sender: {
      _id: string;
      username: string;
      avatar?: string;
      fullName?: string;
    };
    createdAt: string;
  };
  unreadCount: number;
  settings?: {
    isActive: boolean;
    isArchived: boolean;
    isDeleted: boolean;
    userSettings?: {
      mute: boolean;
      pin: boolean;
      lastRead: string;
      unreadCount: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

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
  console.log('🔍 conversationService - getConversations llamada:', { page, limit });
  console.log('🔍 conversationService - baseURL:', api.defaults.baseURL);
  console.log('🔍 conversationService - URL completa será:', `${api.defaults.baseURL}/api/conversations`);
  
  try {
    const res = await api.get('/api/conversations', {
      params: { page, limit }
    });
    console.log('✅ conversationService - getConversations respuesta:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ conversationService - getConversations error:', error);
    throw error;
  }
};

// Obtener una conversación específica
export const getConversation = async (conversationId: string): Promise<ConversationResponse> => {
  const res = await api.get(`/api/conversations/${conversationId}`);
  return res.data;
};

// Crear conversación directa
export const createDirectConversation = async (participantId: string): Promise<ConversationResponse> => {
  const res = await api.post('/api/conversations/direct', {
    participantId
  });
  return res.data;
};

// Crear conversación grupal
export const createGroupConversation = async (name: string, participantIds: string[], description?: string): Promise<ConversationResponse> => {
  const res = await api.post('/api/conversations/group', {
    name,
    participantIds,
    description
  });
  return res.data;
};

// Agregar participante a conversación grupal
export const addParticipant = async (conversationId: string, participantId: string): Promise<ConversationResponse> => {
  const res = await api.post(`/api/conversations/${conversationId}/participants`, {
    participantId
  });
  return res.data;
};

// Remover participante de conversación grupal
export const removeParticipant = async (conversationId: string, participantId: string): Promise<ConversationResponse> => {
  const res = await api.delete(`/api/conversations/${conversationId}/participants`, {
    data: { participantId }
  });
  return res.data;
};

// Agregar administrador
export const addAdmin = async (conversationId: string, adminId: string): Promise<ConversationResponse> => {
  const res = await api.post(`/api/conversations/${conversationId}/admins`, {
    adminId
  });
  return res.data;
};

// Remover administrador
export const removeAdmin = async (conversationId: string, adminId: string): Promise<ConversationResponse> => {
  const res = await api.delete(`/api/conversations/${conversationId}/admins`, {
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
  const res = await api.put(`/api/conversations/${conversationId}`, updates);
  return res.data;
};

// Archivar conversación
export const archiveConversation = async (conversationId: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.post(`/api/conversations/${conversationId}/archive`, {});
  return res.data;
};

// Desarchivar conversación
export const unarchiveConversation = async (conversationId: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.post(`/api/conversations/${conversationId}/unarchive`, {});
  return res.data;
};

// Eliminar conversación
export const deleteConversation = async (conversationId: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.delete(`/api/conversations/${conversationId}`);
  return res.data;
};

// Obtener estadísticas de conversaciones
export const getConversationStats = async (): Promise<{ success: boolean; stats: Record<string, unknown> }> => {
  const res = await api.get('/api/conversations/stats');
  return res.data;
}; 