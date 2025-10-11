import React, { useEffect, useState, useCallback } from 'react';
import { getConversations, Conversation } from '../services/conversationService';
import { useAuth } from '@/features/auth/useAuth';
import ConversationSkeleton from './ConversationSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import logger from '@/utils/logger';

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
      const response = await getConversations();
      if (response && response.conversations) {
        setConversations(response.conversations);
      } else {
        logger.warn('No conversations in response', { userId: user?._id });
        setConversations([]);
      }
    } catch (fetchConvError) {
      logger.error('Error fetching conversations:', {
        error: fetchConvError instanceof Error ? fetchConvError.message : 'Unknown error',
        userId: user?._id
      });
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [token, user?._id]);

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
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header - Optimizado para móvil */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Conversaciones</h2>
            <p className="text-xs sm:text-sm text-gray-500">Gestiona tus chats y mensajes</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter(filter === 'all' ? 'unread' : filter === 'unread' ? 'groups' : 'all')}
              className="p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
              title={filter === 'all' ? 'Mostrar no leídos' : filter === 'unread' ? 'Mostrar grupos' : 'Mostrar todos'}
            >
              <FilterIcon />
            </button>
            {onCreateNew && (
              <button
                onClick={onCreateNew}
                className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                title="Nueva conversación"
              >
                <PlusIcon />
              </button>
            )}
          </div>
        </div>

        {/* Barra de búsqueda - Optimizada para móvil */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white shadow-sm !text-gray-900 !placeholder-gray-500"
            style={{ color: '#111827', '--tw-placeholder-opacity': '1' } as React.CSSProperties}
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
            <div className="text-center max-w-sm mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                {searchQuery ? 'No se encontraron conversaciones' : 'No tienes conversaciones'}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {searchQuery
                  ? 'Intenta con otros términos de búsqueda o crea una nueva conversación.'
                  : 'Comienza a conectar con amigos y familiares creando tu primera conversación.'
                }
              </p>
              {!searchQuery && onCreateNew && (
                <button
                  onClick={onCreateNew}
                  className="mt-4 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Crear conversación
                </button>
              )}
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
                    {/* Avatar - Optimizado para móvil */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
                        {getConversationAvatar(conversation) ? (
                          <img
                            src={getConversationAvatar(conversation)}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white text-sm sm:text-lg">
                            {getConversationInitials(conversation)}
                          </div>
                        )}
                      </div>

                      {/* Indicador de grupo */}
                      {conversation.type === 'group' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <GroupIcon />
                        </div>
                      )}

                      {/* Indicador de no leídos */}
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Información de la conversación - Optimizada para móvil */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                          {getConversationName(conversation)}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatTimeAgo(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      {conversation.lastMessage && (
                        <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">
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
    </div>
  );
}
