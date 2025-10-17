/**
 * Conversation Service - Frontend
 * Servicio para manejar operaciones de conversaciones
 */

import api from '@/services/api'
import type { Conversation, Message } from '@/types'

interface CreateConversationData {
  participants: string[]
  type: 'direct' | 'group'
  name?: string
}

export type { Conversation, Message, CreateConversationData }

export interface ConversationResponse {
  success: boolean
  data: Conversation[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface MessagesResponse {
  success: boolean
  data: Message[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export class ConversationService {
  private readonly baseUrl = '/api/conversations'

  /**
   * Obtener conversaciones del usuario
   */
  async getConversations(): Promise<ConversationResponse> {
    try {
      const response = await api.get(`${this.baseUrl}`)
      return response.data
    } catch (error) {
      console.error('Error fetching conversations:', error)
      throw error
    }
  }

  /**
   * Obtener mensajes de una conversación
   */
  async getMessages(conversationId: string, page = 1, limit = 50): Promise<MessagesResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/${conversationId}/messages`, {
        params: { page, limit }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching messages:', error)
      throw error
    }
  }

  /**
   * Crear nueva conversación
   */
  async createConversation(data: CreateConversationData): Promise<{ success: boolean; data: Conversation }> {
    try {
      const response = await api.post(`${this.baseUrl}`, data)
      return response.data
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  }

  /**
   * Enviar mensaje
   */
  async sendMessage(conversationId: string, content: string, type: 'text' | 'image' | 'video' = 'text'): Promise<{ success: boolean; data: Message }> {
    try {
      const response = await api.post(`${this.baseUrl}/${conversationId}/messages`, {
        content,
        type
      })
      return response.data
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  /**
   * Marcar conversación como leída
   */
  async markAsRead(conversationId: string): Promise<{ success: boolean }> {
    try {
      const response = await api.put(`${this.baseUrl}/${conversationId}/read`)
      return response.data
    } catch (error) {
      console.error('Error marking conversation as read:', error)
      throw error
    }
  }

  /**
   * Eliminar conversación
   */
  async deleteConversation(conversationId: string): Promise<{ success: boolean }> {
    try {
      const response = await api.delete(`${this.baseUrl}/${conversationId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting conversation:', error)
      throw error
    }
  }
}

// Instancia singleton del servicio
export const conversationService = new ConversationService()

// Exportar función específica para compatibilidad
export const getConversations = () => conversationService.getConversations()
