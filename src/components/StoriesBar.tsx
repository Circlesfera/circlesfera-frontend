import React, { useEffect, useState } from 'react';
import { getStories, Story } from '@/services/storyService';
import { useAuth } from '@/features/auth/useAuth';
import CreateStoryForm from './CreateStoryForm';

export default function StoriesBar() {
  const { token } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="w-full flex flex-col items-center mb-6">
      <CreateStoryForm onStoryCreated={fetchStories} />
      <div className="flex gap-4 overflow-x-auto py-2 w-full">
        {loading ? (
          <div className="text-gray-400 text-sm">Cargando stories...</div>
        ) : stories.length === 0 ? (
          <div className="text-gray-400 text-sm">No hay stories aún.</div>
        ) : (
          stories.map(story => (
            <div key={story._id} className="flex flex-col items-center min-w-[70px]">
              <div className="w-14 h-14 rounded-full border-2 border-blue-500 overflow-hidden mb-1">
                <img src={story.user.avatar || '/default-avatar.png'} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-center truncate max-w-[60px]">{story.user.username}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
