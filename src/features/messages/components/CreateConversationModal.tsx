'use client'

import React, { useState, useEffect } from 'react'
import { X, Search, User } from 'lucide-react'
import { Button } from '@/design-system/Button'
import { Input } from '@/design-system/Input'
import { Avatar } from '@/design-system/Avatar'
import { Dialog } from '@/design-system/Dialog'
import { userService, UserSuggestion } from '@/services/userService'

interface Conversation {
  id: string
  participants: Array<{
    id: string
    username: string
    fullName?: string
    avatar?: string
  }>
  lastMessage?: {
    content: string
    timestamp: string
  }
  unreadCount: number
}

interface CreateConversationModalProps {
  isOpen: boolean
  onClose: () => void
  onConversationCreated: (conversation: Conversation) => void
}

export function CreateConversationModal({
  isOpen,
  onClose,
  onConversationCreated
}: CreateConversationModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserSuggestion[]>([])
  const [selectedUsers, setSelectedUsers] = useState<UserSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const searchUsers = async () => {
      setIsLoading(true)
      try {
        const response = await userService.searchUsers(searchQuery)
        setSearchResults(response.users.map(user => ({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
          isFollowing: user.isFollowing,
          mutualFollowers: 0
        })))
      } catch (error) {
        console.error('Error searching users:', error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleUserSelect = (user: UserSuggestion) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user])
    }
    setSearchQuery('')
    setSearchResults([])
  }

  const handleUserRemove = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId))
  }

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) return

    try {
      // TODO: Implement createConversation API call
      const newConversation: Conversation = {
        id: `conv_${Date.now()}`,
        participants: selectedUsers.map(user => ({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar
        })),
        unreadCount: 0
      }

      onConversationCreated(newConversation)
      onClose()
      setSelectedUsers([])
      setSearchQuery('')
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  const handleClose = () => {
    setSelectedUsers([])
    setSearchQuery('')
    setSearchResults([])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Nueva Conversación
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Usuarios seleccionados:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      <Avatar
                        src={user.avatar}
                        alt={user.username}
                        size="xs"
                        fallback={user.fullName || user.username}
                      />
                      <span>{user.fullName || user.username}</span>
                      <button
                        onClick={() => handleUserRemove(user.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar usuarios..."
                className="pl-10"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="w-full p-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                    disabled={selectedUsers.find(u => u.id === user.id) !== undefined}
                  >
                    <Avatar
                      src={user.avatar}
                      alt={user.username}
                      size="sm"
                      fallback={user.fullName || user.username}
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">
                        {user.fullName || user.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{user.username}
                      </div>
                    </div>
                    {user.isFollowing && (
                      <div className="text-xs text-blue-600 font-medium">
                        Siguiendo
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="text-center py-4 text-gray-500">
                Buscando usuarios...
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && !isLoading && (
              <div className="text-center py-4 text-gray-500">
                No se encontraron usuarios
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
            <Button
              variant="ghost"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={selectedUsers.length === 0}
            >
              Crear Conversación ({selectedUsers.length})
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

export default CreateConversationModal
