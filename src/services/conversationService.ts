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
export const getConversations = async (token: string, page = 1, limit = 20): Promise<ConversationsResponse> => {
  const res = await api.get('/conversations', {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, limit }
  });
  return res.data;
};

// Obtener una conversación específica
export const getConversation = async (conversationId: string, token: string): Promise<ConversationResponse> => {
  const res = await api.get(`/conversations/${conversationId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Crear conversación directa
export const createDirectConversation = async (participantId: string, token: string): Promise<ConversationResponse> => {
  const res = await api.post('/conversations/direct', {
    participantId
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Crear conversación grupal
export const createGroupConversation = async (name: string, participantIds: string[], description?: string, token: string): Promise<ConversationResponse> => {
  const res = await api.post('/conversations/group', {
    name,
    participantIds,
    description
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Agregar participante a conversación grupal
export const addParticipant = async (conversationId: string, participantId: string, token: string): Promise<ConversationResponse> => {
  const res = await api.post(`/conversations/${conversationId}/participants`, {
    participantId
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Remover participante de conversación grupal
export const removeParticipant = async (conversationId: string, participantId: string, token: string): Promise<ConversationResponse> => {
  const res = await api.delete(`/conversations/${conversationId}/participants`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { participantId }
  });
  return res.data;
};

// Agregar administrador
export const addAdmin = async (conversationId: string, adminId: string, token: string): Promise<ConversationResponse> => {
  const res = await api.post(`/conversations/${conversationId}/admins`, {
    adminId
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Remover administrador
export const removeAdmin = async (conversationId: string, adminId: string, token: string): Promise<ConversationResponse> => {
  const res = await api.delete(`/conversations/${conversationId}/admins`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { adminId }
  });
  return res.data;
};

// Actualizar configuración de conversación
export const updateConversation = async (conversationId: string, updates: {
  name?: string;
  description?: string;
  avatar?: string;
}, token: string): Promise<ConversationResponse> => {
  const res = await api.put(`/conversations/${conversationId}`, updates, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Archivar conversación
export const archiveConversation = async (conversationId: string, token: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.post(`/conversations/${conversationId}/archive`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Desarchivar conversación
export const unarchiveConversation = async (conversationId: string, token: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.post(`/conversations/${conversationId}/unarchive`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Eliminar conversación
export const deleteConversation = async (conversationId: string, token: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.delete(`/conversations/${conversationId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Obtener estadísticas de conversaciones
export const getConversationStats = async (token: string): Promise<{ success: boolean; stats: Record<string, unknown> }> => {
  const res = await api.get('/conversations/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}; 