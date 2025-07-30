import api from './axios';

export interface Conversation {
  _id: string;
  participants: {
    _id: string;
    username: string;
    avatar?: string;
  }[];
  lastMessage?: Message;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    username: string;
    avatar?: string;
  };
  text: string;
  createdAt: string;
  read: boolean;
}

export const getConversations = async (token: string): Promise<Conversation[]> => {
  const res = await api.get('/conversations', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getMessages = async (conversationId: string, token: string): Promise<Message[]> => {
  const res = await api.get(`/messages/${conversationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const sendMessage = async (conversationId: string, text: string, token: string): Promise<Message> => {
  const res = await api.post('/messages', { conversationId, text }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};
