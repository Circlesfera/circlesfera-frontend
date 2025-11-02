'use client';

import Image from 'next/image';
import { useState, type ReactElement } from 'react';

import { getStoryFeed, type StoryGroup } from '@/services/api/stories';
import { useQuery } from '@tanstack/react-query';
import { StoriesViewer } from './stories-viewer';
import { useSessionStore } from '@/store/session';

export function StoriesBar(): ReactElement {
  const currentUser = useSessionStore((state) => state.user);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['stories', 'feed'],
    queryFn: getStoryFeed,
    staleTime: 1000 * 60 // 1 minuto
  });

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0 animate-pulse">
            <div className="size-16 rounded-full bg-slate-800" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.groups.length === 0) {
    return <></>;
  }

  const handleStoryClick = (groupIndex: number): void => {
    setSelectedGroupIndex(groupIndex);
    setViewerOpen(true);
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {/* Story propia (crear nueva) */}
        {currentUser && (
          <button
            type="button"
            onClick={() => {
              // TODO: Abrir modal de crear story
              window.location.href = '/upload?type=story';
            }}
            className="relative flex-shrink-0"
          >
            <div className="relative size-16 overflow-hidden rounded-full border-2 border-slate-600">
              <Image
                src={
                  currentUser.avatarUrl ??
                  `https://api.dicebear.com/7.x/thumbs/svg?seed=${currentUser.handle}`
                }
                alt={currentUser.displayName}
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full border-2 border-slate-950 bg-primary-500">
              <svg className="size-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="mt-1 block w-16 truncate text-center text-xs text-white/70">Tu historia</span>
          </button>
        )}

        {/* Stories de usuarios seguidos */}
        {data.groups.map((group, index) => {
          const hasUnviewed = group.stories.some((story) => !story.hasViewed);
          const borderColor = hasUnviewed ? 'border-primary-500' : 'border-slate-600';

          return (
            <button
              key={group.author.id}
              type="button"
              onClick={() => {
                handleStoryClick(index);
              }}
              className="flex-shrink-0 text-center"
            >
              <div className={`relative size-16 overflow-hidden rounded-full border-2 ${borderColor}`}>
                <Image
                  src={
                    group.author.avatarUrl ??
                    `https://api.dicebear.com/7.x/thumbs/svg?seed=${group.author.handle}`
                  }
                  alt={group.author.displayName}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="mt-1 block w-16 truncate text-xs text-white/70">
                {group.author.displayName}
              </span>
            </button>
          );
        })}
      </div>

      {viewerOpen && data && (
        <StoriesViewer
          groups={data.groups}
          initialGroupIndex={selectedGroupIndex}
          onClose={() => {
            setViewerOpen(false);
          }}
        />
      )}
    </>
  );
}

