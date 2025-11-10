'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { type ReactElement, useEffect, useMemo, useState } from 'react';

import { fadeUpVariants } from '@/lib/motion-config';
import { getSocketClient } from '@/lib/socket-client';
import { type ConversationsResponse, getConversations } from '@/services/api/messages';

import { ChatView } from './chat-view';
import { ConversationsList } from './conversations-list';
import { CreateGroupDialog } from './create-group-dialog';

export function MessagesShell(): ReactElement {
  const searchParams = useSearchParams();
  const conversationParam = searchParams.get('conversation');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    conversationParam || null
  );
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const conversationQueryKey = useMemo(() => ['conversations'], []);

  const { data, isLoading } = useQuery<ConversationsResponse>({
    queryKey: conversationQueryKey,
    queryFn: async () => getConversations(),
    staleTime: 1000 * 30 // 30 segundos
  });

  const queryClient = useQueryClient();
  const conversations = useMemo(() => data?.conversations ?? [], [data]);

  // Escuchar eventos de grupos vía WebSocket
  useEffect(() => {
    const socket = getSocketClient();
    if (!socket) {
      return;
    }

    const handleGroupCreated = (): void => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const handleGroupUpdated = (): void => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.on('group-created', handleGroupCreated);
    socket.on('group-updated', handleGroupUpdated);

    return () => {
      socket.off('group-created', handleGroupCreated);
      socket.off('group-updated', handleGroupUpdated);
    };
  }, [queryClient]);

  // Si hay un parámetro de conversación en la URL, seleccionarla (y esperar a que se cargue si no está aún)
  useEffect(() => {
    if (conversationParam) {
      // Esperar a que se carguen las conversaciones si aún están cargando
      if (!isLoading && conversations.length > 0) {
        const conversation = conversations.find((c) => c.id === conversationParam);
        if (conversation) {
          setSelectedConversationId(conversation.id);
        } else {
          // Si no se encuentra, podría ser una nueva conversación - forzar recarga
          void queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      }
    }
  }, [conversationParam, conversations, isLoading, queryClient]);

  // Si hay conversaciones y no hay una seleccionada, seleccionar la primera
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0 && !conversationParam) {
      const firstConversation = conversations[0];
      if (firstConversation) {
        setSelectedConversationId(firstConversation.id);
      }
    }
  }, [conversations, selectedConversationId, conversationParam]);

  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId) ?? null;

  return (
    <div className="flex h-screen">
      {/* Lista de conversaciones */}
      <div className="w-full md:w-96 border-r border-slate-200/50 dark:border-white/5 glass-sidebar flex flex-col">
        <div className="p-5 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between">
          <h1 className="text-gradient-primary text-xl font-bold">
            Mensajes
          </h1>
          <motion.button
            type="button"
            onClick={() => {
              setIsCreateGroupOpen(true);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300"
            title="Crear grupo"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </motion.button>
        </div>
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="size-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent mx-auto mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Cargando conversaciones...</p>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 flex items-center justify-center p-8"
          >
            <div className="rounded-2xl glass-card p-12 text-center max-w-md">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative mx-auto mb-6"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 via-primary-400/20 to-accent-500/20 blur-2xl" />
                <div className="relative size-24 rounded-2xl border border-primary-500/30 bg-gradient-to-br from-slate-100 dark:from-slate-900/50 to-white dark:to-black/50 backdrop-blur-sm flex items-center justify-center shadow-elegant">
                  <svg className="size-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No tienes conversaciones aún</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Inicia una conversación con alguien para empezar</p>
              </motion.div>
            </div>
          </motion.div>
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
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 flex items-center justify-center p-8"
          >
            <div className="rounded-2xl glass-card p-12 text-center max-w-md">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative mx-auto mb-6"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent-500/20 via-primary-400/20 to-primary-500/20 blur-2xl" />
                <div className="relative size-24 rounded-2xl border border-accent-500/30 bg-gradient-to-br from-slate-900/50 to-black/50 backdrop-blur-sm flex items-center justify-center shadow-elegant">
                  <svg className="size-12 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Selecciona una conversación</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Elige una conversación de la lista para empezar a chatear</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Dialog para crear grupo */}
      <CreateGroupDialog
        isOpen={isCreateGroupOpen}
        onClose={() => {
          setIsCreateGroupOpen(false);
        }}
      />
    </div>
  );
}

