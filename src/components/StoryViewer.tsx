import React, { useEffect, useState } from 'react';
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
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    return () => setShow(false);
  }, []);

  if (!story) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${show ? 'bg-black bg-opacity-80' : 'bg-black bg-opacity-0 pointer-events-none'}`}>
      <div className={`relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 flex flex-col items-center transform transition-all duration-300 ${show ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold transition-colors">×</button>
        <div className="w-64 h-64 rounded-xl overflow-hidden mb-3 shadow-md">
          <img src={story.image} alt="story" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-3 mb-3">
          {story.user.avatar ? (
            <img src={story.user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[var(--accent)] shadow-sm" />
          ) : (
            <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--accent)] to-blue-400 flex items-center justify-center font-bold text-white text-lg border-2 border-white shadow-sm">
              {story.user.username[0].toUpperCase()}
            </span>
          )}
          <span className="font-semibold text-gray-800 text-base">{story.user.username}</span>
        </div>
        <div className="flex justify-between w-full mt-2 gap-2">
          <button onClick={onPrev} disabled={storyIndex === 0} className="flex-1 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors disabled:opacity-50">Anterior</button>
          <button onClick={onNext} disabled={storyIndex === stories.length - 1} className="flex-1 px-4 py-2 rounded-full bg-[var(--accent)] hover:bg-violet-700 text-white font-medium transition-colors disabled:opacity-50">Siguiente</button>
        </div>
      </div>
    </div>
  );
}
