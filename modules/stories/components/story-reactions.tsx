'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type ReactElement,useState } from 'react';
import { toast } from 'sonner';

import { logger } from '@/lib/logger';
import type { StoryItem } from '@/services/api/stories';
import { type ReactionEmoji,reactToStory } from '@/services/api/story-reactions';

const ALLOWED_EMOJIS: ReactionEmoji[] = ['❤️', '😂', '😮', '😢', '👍', '🔥', '💯'];

interface StoryReactionsProps {
  readonly story: StoryItem;
}

export function StoryReactions({ story }: StoryReactionsProps): ReactElement {
  const queryClient = useQueryClient();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const reactMutation = useMutation({
    mutationFn: async (emoji: ReactionEmoji) => reactToStory(story.id, { emoji }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['stories', 'feed'] });
      void queryClient.invalidateQueries({ queryKey: ['story', story.id] });
      void queryClient.invalidateQueries({ queryKey: ['story-reactions', story.id] });
      setShowEmojiPicker(false);
    },
    onError: (error: unknown) => {
      logger.error('No se pudo registrar la reacción de story', error);
      toast.error('No se pudo registrar tu reacción');
    }
  });

  const handleEmojiClick = (emoji: ReactionEmoji): void => {
    if (reactMutation.isPending) {
      return;
    }
    reactMutation.mutate(emoji);
  };

  const totalReactions = Object.values(story.reactionCounts || {}).reduce((sum, count) => sum + count, 0);

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
      {/* Botón principal de reacción */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowEmojiPicker(!showEmojiPicker);
        }}
        className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-200 backdrop-blur-md border ${
          story.userReaction
            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-primary-400/50 shadow-lg shadow-primary-500/30 hover:scale-105'
            : 'bg-black/40 text-white border-white/20 hover:bg-black/60 hover:scale-105'
        } active:scale-95`}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        {story.userReaction ? (
          <>
            <span className="text-xl">{story.userReaction}</span>
            <span className="text-sm font-bold">
              {story.reactionCounts?.[story.userReaction] || 0}
            </span>
          </>
        ) : (
          <>
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {totalReactions > 0 && (
              <span className="text-sm font-bold">{totalReactions}</span>
            )}
          </>
        )}
      </button>

      {/* Selector de emojis */}
      {showEmojiPicker && (
        <div
          className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 flex gap-2 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 px-4 py-3 shadow-soft-lg animate-scale-in"
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          {ALLOWED_EMOJIS.map((emoji) => {
            const count = story.reactionCounts?.[emoji] || 0;
            const isSelected = story.userReaction === emoji;

            return (
              <button
                key={emoji}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEmojiClick(emoji);
                }}
                className={`relative rounded-xl p-2.5 text-2xl transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary-500/40 scale-125 ring-2 ring-primary-400/50'
                    : 'hover:bg-white/20 hover:scale-110'
                } active:scale-95`}
                disabled={reactMutation.isPending}
                title={count > 0 ? `${count} ${emoji}` : emoji}
              >
                {emoji}
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 flex min-w-[1.25rem] h-5 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-xs font-bold text-white shadow-lg shadow-primary-500/40 px-1">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

