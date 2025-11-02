'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getMessages, sendMessage, type Conversation, type Message } from '@/services/api/messages';
import { getSocketClient } from '@/lib/socket-client';
import { formatRelativeTime } from '@/modules/feed/utils/formatters';
import { useSessionStore } from '@/store/session';

interface ChatViewProps {
  readonly conversation: Conversation;
}

export function ChatView({ conversation }: ChatViewProps): ReactElement {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useSessionStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['messages', conversation.id],
    queryFn: ({ pageParam }) => getMessages(conversation.id, 50, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => sendMessage(conversation.id, { content }),
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      toast.error('No se pudo enviar el mensaje');
    }
  });

  // Escuchar nuevos mensajes vía WebSocket
  useEffect(() => {
    const socket = getSocketClient();
    if (!socket) {
      return;
    }

    const handleNewMessage = (data: { id: string; conversationId: string; senderId: string; content: string; createdAt: string }) => {
      if (data.conversationId === conversation.id) {
        queryClient.setQueryData(['messages', conversation.id], (old: any) => {
          if (!old) {
            return old;
          }

          const newMessage: Message = {
            id: data.id,
            conversationId: data.conversationId,
            sender: {
              id: data.senderId,
              handle: conversation.otherUser.handle,
              displayName: conversation.otherUser.displayName,
              avatarUrl: conversation.otherUser.avatarUrl
            },
            content: data.content,
            isRead: false,
            createdAt: data.createdAt
          };

          // Actualizar la última página
          const pages = old.pages;
          const lastPage = pages[pages.length - 1];
          return {
            ...old,
            pages: [
              ...pages.slice(0, -1),
              {
                ...lastPage,
                messages: [...lastPage.messages, newMessage]
              }
            ]
          };
        });

        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [conversation.id, queryClient, conversation.otherUser]);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const trimmed = messageText.trim();
    if (trimmed.length === 0 || sendMessageMutation.isPending) {
      return;
    }
    sendMessageMutation.mutate(trimmed);
  };

  const allMessages: Message[] = data?.pages.flatMap((page) => page.messages) ?? [];
  const isLoadingMessages = isLoading;

  return (
    <div className="flex flex-col h-full">
      {/* Header del chat */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="relative size-10">
          <Image
            src={conversation.otherUser.avatarUrl || '/default-avatar.png'}
            alt={conversation.otherUser.displayName}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div>
          <h2 className="font-semibold text-white">{conversation.otherUser.displayName}</h2>
          <p className="text-sm text-slate-400">@{conversation.otherUser.handle}</p>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hasNextPage && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                fetchNextPage();
              }}
              className="text-sm text-primary-400 hover:underline"
            >
              Cargar mensajes anteriores
            </button>
          </div>
        )}

        {isLoadingMessages && allMessages.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-slate-400">Cargando mensajes...</div>
        ) : allMessages.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-slate-400">No hay mensajes aún</div>
        ) : (
          allMessages.map((message) => {
            const isOwn = message.sender.id === currentUser?.id;

            return (
              <div key={message.id} className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                {!isOwn && (
                  <div className="relative size-8 flex-shrink-0">
                    <Image
                      src={message.sender.avatarUrl || '/default-avatar.png'}
                      alt={message.sender.displayName}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                )}
                <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
                  {!isOwn && <p className="text-xs text-slate-500 mb-1">{message.sender.displayName}</p>}
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isOwn ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{formatRelativeTime(message.createdAt)}</p>
                </div>
                {isOwn && (
                  <div className="relative size-8 flex-shrink-0 order-1">
                    <Image
                      src={currentUser?.avatarUrl || '/default-avatar.png'}
                      alt={currentUser?.displayName || 'Tú'}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
            }}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 rounded-full bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            maxLength={5000}
          />
          <button
            type="submit"
            disabled={sendMessageMutation.isPending || messageText.trim().length === 0}
            className="px-6 py-2 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}

