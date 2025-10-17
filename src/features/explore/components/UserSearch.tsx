'use client'

import React, { useState, useEffect } from 'react'
import { Search, User, X } from 'lucide-react'
import { Button } from '@/design-system/Button'
import { Input } from '@/design-system/Input'
import { Avatar } from '@/design-system/Avatar'
import { userService, UserSuggestion } from '@/services/userService'

interface UserSearchProps {
  onSelectUser: (user: UserSuggestion) => void
  query?: string
  onResultClick?: () => void
  placeholder?: string
  className?: string
}

interface SearchResult {
  id: string
  username: string
  fullName?: string
  avatar?: string
  isFollowing?: boolean
  mutualFollowers?: number
}

export function UserSearch({ onSelectUser, query: initialQuery, onResultClick, placeholder = "Buscar usuarios...", className = "" }: UserSearchProps) {
  const [query, setQuery] = useState(initialQuery || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    const searchUsers = async () => {
      setIsLoading(true)
      try {
        const response = await userService.searchUsers(query)
        setResults(response.users.map(user => ({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
          isFollowing: user.isFollowing,
          mutualFollowers: 0 // TODO: Implement mutual followers
        })))
        setShowResults(true)
      } catch (error) {
        console.error('Error searching users:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleSelectUser = (user: SearchResult) => {
    onSelectUser(user as UserSuggestion)
    setQuery('')
    setResults([])
    setShowResults(false)
    onResultClick?.()
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Buscando...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors"
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
                    {user.mutualFollowers && user.mutualFollowers > 0 && (
                      <div className="text-xs text-gray-400">
                        {user.mutualFollowers} amigos en común
                      </div>
                    )}
                  </div>
                  {user.isFollowing && (
                    <div className="text-xs text-blue-600 font-medium">
                      Siguiendo
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No se encontraron usuarios
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default UserSearch
