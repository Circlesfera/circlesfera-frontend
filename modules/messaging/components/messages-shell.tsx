'use client';

import { useState, useEffect, type ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getConversations, type Conversation } from '@/services/api/messages';
import { ConversationsList } from './conversations-list';
import { ChatView } from './chat-view';

export function MessagesShell(): ReactElement {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(),
    staleTime: 1000 * 30 // 30 segundos
  });

  const conversations = data?.conversations ?? [];

  // Si hay conversaciones y no hay una seleccionada, seleccionar la primera
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      const firstConversation = conversations[0];
      if (firstConversation) {
        setSelectedConversationId(firstConversation.id);
      }
    }
  }, [conversations, selectedConversationId]);

  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId) ?? null;

  return (
    <div className="flex h-screen">
      {/* Lista de conversaciones */}
      <div className="w-full md:w-96 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-xl font-bold">Mensajes</h1>
        </div>
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">Cargando conversaciones...</div>
        ) : conversations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">No tienes conversaciones aún</div>
        ) : (
          <ConversationsList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelect={(id) => {
              setSelectedConversationId(id);
            }}
          />
        )}
      </div>

      {/* Vista de chat */}
      <div className="hidden md:flex flex-1 flex-col">
        {selectedConversation ? (
          <ChatView conversation={selectedConversation} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Selecciona una conversación para empezar
          </div>
        )}
      </div>
    </div>
  );
}

