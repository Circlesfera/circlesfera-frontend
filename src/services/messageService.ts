import api from './axios';

export interface Message {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'contact';
  content: {
    text?: string;
    image?: {
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    };
    video?: {
      url: string;
      duration: number;
      thumbnail: string;
      width?: number;
      height?: number;
    };
    audio?: {
      url: string;
      duration: number;
    };
    file?: {
      url: string;
      name: string;
      size: number;
      type: string;
    };
    location?: {
      coordinates: number[];
      name: string;
      address?: string;
    };
    contact?: {
      name: string;
      phone: string;
      email?: string;
    };
  };
  status: 'sent' | 'delivered' | 'read';
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  isForwarded: boolean;
  originalMessage?: string;
  replyTo?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface MessagesResponse {
  success: boolean;
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface MessageResponse {
  success: boolean;
  message: Message;
  errorMessage?: string;
}

// Obtener mensajes de una conversación
export const getMessages = async (conversationId: string, token: string, page = 1, limit = 50): Promise<MessagesResponse> => {
  const res = await api.get(`/api/messages/conversation/${conversationId}`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, limit }
  });
  return res.data;
};

// Enviar mensaje de texto
export const sendTextMessage = async (conversationId: string, content: string, token: string, replyTo?: string): Promise<MessageResponse> => {
  const res = await api.post(`/api/messages/conversation/${conversationId}/text`, {
    content,
    replyTo
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Enviar mensaje de imagen
export const sendImageMessage = async (conversationId: string, file: File, token: string, caption?: string): Promise<MessageResponse> => {
  const formData = new FormData();
  formData.append('image', file);
  if (caption) formData.append('caption', caption);
  
  const res = await api.post(`/api/messages/conversation/${conversationId}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Enviar mensaje de video
export const sendVideoMessage = async (conversationId: string, file: File, token: string, caption?: string): Promise<MessageResponse> => {
  const formData = new FormData();
  formData.append('video', file);
  if (caption) formData.append('caption', caption);
  
  const res = await api.post(`/api/messages/conversation/${conversationId}/video`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Enviar mensaje de ubicación
export const sendLocationMessage = async (conversationId: string, latitude: number, longitude: number, token: string, name?: string, address?: string): Promise<MessageResponse> => {
  const res = await api.post(`/api/messages/conversation/${conversationId}/location`, {
    latitude,
    longitude,
    name,
    address
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Editar mensaje
export const editMessage = async (messageId: string, content: string, token: string): Promise<MessageResponse> => {
  const res = await api.put(`/api/messages/${messageId}`, {
    content
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Eliminar mensaje
export const deleteMessage = async (messageId: string, token: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.delete(`/api/messages/${messageId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Reenviar mensaje
export const forwardMessage = async (messageId: string, conversationIds: string[], token: string): Promise<{ success: boolean; messages: Message[] }> => {
  const res = await api.post(`/api/messages/${messageId}/forward`, {
    conversationIds
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Buscar mensajes
export const searchMessages = async (conversationId: string, query: string, token: string, page = 1, limit = 20): Promise<MessagesResponse> => {
  const res = await api.get(`/api/messages/conversation/${conversationId}/search`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { query, page, limit }
  });
  return res.data;
};

// Obtener estadísticas de mensajes
export const getMessageStats = async (conversationId: string, token: string): Promise<{ success: boolean; stats: Record<string, unknown> }> => {
  const res = await api.get(`/api/messages/conversation/${conversationId}/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
