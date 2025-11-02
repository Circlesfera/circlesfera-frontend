import { apiClient } from './client';

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl: string;
  };
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
}

export interface MessagesResponse {
  messages: Message[];
  nextCursor: string | null;
}

export interface CreateConversationPayload {
  userId: string;
}

export interface SendMessagePayload {
  content: string;
}

export const getConversations = async (): Promise<ConversationsResponse> => {
  const { data } = await apiClient.get<ConversationsResponse>('/messages/conversations');
  return data;
};

export const createConversation = async (payload: CreateConversationPayload): Promise<{ id: string }> => {
  const { data } = await apiClient.post<{ id: string }>('/messages/conversations', payload);
  return data;
};

export const getMessages = async (conversationId: string, limit = 50, cursor?: string): Promise<MessagesResponse> => {
  const params: Record<string, string | number> = { limit };
  if (cursor) {
    params.cursor = cursor;
  }
  const { data } = await apiClient.get<MessagesResponse>(`/messages/conversations/${conversationId}/messages`, {
    params
  });
  return data;
};

export const sendMessage = async (conversationId: string, payload: SendMessagePayload): Promise<{ message: Message }> => {
  const { data } = await apiClient.post<{ message: Message }>(`/messages/conversations/${conversationId}/messages`, payload);
  return data;
};

