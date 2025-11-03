import { apiClient } from './client';

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  otherUser?: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl: string;
  };
  groupName?: string;
  participants?: Array<{
    id: string;
    handle: string;
    displayName: string;
    avatarUrl: string;
  }>;
  createdBy?: string;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  createdAt: string;
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

export interface CreateGroupPayload {
  participantIds: string[];
  groupName: string;
}

export interface AddParticipantPayload {
  userId: string;
}

export interface UpdateGroupNamePayload {
  groupName: string;
}

export const createGroup = async (payload: CreateGroupPayload): Promise<{ id: string }> => {
  const { data } = await apiClient.post<{ id: string }>('/messages/conversations/group', payload);
  return data;
};

export const addParticipant = async (conversationId: string, payload: AddParticipantPayload): Promise<{ success: boolean }> => {
  const { data } = await apiClient.post<{ success: boolean }>(`/messages/conversations/${conversationId}/members`, payload);
  return data;
};

export const removeParticipant = async (conversationId: string, userId: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.delete<{ success: boolean }>(`/messages/conversations/${conversationId}/members/${userId}`);
  return data;
};

export const updateGroupName = async (conversationId: string, payload: UpdateGroupNamePayload): Promise<{ success: boolean }> => {
  const { data } = await apiClient.patch<{ success: boolean }>(`/messages/conversations/${conversationId}/name`, payload);
  return data;
};

