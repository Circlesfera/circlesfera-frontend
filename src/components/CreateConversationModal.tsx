import React, { useState, useEffect } from 'react';
import { searchUsers, UserSuggestion } from '@/services/userService';
import { createConversation, Conversation as ServiceConversation } from '@/services/conversationService';
import { useAuth } from '@/features/auth/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import logger from '@/utils/logger';

type User = UserSuggestion;

interface CreateConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversation: ServiceConversation) => void;
}

export default function CreateConversationModal({
  isOpen,
  onClose,
  onConversationCreated
}: CreateConversationModalProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Buscar usuarios cuando cambie la query
  useEffect(() => {
    const searchUsersDebounced = async () => {
      if (searchQuery.length < 2) {
        setUsers([]);
        return;
      }

      try {
        setLoading(true);
        const users = await searchUsers(searchQuery);
        // Filtrar el usuario actual
        const filteredUsers = users.filter((u: User) => u._id !== user?._id);
        setUsers(filteredUsers);
        logger.debug('Users searched:', { query: searchQuery, count: filteredUsers.length });
      } catch (searchError) {
        logger.error('Error searching users:', {
          error: searchError instanceof Error ? searchError.message : 'Unknown error',
          query: searchQuery
        });
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsersDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, user?._id]);

  const handleUserSelect = (user: User) => {
    const isSelected = selectedUsers.some(u => u._id === user._id);
    if (isSelected) {
      setSelectedUsers(prev => prev.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== userId));
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) return;

    try {
      setCreating(true);
      const participantIds = selectedUsers.map(u => u._id);

      const response = await createConversation({
        participants: participantIds,
        type: 'direct'
      });

      if (response.success) {
        onConversationCreated(response.conversation);
        handleClose();
        logger.info('Conversation created:', { conversationId: response.conversation._id });
      }
    } catch (createError) {
      logger.error('Error creating conversation:', {
        error: createError instanceof Error ? createError.message : 'Unknown error',
        selectedUserId
      });
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setUsers([]);
    setSelectedUsers([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Nueva conversación</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Busca usuarios para comenzar a chatear
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
              {/* Usuarios seleccionados */}
              {selectedUsers.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Seleccionados ({selectedUsers.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm"
                      >
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-200">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                              {user.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <span>{user.fullName || user.username}</span>
                        <button
                          onClick={() => handleRemoveUser(user._id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Barra de búsqueda */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm !text-gray-900 !placeholder-gray-500 bg-white"
                  style={{ color: '#111827', '--tw-placeholder-opacity': '1' } as React.CSSProperties}
                />
              </div>

              {/* Lista de usuarios */}
              <div className="max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : users.length === 0 && searchQuery.length >= 2 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No se encontraron usuarios</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {users.map((user) => {
                      const isSelected = selectedUsers.some(u => u._id === user._id);
                      return (
                        <button
                          key={user._id}
                          onClick={() => handleUserSelect(user)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                            isSelected
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-gray-600">
                                {user.username?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900 text-sm">
                              {user.fullName || user.username}
                            </p>
                            <p className="text-xs text-gray-500">
                              @{user.username}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateConversation}
                  disabled={selectedUsers.length === 0 || creating}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creando...' : 'Crear conversación'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
