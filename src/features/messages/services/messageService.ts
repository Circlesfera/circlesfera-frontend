import api from '@/services/axios'
import logger from '@/utils/logger'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'video' | 'audio'
  timestamp: string
  isRead: boolean
  replyTo?: {
    messageId: string
    content: string
    senderUsername: string
  }
}

export interface Conversation {
  id: string
  participants: Array<{
    id: string
    username: string
    fullName?: string
    avatar?: string
  }>
  lastMessage?: Message
  unreadCount: number
  updatedAt: string
}

export interface CreateMessageData {
  content: string
  type?: 'text' | 'image' | 'video' | 'audio'
  replyTo?: string
}

export interface MessagesResponse {
  messages: Message[]
  total: number
  page: number
  limit: number
}

export interface ConversationsResponse {
  conversations: Conversation[]
  total: number
  page: number
  limit: number
}

// Get conversations
export const getConversations = async (page = 1, limit = 20): Promise<ConversationsResponse> => {
  try {
    const response = await api.get(`/conversations?page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    logger.error('Error fetching conversations:', error)
    throw new Error('Error fetching conversations')
  }
}

// Get conversation by ID
export const getConversation = async (conversationId: string): Promise<Conversation> => {
  try {
    const response = await api.get(`/conversations/${conversationId}`)
    return response.data.conversation
  } catch (error) {
    logger.error('Error fetching conversation:', error)
    throw new Error('Error fetching conversation')
  }
}

// Create new conversation
export const createConversation = async (participantIds: string[]): Promise<Conversation> => {
  try {
    const response = await api.post('/conversations', { participantIds })
    return response.data.conversation
  } catch (error) {
    logger.error('Error creating conversation:', error)
    throw new Error('Error creating conversation')
  }
}

// Delete conversation
export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    await api.delete(`/conversations/${conversationId}`)
  } catch (error) {
    logger.error('Error deleting conversation:', error)
    throw new Error('Error deleting conversation')
  }
}

// Get messages for a conversation
export const getMessages = async (
  conversationId: string,
  page = 1,
  limit = 50
): Promise<MessagesResponse> => {
  try {
    const response = await api.get(
      `/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    )
    return response.data
  } catch (error) {
    logger.error('Error fetching messages:', error)
    throw new Error('Error fetching messages')
  }
}

// Send message
export const sendMessage = async (
  conversationId: string,
  messageData: CreateMessageData
): Promise<Message> => {
  try {
    const response = await api.post(`/conversations/${conversationId}/messages`, messageData)
    return response.data.message
  } catch (error) {
    logger.error('Error sending message:', error)
    throw new Error('Error sending message')
  }
}

// Delete message
export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    await api.delete(`/messages/${messageId}`)
  } catch (error) {
    logger.error('Error deleting message:', error)
    throw new Error('Error deleting message')
  }
}

// Mark message as read
export const markMessageAsRead = async (messageId: string): Promise<void> => {
  try {
    await api.put(`/messages/${messageId}/read`)
  } catch (error) {
    logger.error('Error marking message as read:', error)
    throw new Error('Error marking message as read')
  }
}

// Mark conversation as read
export const markConversationAsRead = async (conversationId: string): Promise<void> => {
  try {
    await api.put(`/conversations/${conversationId}/read`)
  } catch (error) {
    logger.error('Error marking conversation as read:', error)
    throw new Error('Error marking conversation as read')
  }
}

// Upload file for message
export const uploadMessageFile = async (file: File): Promise<{ url: string }> => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/messages/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  } catch (error) {
    logger.error('Error uploading message file:', error)
    throw new Error('Error uploading message file')
  }
}

export const messageService = {
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
  getMessages,
  sendMessage,
  deleteMessage,
  markMessageAsRead,
  markConversationAsRead,
  uploadMessageFile
}

export default messageService
