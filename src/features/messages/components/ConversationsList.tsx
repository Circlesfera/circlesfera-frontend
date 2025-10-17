import React, { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@/design-system/Avatar'
import { Input } from '@/design-system/Input'
import { Button } from '@/design-system/Button'
import {
  Search,
  MessageCircle,
  Plus,
  MoreVertical,
  Check,
  CheckCheck
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { getConversations } from '../services/messageService'
import logger from '@/utils/logger'

interface Conversation {
  id: string
  lastMessage?: {
    id: string
    content: string
    type: 'text' | 'image' | 'video' | 'audio'
    isRead: boolean
    createdAt: string
    senderId: string
  }
  unreadCount: number
  participant: {
    id: string
    username: string
    avatar?: string
    isOnline?: boolean
  }
  updatedAt: string
}

interface ConversationsListProps {
  onConversationSelect: (conversation: Conversation) => void
  onNewConversation?: () => void
  className?: string
}

const ConversationsList = memo(({
  onConversationSelect,
  onNewConversation,
  className = ''
}: ConversationsListProps) => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConversations = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await getConversations()
      setConversations(response.conversations)
      setError(null)
    } catch (err) {
      setError('Error cargando conversaciones')
      logger.error('Error fetching conversations', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Ahora'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  const filteredConversations = conversations.filter(conversation =>
    conversation.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  if (!user) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">
          Inicia sesión para ver tus conversaciones
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Mensajes
          </h2>
          {onNewConversation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewConversation}
              className="text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar conversaciones..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-500 text-sm mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchConversations}>
                Reintentar
              </Button>
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {searchQuery ? 'No se encontraron conversaciones' : 'No tienes conversaciones'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {searchQuery ? 'Intenta con otro término de búsqueda' : 'Inicia una nueva conversación'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                onClick={() => onConversationSelect(conversation)}
                className="p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar
                      src={conversation.participant.avatar}
                      alt={conversation.participant.username}
                      size="md"
                    />
                    {conversation.participant.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {conversation.participant.username}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {conversation.lastMessage ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${conversation.unreadCount > 0
                              ? 'text-gray-900 dark:text-gray-100 font-medium'
                              : 'text-gray-600 dark:text-gray-400'
                            }`}>
                            {conversation.lastMessage.type === 'text'
                              ? conversation.lastMessage.content
                              : conversation.lastMessage.type === 'image'
                                ? '📷 Imagen'
                                : conversation.lastMessage.type === 'video'
                                  ? '🎥 Video'
                                  : conversation.lastMessage.type === 'audio'
                                    ? '🎵 Audio'
                                    : 'Mensaje'
                            }
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {conversation.lastMessage.senderId === user.id ? (
                            conversation.lastMessage.isRead ? (
                              <CheckCheck className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Check className="w-4 h-4 text-gray-400" />
                            )
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sin mensajes
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
})

ConversationsList.displayName = 'ConversationsList'

export default ConversationsList
