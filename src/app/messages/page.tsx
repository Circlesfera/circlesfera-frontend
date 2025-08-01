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
      <div className="flex h-[80vh] bg-white rounded shadow mt-8 max-w-4xl mx-auto overflow-hidden">
        <ConversationsList onSelect={handleSelectConversation} selectedId={selected} />
        {selected ? (
          <ChatWindow conversationId={selected} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">Selecciona un chat</div>
        )}
      </div>
    </ProtectedRoute>
  );
}
