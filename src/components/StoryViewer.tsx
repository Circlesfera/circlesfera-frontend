import React from 'react';
import { Story } from '@/services/storyService';

interface Props {
  stories: Story[];
  storyIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function StoryViewer({ stories, storyIndex, onClose, onPrev, onNext }: Props) {
  const story = stories[storyIndex];
  if (!story) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-lg max-w-xs w-full p-4 flex flex-col items-center">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl">×</button>
        <div className="w-56 h-56 rounded-lg overflow-hidden mb-2">
          <img src={story.image} alt="story" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          {story.user.avatar ? (
            <img src={story.user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
              {story.user.username[0].toUpperCase()}
            </span>
          )}
          <span className="font-semibold">{story.user.username}</span>
        </div>
        <div className="flex justify-between w-full mt-2">
          <button onClick={onPrev} disabled={storyIndex === 0} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Anterior</button>
          <button onClick={onNext} disabled={storyIndex === stories.length - 1} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Siguiente</button>
        </div>
      </div>
    </div>
  );
}
