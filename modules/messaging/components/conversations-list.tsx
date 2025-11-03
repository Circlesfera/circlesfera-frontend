'use client';

import Image from 'next/image';
import { type ReactElement } from 'react';
import { motion } from 'framer-motion';

import { type Conversation } from '@/services/api/messages';
import { formatRelativeTime } from '@/modules/feed/utils/formatters';
import { staggerContainer, staggerItem } from '@/lib/motion-config';

interface ConversationsListProps {
  readonly conversations: Conversation[];
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
}

export function ConversationsList({ conversations, selectedId, onSelect }: ConversationsListProps): ReactElement {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex-1 overflow-y-auto"
    >
      {conversations.map((conv) => {
        const isSelected = conv.id === selectedId;
        const lastMessagePreview = conv.lastMessage
          ? conv.lastMessage.content.length > 50
            ? `${conv.lastMessage.content.slice(0, 50)}...`
            : conv.lastMessage.content
          : 'Sin mensajes';

        const displayName = conv.type === 'group' ? conv.groupName || 'Grupo sin nombre' : conv.otherUser?.displayName || 'Usuario';
        const displayHandle = conv.type === 'group' 
          ? `${conv.participants?.length || 0} miembros` 
          : `@${conv.otherUser?.handle || ''}`;
        const avatarUrl = conv.type === 'group' 
          ? undefined // Por ahora sin avatar para grupos, se puede agregar más tarde
          : conv.otherUser?.avatarUrl;

        return (
          <motion.button
            key={conv.id}
            variants={staggerItem}
            type="button"
            onClick={() => {
              onSelect(conv.id);
            }}
            whileHover={{ x: 4 }}
            className={`w-full p-4 border-b border-white/5 rounded-xl mx-2 my-1 hover:bg-white/5 transition-all duration-200 group ${
              isSelected ? 'bg-gradient-to-r from-primary-500/20 via-primary-500/15 to-transparent border-l-4 border-l-primary-500' : ''
            }`}
          >
            <div className="flex gap-3">
              <div className="relative size-14 flex-shrink-0">
                {conv.type === 'group' ? (
                  <div className="size-14 rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary-500/30 group-hover:scale-105 transition-transform">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className="relative size-14 rounded-full ring-2 ring-slate-800 group-hover:ring-primary-500/50 transition-all">
                    <Image
                      src={avatarUrl || '/default-avatar.png'}
                      alt={displayName}
                      fill
                      className="rounded-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                {conv.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 size-6 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-primary-500/40 animate-pulse-slow">
                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`font-semibold truncate transition-colors ${
                      isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                    }`}>
                      {displayName}
                    </span>
                    {conv.type === 'group' && (
                      <span className="text-xs px-1.5 py-0.5 rounded-md bg-primary-500/20 text-primary-400 flex-shrink-0 font-medium">
                        Grupo
                      </span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <span className={`text-xs ml-2 flex-shrink-0 transition-colors ${
                      conv.unreadCount > 0 ? 'text-primary-400 font-medium' : 'text-slate-500'
                    }`}>
                      {formatRelativeTime(conv.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <p className={`text-sm truncate transition-colors ${
                  conv.unreadCount > 0 
                    ? 'text-white font-medium' 
                    : 'text-slate-400 group-hover:text-slate-300'
                }`}>
                  {lastMessagePreview}
                </p>
                {displayHandle && (
                  <p className="text-xs text-slate-600 mt-0.5 group-hover:text-slate-500 transition-colors">
                    {displayHandle}
                  </p>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

