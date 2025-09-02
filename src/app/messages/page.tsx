"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import ConversationsList from '@/components/ConversationsList';
import ChatWindow from '@/components/ChatWindow';
import { useState } from 'react';
import { Conversation } from '@/services/conversationService';

export default function MessagesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  
  const handleSelectConversation = (conversation: Conversation) => {
    setSelected(conversation._id);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row h-[80vh] min-h-[600px]">
            <div className="w-full lg:w-80 border-r border-gray-100">
              <ConversationsList onSelect={handleSelectConversation} selectedId={selected} />
            </div>
            <div className="flex-1 flex flex-col">
              {selected ? (
                <ChatWindow conversationId={selected} />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-500 mb-2">Selecciona un chat</h3>
                  <p className="text-sm text-gray-400 text-center">Elige una conversación para comenzar a chatear</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
