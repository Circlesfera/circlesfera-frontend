import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/design-system/Button'
import { Input } from '@/design-system/Input'
import { Avatar } from '@/design-system/Avatar'

interface ChatMessage {
  id: string
  userId: string
  username: string
  avatar?: string
  message: string
  timestamp: Date
  isOwner?: boolean
}

interface LiveChatProps {
  streamId: string
  currentUser?: {
    id: string
    username: string
  }
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  isOwner?: boolean
}

export const LiveChat: React.FC<LiveChatProps> = ({
  streamId,
  currentUser,
  messages,
  onSendMessage,
  isOwner = false
}) => {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && currentUser) {
      onSendMessage(newMessage.trim())
      setNewMessage('')
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Chat en Vivo
        </h3>
        {isOwner && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Eres el anfitrión de esta transmisión
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>No hay mensajes aún</p>
            <p className="text-sm">¡Sé el primero en comentar!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              <Avatar
                src={message.avatar}
                alt={message.username}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {message.username}
                  </span>
                  {message.isOwner && (
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      Anfitrión
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                  {message.message}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {currentUser ? (
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1"
              maxLength={500}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!newMessage.trim()}
            >
              Enviar
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {newMessage.length}/500 caracteres
          </p>
        </form>
      ) : (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Inicia sesión para participar en el chat
          </p>
        </div>
      )}
    </div>
  )
}

export default LiveChat
