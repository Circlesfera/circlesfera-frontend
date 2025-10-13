'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, MoreHorizontal, Pin, ThumbsUp } from 'lucide-react';
import type { LiveComment as LiveCommentType } from '@/types/live';

interface LiveCommentProps {
  comment: LiveCommentType;
  onReact?: (commentId: string, reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'angry') => void;
  onReply?: (commentId: string, username: string) => void;
  onModerate?: (commentId: string, action: 'hide' | 'delete' | 'pin' | 'unpin') => void;
  canModerate?: boolean;
  currentUser?: {
    id: string;
    username: string;
  } | undefined;
}

const REACTION_EMOJIS = {
  like: '👍',
  love: '❤️',
  laugh: '😂',
  wow: '😮',
  angry: '😡',
};

const REACTION_COLORS = {
  like: 'text-blue-500',
  love: 'text-red-500',
  laugh: 'text-yellow-500',
  wow: 'text-purple-500',
  angry: 'text-orange-500',
};

export function LiveComment({
  comment,
  onReact,
  onReply,
  onModerate,
  canModerate = false,
  currentUser,
}: LiveCommentProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(
    currentUser ? comment.reactions.some(r => r.user._id === currentUser.id) : false
  );
  const menuRef = useRef<HTMLDivElement>(null);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const handleReaction = (reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'angry') => {
    onReact?.(comment._id, reactionType);
    setShowReactions(false);
  };

  const handleReply = () => {
    onReply?.(comment._id, comment.user.username);
    setShowMenu(false);
  };

  const handleModerate = (action: 'hide' | 'delete' | 'pin' | 'unpin') => {
    onModerate?.(comment._id, action);
    setShowMenu(false);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    handleReaction('like');
  };

  const isOwnComment = currentUser?.id === comment.user._id;
  const hasReactions = comment.reactionCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative group ${comment.isPinned ? 'bg-blue-50 border-l-4 border-blue-500' : ''} ${!comment.isVisible ? 'opacity-50' : ''
        }`}
    >
      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Image
            src={comment.user.avatar || '/default-avatar.png'}
            alt={`Avatar de ${comment.user.username}`}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 dark:text-gray-100">
              {comment.user.username}
            </span>
            {comment.user.isVerified && (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
            {comment.isPinned && (
              <Pin className="w-3 h-3 text-blue-500" />
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
              {formatTimestamp(comment.timestamp)}
            </span>
          </div>

          <p className="text-sm text-gray-900 dark:text-gray-100 dark:text-gray-100 break-words">{comment.content}</p>

          {/* Reactions */}
          {hasReactions && (
            <div className="flex items-center space-x-1 mt-2">
              <div className="flex items-center space-x-1">
                {comment.reactions.slice(0, 3).map((reaction, index) => (
                  <span
                    key={index}
                    className={`text-sm ${REACTION_COLORS[reaction.type]}`}
                  >
                    {REACTION_EMOJIS[reaction.type]}
                  </span>
                ))}
              </div>
              {comment.reactionCount > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  +{comment.reactionCount - 3}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={toggleLike}
              className={`flex items-center space-x-1 text-xs hover:text-blue-500 transition-colors ${isLiked ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400'
                }`}
            >
              <ThumbsUp className="w-3 h-3" />
              <span>Me gusta</span>
            </button>

            <button
              onClick={handleReply}
              className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              <span>Responder</span>
            </button>

            <button
              onClick={() => setShowReactions(true)}
              className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
            >
              <Heart className="w-3 h-3" />
              <span>Reaccionar</span>
            </button>
          </div>
        </div>

        {/* Menu */}
        {(canModerate || isOwnComment) && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600 dark:bg-gray-700 transition-all"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400 dark:text-gray-500" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-8 bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 dark:border-gray-700 py-1 z-10 min-w-[120px]"
                >
                  {canModerate && (
                    <>
                      <button
                        onClick={() => handleModerate(comment.isPinned ? 'unpin' : 'pin')}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-800 dark:bg-gray-800 flex items-center space-x-2"
                      >
                        <Pin className="w-4 h-4" />
                        <span>{comment.isPinned ? 'Desfijar' : 'Fijar'}</span>
                      </button>
                      <button
                        onClick={() => handleModerate('hide')}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-800 dark:bg-gray-800"
                      >
                        Ocultar
                      </button>
                      <button
                        onClick={() => handleModerate('delete')}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                  {isOwnComment && (
                    <button
                      onClick={() => handleModerate('delete')}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Reaction Picker */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 left-12 bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 dark:border-gray-700 p-2 flex items-center space-x-2 z-20"
          >
            {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
              <button
                key={type}
                onClick={() => handleReaction(type as 'like' | 'love' | 'laugh' | 'wow' | 'angry')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-700 dark:bg-gray-700 transition-colors text-lg"
                title={type}
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
