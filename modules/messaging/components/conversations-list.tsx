'use client';

import Image from 'next/image';
import { type ReactElement } from 'react';

import { type Conversation } from '@/services/api/messages';
import { formatRelativeTime } from '@/modules/feed/utils/formatters';

interface ConversationsListProps {
  readonly conversations: Conversation[];
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
}

export function ConversationsList({ conversations, selectedId, onSelect }: ConversationsListProps): ReactElement {
  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv) => {
        const isSelected = conv.id === selectedId;
        const lastMessagePreview = conv.lastMessage
          ? conv.lastMessage.content.length > 50
            ? `${conv.lastMessage.content.slice(0, 50)}...`
            : conv.lastMessage.content
          : 'Sin mensajes';

        return (
          <button
            key={conv.id}
            type="button"
            onClick={() => {
              onSelect(conv.id);
            }}
            className={`w-full p-4 border-b border-slate-800 hover:bg-slate-900/50 transition ${
              isSelected ? 'bg-slate-900/70' : ''
            }`}
          >
            <div className="flex gap-3">
              <div className="relative size-14 flex-shrink-0">
                <Image
                  src={conv.otherUser.avatarUrl || '/default-avatar.png'}
                  alt={conv.otherUser.displayName}
                  fill
                  className="rounded-full object-cover"
                />
                {conv.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 size-5 rounded-full bg-primary-500 flex items-center justify-center text-xs font-bold">
                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white truncate">{conv.otherUser.displayName}</span>
                  {conv.lastMessage && (
                    <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                      {formatRelativeTime(conv.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-white font-medium' : 'text-slate-400'}`}>
                  {lastMessagePreview}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

