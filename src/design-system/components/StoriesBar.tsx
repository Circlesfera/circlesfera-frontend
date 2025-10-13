"use client";

import React from 'react';
import Card from './Card';
import { Avatar } from '../Avatar';
import { cn } from '@/utils/cn';

// Tipo simplificado para Stories en el design system
export interface StoryPreview {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
  createdAt: string;
}

export interface UserWithStories {
  id: string;
  username: string;
  fullName?: string;
  avatar?: string;
  stories: StoryPreview[];
  storiesCount: number;
  hasUnviewedStories: boolean;
}

export interface StoriesBarProps {
  usersWithStories: UserWithStories[];
  currentUser?: {
    id: string;
    username: string;
    fullName?: string;
    avatar?: string;
  };
  loading?: boolean;
  onCreateStory?: () => void;
  onStoryClick?: (user: UserWithStories) => void;
  className?: string;
}

const StoriesBar: React.FC<StoriesBarProps> = ({
  usersWithStories,
  currentUser,
  loading = false,
  onCreateStory,
  onStoryClick,
  className,
}) => {
  const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  const CameraIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
          {/* Loading skeletons */}
          {[...Array(8)].map((_, index) => (
            <div key={index} className="flex-shrink-0 flex flex-col items-center space-y-2 px-1">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse p-2"></div>
              <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
        {/* Create Story Button */}
        {currentUser && (
          <div className="flex-shrink-0 flex flex-col items-center space-y-2 px-1">
            <div className="relative group cursor-pointer p-2" onClick={onCreateStory}>
              <Avatar
                src={currentUser.avatar}
                alt="Tu historia"
                size="xl"
                fallback={currentUser.fullName || currentUser.username}
                variant="primary"
                interactive
              />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform duration-200">
                <PlusIcon />
              </div>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 font-medium text-center">
              Tu historia
            </span>
          </div>
        )}

        {/* Stories */}
        {usersWithStories.map((user) => (
          <div key={user.id} className="flex-shrink-0 flex flex-col items-center space-y-2 px-1">
            <div
              className="relative group cursor-pointer p-2"
              onClick={() => onStoryClick?.(user)}
            >
              <Avatar
                src={user.avatar}
                alt={user.username}
                size="xl"
                fallback={user.fullName || user.username}
                variant={user.hasUnviewedStories ? "story" : "default"}
                interactive
              />

              {/* Story count indicator */}
              {user.storiesCount > 1 && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center border-2 border-white shadow-sm dark:shadow-gray-900/50">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {user.storiesCount}
                  </span>
                </div>
              )}

              {/* Unviewed stories indicator */}
              {user.hasUnviewedStories && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
              )}
            </div>

            <span className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 font-medium text-center truncate max-w-16">
              {user.username}
            </span>
          </div>
        ))}

        {/* Empty state */}
        {usersWithStories.length === 0 && !currentUser && (
          <div className="flex-1 flex items-center justify-center py-8">
            <div className="text-center">
              <CameraIcon />
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-2">
                No hay historias para mostrar
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StoriesBar;
