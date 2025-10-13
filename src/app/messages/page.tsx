"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import ConversationsList from '@/components/ConversationsList';
import ChatWindow from '@/components/ChatWindow';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Conversation } from '@/services/conversationService';
import CreateConversationModal from '@/components/CreateConversationModal';

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelected(conversation._id);
    setShowChat(true);
  };

  const handleBackToList = () => {
    setShowChat(false);
    setSelected(null);
  };

  const handleCreateNew = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  // Verificar si hay una conversación específica en la URL
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId) {
      setSelected(conversationId);
      setShowChat(true);
    }
  }, [searchParams]);

  // En móvil, ocultar el chat por defecto
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowChat(true);
      } else {
        setShowChat(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ProtectedRoute>
      <div className="h-screen bg-gradient-to-br from-gray-50 dark:from-gray-900 via-blue-50 to-indigo-50">
        {/* Header mejorado con glassmorphism */}
        <div className="backdrop-blur-xl bg-white dark:bg-gray-900 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700/50 shadow-sm dark:shadow-gray-900/50 px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Botón de regreso mejorado */}
                {showChat && (
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Título con gradiente */}
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Mensajes
                    </h1>
                    <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Chat en tiempo real</p>
                  </div>
                </div>
              </div>

              {/* Acciones del header */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCreateNew}
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm">Nuevo</span>
                </button>

                <button className="p-2.5 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal mejorado */}
        <div className="max-w-7xl mx-auto h-[calc(100vh-88px)] p-2 sm:p-4">
          <div className="backdrop-blur-xl bg-white dark:bg-gray-900 dark:bg-gray-900/90 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 dark:border-gray-700/50 overflow-hidden h-full">
            <div className="flex h-full">
              {/* Sidebar mejorado */}
              <div className={`${showChat ? 'hidden md:block' : 'block'} w-full md:w-96 lg:w-[420px] border-r border-gray-200 dark:border-gray-700 dark:border-gray-700/50 bg-gradient-to-b from-gray-50 dark:from-gray-900/50 to-white/50`}>
                <ConversationsList
                  onSelect={handleSelectConversation}
                  selectedId={selected}
                  onCreateNew={handleCreateNew}
                />
              </div>

              {/* Área de chat mejorada */}
              <div className={`${!showChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white dark:bg-gray-900 dark:bg-gray-900`}>
                {selected ? (
                  <ChatWindow conversationId={selected} />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-purple-50/50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-6">
                    <div className="text-center max-w-md mx-auto">
                      {/* Ilustración mejorada */}
                      <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform hover:scale-105 transition-transform duration-300">
                          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-3">
                        ¡Comienza a chatear!
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg leading-relaxed mb-6">
                        Selecciona una conversación o crea una nueva para comenzar a conectar con tus amigos
                      </p>

                      {/* Features mejorados */}
                      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                        <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-700 font-medium">Tiempo real</span>
                        </div>
                        <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-blue-700 font-medium">Seguro</span>
                        </div>
                        <div className="flex items-center space-x-2 px-4 py-2 bg-purple-50 rounded-full">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-sm text-purple-700 font-medium">Multimedia</span>
                        </div>
                      </div>

                      {/* Botón CTA mejorado */}
                      <button
                        onClick={handleCreateNew}
                        className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 duration-300"
                      >
                        <span className="flex items-center space-x-2">
                          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Crear conversación</span>
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal mejorado */}
        {showCreateModal && (
          <CreateConversationModal
            isOpen={showCreateModal}
            onClose={handleCloseCreateModal}
            onConversationCreated={(conversation: Conversation) => {
              handleSelectConversation(conversation);
              setShowCreateModal(false);
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
