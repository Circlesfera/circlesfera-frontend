'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getMessages, sendMessage, type Conversation, type Message } from '@/services/api/messages';
import { getSocketClient } from '@/lib/socket-client';
import { formatRelativeTime } from '@/modules/feed/utils/formatters';
import { useSessionStore } from '@/store/session';
import { GroupSettingsDialog } from './group-settings-dialog';

interface ChatViewProps {
  readonly conversation: Conversation;
}

export function ChatView({ conversation }: ChatViewProps): ReactElement {
  const [messageText, setMessageText] = useState('');
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
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

          // En grupos, necesitamos obtener la info del sender desde los participantes
          // Por ahora usamos un placeholder que se actualizará cuando se cargue el mensaje completo
          let senderInfo;
          if (conversation.type === 'group' && conversation.participants) {
            const sender = conversation.participants.find((p) => p.id === data.senderId);
            senderInfo = sender || {
              id: data.senderId,
              handle: 'usuario',
              displayName: 'Usuario',
              avatarUrl: ''
            };
          } else {
            senderInfo = conversation.otherUser || {
              id: data.senderId,
              handle: 'usuario',
              displayName: 'Usuario',
              avatarUrl: ''
            };
          }

          const newMessage: Message = {
            id: data.id,
            conversationId: data.conversationId,
            sender: senderInfo,
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
        // Invalidar mensajes para obtener la info completa del sender
        queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
      }
    };

    // Escuchar indicadores de escritura
    const handleTyping = (data: { userId: string; userName: string }) => {
      if (data.userId !== currentUser?.id) {
        setTypingUsers((prev) => new Set(prev).add(data.userId));
        // Limpiar después de 3 segundos sin escribir
        setTimeout(() => {
          setTypingUsers((prev) => {
            const next = new Set(prev);
            next.delete(data.userId);
            return next;
          });
        }, 3000);
      }
    };

    // Escuchar cuando se detiene de escribir
    const handleStopTyping = (data: { userId: string }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    };

    // Escuchar actualizaciones de lectura
    const handleMessageRead = (data: { messageId: string; userId: string }) => {
      queryClient.setQueryData(['messages', conversation.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: { messages: Message[] }) => ({
            ...page,
            messages: page.messages.map((msg: Message) =>
              msg.id === data.messageId ? { ...msg, isRead: true } : msg
            )
          }))
        };
      });
    };

    socket.on('new-message', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('stop-typing', handleStopTyping);
    socket.on('message-read', handleMessageRead);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('stop-typing', handleStopTyping);
      socket.off('message-read', handleMessageRead);
    };
  }, [conversation.id, queryClient, conversation.type, conversation.otherUser, conversation.participants, currentUser?.id]);

  // Auto-scroll al final cuando hay nuevos mensajes o usuarios escribiendo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data, typingUsers]);

  // Enviar indicador de escritura
  useEffect(() => {
    const socket = getSocketClient();
    if (!socket || messageText.trim().length === 0) {
      return;
    }

    // Emitir evento de escritura
    socket.emit('typing', { conversationId: conversation.id });

    // Limpiar timeout anterior
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Emitir evento de dejar de escribir después de 1 segundo sin cambios
    const timeout = setTimeout(() => {
      socket.emit('stop-typing', { conversationId: conversation.id });
    }, 1000);

    setTypingTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [messageText, conversation.id]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const trimmed = messageText.trim();
    if (trimmed.length === 0 || sendMessageMutation.isPending) {
      return;
    }
    
    // Emitir dejar de escribir
    const socket = getSocketClient();
    if (socket) {
      socket.emit('stop-typing', { conversationId: conversation.id });
    }
    
    sendMessageMutation.mutate(trimmed);
  };

  const allMessages: Message[] = data?.pages.flatMap((page) => page.messages) ?? [];
  const isLoadingMessages = isLoading;
  
  // Marcar mensajes como leídos al verlos
  useEffect(() => {
    const socket = getSocketClient();
    if (!socket || !currentUser || allMessages.length === 0) return;
    
    const unreadMessages = allMessages.filter(
      (msg) => !msg.isRead && msg.sender.id !== currentUser.id
    );
    
    if (unreadMessages.length > 0) {
      // Marcar todos los mensajes no leídos como leídos
      unreadMessages.forEach((msg) => {
        socket.emit('mark-read', { messageId: msg.id, conversationId: conversation.id });
      });
      
      // Actualizar estado local
      queryClient.setQueryData(['messages', conversation.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: { messages: Message[] }) => ({
            ...page,
            messages: page.messages.map((msg: Message) =>
              unreadMessages.some((um) => um.id === msg.id) ? { ...msg, isRead: true } : msg
            )
          }))
        };
      });
      
      // Invalidar conversaciones para actualizar contador
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  }, [allMessages, currentUser, conversation.id, queryClient]);

  const isGroup = conversation.type === 'group';
  const displayName = isGroup ? conversation.groupName || 'Grupo sin nombre' : conversation.otherUser?.displayName || 'Usuario';
  const displaySubtitle = isGroup 
    ? `${conversation.participants?.length || 0} miembros`
    : `@${conversation.otherUser?.handle || ''}`;
  const avatarUrl = isGroup ? undefined : conversation.otherUser?.avatarUrl;

  return (
    <div className="flex flex-col h-full">
      {/* Header del chat */}
      <div className="p-4 border-b border-slate-200/50 dark:border-white/5 glass-card flex items-center gap-3">
        {isGroup ? (
          <div className="size-12 rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary-500/30">
            {displayName.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="relative size-12 ring-2 ring-slate-300 dark:ring-slate-800 rounded-full">
            <Image
              src={avatarUrl || '/default-avatar.png'}
              alt={displayName}
              fill
              className="rounded-full object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-900 dark:text-white">{displayName}</h2>
            {isGroup && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-primary-500/20 text-primary-400 font-medium">
                Grupo
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{displaySubtitle}</p>
        </div>
        {isGroup && (
          <button
            type="button"
            onClick={() => {
              setIsGroupSettingsOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            title="Configuración del grupo"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white via-slate-50 to-slate-100/50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/30">
        {hasNextPage && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                fetchNextPage();
              }}
              className="text-sm px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800/50 text-primary-400 hover:bg-slate-200 dark:hover:bg-slate-800/70 hover:text-primary-300 transition-all duration-200 border border-slate-300/50 dark:border-slate-700/50 hover:border-primary-500/30"
            >
              Cargar mensajes anteriores
            </button>
          </div>
        )}

        {isLoadingMessages && allMessages.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="size-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent mx-auto mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Cargando mensajes...</p>
            </div>
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="size-16 rounded-full bg-slate-200 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 flex items-center justify-center mx-auto mb-4">
                <svg className="size-8 text-slate-600 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No hay mensajes aún</p>
              <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">Sé el primero en enviar un mensaje</p>
            </div>
          </div>
        ) : (
          <>
            {allMessages.map((message) => {
            const isOwn = message.sender.id === currentUser?.id;

            return (
              <div key={message.id} className={`flex gap-3 items-end ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                {!isOwn && (
                  <div className="relative size-9 flex-shrink-0">
                    <Image
                      src={message.sender.avatarUrl || '/default-avatar.png'}
                      alt={message.sender.displayName}
                      fill
                      className="rounded-full object-cover ring-2 ring-slate-300 dark:ring-slate-800"
                    />
                  </div>
                )}
                <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
                  {!isOwn && isGroup && (
                    <p className="text-xs text-slate-500 mb-1.5 px-1 font-medium">{message.sender.displayName}</p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 shadow-md ${
                      isOwn 
                        ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-br-md' 
                        : 'bg-slate-100 dark:bg-slate-800/80 backdrop-blur-sm text-slate-900 dark:text-slate-100 rounded-bl-md border border-slate-300/50 dark:border-slate-700/50'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                  </div>
                    <div className={`flex items-center gap-1.5 mt-1.5 px-1 ${isOwn ? 'justify-end' : ''}`}>
                      <p className={`text-xs ${isOwn ? 'text-slate-600 dark:text-slate-500' : 'text-slate-600 dark:text-slate-500'}`}>
                    {formatRelativeTime(message.createdAt)}
                  </p>
                      {isOwn && (
                        <span className="text-xs">
                          {message.isRead ? (
                            <span className="text-primary-400" title="Leído">
                              <svg className="size-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          ) : (
                            <span className="text-slate-600 dark:text-slate-500" title="Enviado">
                              <svg className="size-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                </div>
                {isOwn && (
                  <div className="relative size-9 flex-shrink-0 order-1">
                    <Image
                      src={currentUser?.avatarUrl || '/default-avatar.png'}
                      alt={currentUser?.displayName || 'Tú'}
                      fill
                      className="rounded-full object-cover ring-2 ring-slate-300 dark:ring-slate-800"
                    />
                  </div>
                )}
              </div>
            );
            })}
          
            {/* Indicador de escritura */}
            {typingUsers.size > 0 && (
              <div className="flex gap-3 items-end animate-fade-in">
                <div className="relative size-9 flex-shrink-0">
                  <div className="size-9 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center">
                    <svg className="size-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <div className="max-w-[70%]">
                  <div className="rounded-2xl px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50">
                    <div className="flex gap-1 items-center">
                      <span className="size-2 bg-slate-600 dark:bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                      <span className="size-2 bg-slate-600 dark:bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                      <span className="size-2 bg-slate-600 dark:bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30 backdrop-blur-sm">
        <div className="flex gap-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
            }}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
            maxLength={5000}
          />
          <button
            type="submit"
            disabled={sendMessageMutation.isPending || messageText.trim().length === 0}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold shadow-lg shadow-primary-500/25 hover:from-primary-500 hover:to-primary-400 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
          >
            {sendMessageMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Enviando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Enviar
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </span>
            )}
          </button>
        </div>
      </form>

      {/* Dialog de configuración de grupo */}
      {isGroup && (
        <GroupSettingsDialog
          conversation={conversation}
          isOpen={isGroupSettingsOpen}
          onClose={() => {
            setIsGroupSettingsOpen(false);
          }}
        />
      )}
    </div>
  );
}

