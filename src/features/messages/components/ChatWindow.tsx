import React, { useState, useEffect, useRef, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/design-system/Button'
import { Input } from '@/design-system/Input'
import { Avatar } from '@/design-system/Avatar'
import {
  Send,
  Image,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  Paperclip
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { sendMessage, getMessages } from '../services/messageService'
import logger from '@/utils/logger'

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  type: 'text' | 'image' | 'video' | 'audio'
  mediaUrl?: string
  isRead: boolean
  createdAt: string
  sender?: {
    id: string
    username: string
    avatar?: string
  }
}

interface ChatWindowProps {
  conversationId: string
  recipient: {
    id: string
    username: string
    avatar?: string
    isOnline?: boolean
  }
  onClose?: () => void
  className?: string
}

const ChatWindow = memo(({
  conversationId,
  recipient,
  onClose,
  className = ''
}: ChatWindowProps) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getMessages(conversationId)
      setMessages(response.messages)
      setError(null)
    } catch (err) {
      setError('Error cargando mensajes')
      logger.error('Error fetching messages', err)
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || sending) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    setSending(true)

    try {
      const newMsg = await sendMessage(conversationId, {
        content: messageContent,
        type: 'text'
      })

      setMessages(prev => [...prev, newMsg])
      scrollToBottom()
    } catch (err) {
      logger.error('Error sending message', err)
      setNewMessage(messageContent) // Restore message on error
    } finally {
      setSending(false)
    }
  }, [newMessage, user, sending, conversationId, scrollToBottom])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer'
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      })
    }
  }

  // Initial load
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  if (!user) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">
          Inicia sesión para usar el chat
        </p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar
              src={recipient.avatar}
              alt={recipient.username}
              size="md"
            />
            {recipient.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {recipient.username}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {recipient.isOnline ? 'En línea' : 'Desconectado'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <Info className="w-5 h-5" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <MoreVertical className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <p className="text-red-500 text-sm mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchMessages}>
                Reintentar
              </Button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No hay mensajes aún
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Envía el primer mensaje para empezar la conversación
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => {
              const isOwn = message.senderId === user.id
              const showDate = index === 0 ||
                formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt)

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-3 py-1 rounded-full">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                      {!isOwn && (
                        <Avatar
                          src={message.sender?.avatar}
                          alt={message.sender?.username || 'Usuario'}
                          size="sm"
                        />
                      )}
                      <div className={`rounded-lg px-3 py-2 ${isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
            <div ref={messagesEndRef} />
          </AnimatePresence>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" type="button">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" type="button">
            <Image className="w-5 h-5" />
          </Button>
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1"
            disabled={sending}
          />
          <Button variant="ghost" size="sm" type="button">
            <Smile className="w-5 h-5" />
          </Button>
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            size="sm"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  )
})

ChatWindow.displayName = 'ChatWindow'

export default ChatWindow
