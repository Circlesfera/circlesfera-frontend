import React, { useEffect, useState } from 'react';
import { getStories, Story } from '@/services/storyService';
import { useAuth } from '@/features/auth/useAuth';
import CreateStoryForm from './CreateStoryForm';
import StoryViewer from './StoryViewer';
import StorySkeleton from './StorySkeleton';

export default function StoriesBar() {
  const { token } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchStories = () => {
    setLoading(true);
    getStories(token!).then(data => {
      setStories(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchStories();
    // eslint-disable-next-line
  }, []);

  const openViewer = (index: number) => {
    setCurrentIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => setViewerOpen(false);
  const prevStory = () => setCurrentIndex(i => Math.max(0, i - 1));
  const nextStory = () => setCurrentIndex(i => Math.min(stories.length - 1, i + 1));

  return (
    <div className="w-full flex flex-col items-center mb-8">
      <CreateStoryForm onStoryCreated={fetchStories} />
      <div className="flex gap-5 overflow-x-auto py-3 w-full px-2 md:px-0">
        {loading ? (
          <>
            {[...Array(5)].map((_, i) => <StorySkeleton key={i} />)}
          </>
        ) : stories.length === 0 ? (
          <div className="text-gray-400 text-sm">No hay stories aún.</div>
        ) : (
          stories.map((story, idx) => (
            <button key={story._id} className="flex flex-col items-center min-w-[80px] focus:outline-none group" onClick={() => openViewer(idx)}>
              <div className="w-16 h-16 rounded-full border-2 border-[var(--accent)] bg-gradient-to-tr from-[var(--accent)] to-blue-400 overflow-hidden mb-1 transition-transform duration-200 group-hover:scale-110 group-hover:shadow-lg shadow-md">
                <img src={story.user.avatar || '/default-avatar.png'} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-center truncate max-w-[70px] font-medium text-gray-700 group-hover:text-[var(--accent)] transition-colors">{story.user.username}</span>
            </button>
          ))
        )}
      </div>
      {viewerOpen && (
        <StoryViewer
          stories={stories}
          storyIndex={currentIndex}
          onClose={closeViewer}
          onPrev={prevStory}
          onNext={nextStory}
        />
      )}
    </div>
  );
}
