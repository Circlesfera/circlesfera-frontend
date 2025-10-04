"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import ConversationsList from '@/components/ConversationsList';
import ChatWindow from '@/components/ChatWindow';
import { useState, useEffect } from 'react';
import { Conversation } from '@/services/conversationService';

export default function MessagesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  
  const handleSelectConversation = (conversation: Conversation) => {
    setSelected(conversation._id);
    setShowChat(true);
  };

  const handleBackToList = () => {
    setShowChat(false);
    setSelected(null);
  };

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
      <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header de la página - Optimizado para móvil */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Botón de regreso en móvil cuando se muestra el chat */}
                {showChat && (
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mensajes</h1>
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                  <span>•</span>
                  <span>Conecta con amigos</span>
                  <span>•</span>
                  <span>Chat en tiempo real</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V4a1 1 0 00-1-1H5a1 1 0 00-1 1v1zm0 6h6V9H4v2zm0 4h6v-2H4v2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal - Optimizado para móvil */}
        <div className="max-w-7xl mx-auto h-[calc(100vh-80px)] sm:h-[calc(100vh-120px)]">
          <div className="bg-white rounded-none sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden h-full">
            <div className="flex h-full">
              {/* Sidebar de conversaciones - Oculto en móvil cuando se muestra el chat */}
              <div className={`${showChat ? 'hidden md:block' : 'block'} w-full md:w-96 lg:w-[420px] border-r border-gray-200 bg-gray-50`}>
                <ConversationsList onSelect={handleSelectConversation} selectedId={selected} />
              </div>

              {/* Área de chat - Oculto en móvil cuando no hay conversación seleccionada */}
              <div className={`${!showChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white`}>
                {selected ? (
                  <ChatWindow conversationId={selected} />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6">
                    <div className="text-center max-w-md mx-auto">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <svg className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">¡Comienza a chatear!</h3>
                      <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                        Selecciona una conversación de la lista para comenzar a enviar mensajes y conectar con tus amigos.
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>Chat en tiempo real</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>Mensajes seguros</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
