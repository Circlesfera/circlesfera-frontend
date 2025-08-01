import React, { useEffect, useState, useCallback } from 'react';
import { getConversations, Conversation } from '../services/conversationService';
import { useAuth } from '@/features/auth/useAuth';
import ConversationSkeleton from './ConversationSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

// Iconos SVG
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const GroupIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

interface ConversationsListProps {
  onSelect: (conversation: Conversation) => void;
  selectedId: string | null;
  onCreateNew?: () => void;
}

export default function ConversationsList({ onSelect, selectedId, onCreateNew }: ConversationsListProps) {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'groups'>('all');

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await getConversations(token);
      if (response && response.conversations) {
        setConversations(response.conversations);
      } else {
        console.error('getConversations no devolvió datos válidos:', response);
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.participants.some((p: { username: string; fullName?: string }) => 
                           p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    
    const matchesFilter = filter === 'all' ||
                         (filter === 'unread' && conv.unreadCount > 0) ||
                         (filter === 'groups' && conv.type === 'group');
    
    return matchesSearch && matchesFilter;
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.name || 'Grupo sin nombre';
    }
    
    // Para conversaciones directas, mostrar el otro participante
    const otherParticipant = conversation.participants.find((p: { _id: string }) => p._id !== user?._id);
    return otherParticipant?.fullName || otherParticipant?.username || 'Usuario';
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.avatar;
    }
    
    const otherParticipant = conversation.participants.find((p: { _id: string }) => p._id !== user?._id);
    return otherParticipant?.avatar;
  };

  const getConversationInitials = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.name?.[0]?.toUpperCase() || 'G';
    }
    
    const otherParticipant = conversation.participants.find((p: { _id: string }) => p._id !== user?._id);
    return otherParticipant?.username[0]?.toUpperCase() || 'U';
  };

  return (
    <aside className="w-80 border-r border-gray-100 h-full flex flex-col bg-white rounded-l-2xl shadow-md">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Chats</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter(filter === 'all' ? 'unread' : filter === 'unread' ? 'groups' : 'all')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title={filter === 'all' ? 'Mostrar no leídos' : filter === 'unread' ? 'Mostrar grupos' : 'Mostrar todos'}
            >
              <FilterIcon />
            </button>
            {onCreateNew && (
              <button
                onClick={onCreateNew}
                className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-md"
                title="Nueva conversación"
              >
                <PlusIcon />
              </button>
            )}
          </div>
        </div>
        
        {/* Barra de búsqueda */}
        <div className="relative">
          <SearchIcon />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <ConversationSkeleton key={i} />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-gray-600 font-medium mb-2">
                {searchQuery ? 'No se encontraron conversaciones' : 'No tienes conversaciones'}
              </h3>
              <p className="text-gray-400 text-sm">
                {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Comienza una nueva conversación'}
              </p>
            </div>
          </div>
        ) : (
          <ul className="p-2">
            <AnimatePresence>
              {filteredConversations.map((conversation) => (
                <motion.li
                  key={conversation._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                      selectedId === conversation._id
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onSelect(conversation)}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        {getConversationAvatar(conversation) ? (
                          <img 
                            src={getConversationAvatar(conversation)} 
                            alt="avatar" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white text-lg">
                            {getConversationInitials(conversation)}
                          </div>
                        )}
                      </div>
                      
                      {/* Indicador de grupo */}
                      {conversation.type === 'group' && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <GroupIcon />
                        </div>
                      )}
                      
                      {/* Indicador de no leídos */}
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Información de la conversación */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {getConversationName(conversation)}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastMessage.type === 'text' 
                            ? conversation.lastMessage.content.text
                            : conversation.lastMessage.type === 'image'
                            ? '📷 Imagen'
                            : conversation.lastMessage.type === 'video'
                            ? '🎥 Video'
                            : conversation.lastMessage.type === 'location'
                            ? '📍 Ubicación'
                            : 'Mensaje'
                          }
                        </p>
                      )}
                    </div>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </aside>
  );
}
