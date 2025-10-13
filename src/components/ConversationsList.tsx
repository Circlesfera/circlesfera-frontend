import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
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
    <div className="h-full flex flex-col bg-gradient-to-b from-white to-gray-50 dark:to-gray-900/50">
      {/* Header mejorado */}
      <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Conversaciones
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">
              {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
            </p>
          </div>
          <div className="flex items-center space-x-1.5">
            {/* Filtro mejorado */}
            <button
              onClick={() => setFilter(filter === 'all' ? 'unread' : filter === 'unread' ? 'groups' : 'all')}
              className={`p-2.5 rounded-xl transition-all duration-200 ${filter !== 'all'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:bg-gray-800'
                }`}
              title={filter === 'all' ? 'Mostrar no leídos' : filter === 'unread' ? 'Mostrar grupos' : 'Mostrar todos'}
            >
              <FilterIcon />
            </button>
            {onCreateNew && (
              <button
                onClick={onCreateNew}
                className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
                title="Nueva conversación"
              >
                <PlusIcon />
              </button>
            )}
          </div>
        </div>

        {/* Barra de búsqueda mejorada */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:bg-gray-900 transition-all !text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:text-gray-400 dark:text-gray-500"
          />
        </div>

        {/* Filtros activos */}
        {filter !== 'all' && (
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">Filtro:</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {filter === 'unread' ? 'No leídos' : 'Grupos'}
            </span>
          </div>
        )}
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
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur-2xl opacity-30"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {searchQuery ? 'No se encontraron conversaciones' : 'No tienes conversaciones'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm leading-relaxed mb-4">
                {searchQuery
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza a conectar con amigos creando tu primera conversación'
                }
              </p>
              {!searchQuery && onCreateNew && (
                <button
                  onClick={onCreateNew}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                >
                  Crear conversación
                </button>
              )}
            </div>
          </div>
        ) : (
          <ul className="p-2 space-y-1">
            <AnimatePresence>
              {filteredConversations.map((conversation) => (
                <motion.li
                  key={conversation._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    className={`group w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${selectedId === conversation._id
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-sm dark:shadow-gray-900/50'
                      : 'hover:bg-gray-50 dark:bg-gray-800 border-2 border-transparent'
                      }`}
                    onClick={() => onSelect(conversation)}
                  >
                    {/* Avatar mejorado */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden ring-2 ${selectedId === conversation._id ? 'ring-blue-400' : 'ring-gray-200 group-hover:ring-gray-300 dark:ring-gray-600'
                        } transition-all`}>
                        {getConversationAvatar(conversation) ? (
                          <Image
                            src={getConversationAvatar(conversation) || '/default-avatar.png'}
                            alt={`Avatar de ${getConversationName(conversation)}`}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-lg">
                            {getConversationInitials(conversation)}
                          </div>
                        )}
                      </div>

                      {/* Indicador de grupo mejorado */}
                      {conversation.type === 'group' && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white shadow-md">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                      )}

                      {/* Badge de no leídos mejorado */}
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold px-1.5 shadow-lg">
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Información mejorada */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold truncate text-base ${conversation.unreadCount > 0 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                          {getConversationName(conversation)}
                        </h3>
                        {conversation.lastMessage && (
                          <span className={`text-xs flex-shrink-0 ml-2 font-medium ${conversation.unreadCount > 0 ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'
                            }`}>
                            {formatTimeAgo(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      {conversation.lastMessage && (
                        <div className="flex items-center gap-1.5">
                          <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'
                            }`}>
                            {conversation.lastMessage.type === 'text'
                              ? conversation.lastMessage.content?.text || 'Mensaje de texto'
                              : conversation.lastMessage.type === 'image'
                                ? '📷 Imagen'
                                : conversation.lastMessage.type === 'video'
                                  ? '🎥 Video'
                                  : conversation.lastMessage.type === 'location'
                                    ? '📍 Ubicación'
                                    : 'Mensaje'
                            }
                          </p>
                        </div>
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
