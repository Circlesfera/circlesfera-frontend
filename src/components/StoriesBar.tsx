import React, { useEffect, useState } from 'react';
import { getStories, Story } from '@/services/storyService';
import { useAuth } from '@/features/auth/useAuth';
import CreateStoryForm from './CreateStoryForm';
import StoryViewer from './StoryViewer';
import StorySkeleton from './StorySkeleton';

// Iconos SVG modernos
const StoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default function StoriesBar() {
  const { token, user } = useAuth();
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
    <div className="card-modern mb-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <StoryIcon />
          <h2 className="font-semibold text-gray-900 text-sm">Historias</h2>
        </div>
        <CreateStoryForm onStoryCreated={fetchStories} />
      </div>
      
      {/* Contenedor de stories con scroll horizontal */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto py-4 px-4 scrollbar-hide">
          {/* Story para crear nuevo */}
          <div className="flex flex-col items-center min-w-[80px] group">
            <div className="relative w-16 h-16 mb-2">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-0.5">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="avatar" 
                      className="w-14 h-14 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-lg">
                      {user?.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <PlusIcon />
              </div>
            </div>
            <span className="text-xs text-center text-gray-600 font-medium">
              Tu historia
            </span>
          </div>

          {/* Stories existentes */}
          {loading ? (
            <>
              {[...Array(5)].map((_, i) => <StorySkeleton key={i} />)}
            </>
          ) : stories.length === 0 ? (
            <div className="flex items-center justify-center w-full py-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <StoryIcon />
                </div>
                <p className="text-gray-500 text-sm">No hay historias aún</p>
                <p className="text-gray-400 text-xs">¡Sé el primero en crear una!</p>
              </div>
            </div>
          ) : (
            stories.map((story, idx) => (
              <button 
                key={story._id} 
                className="flex flex-col items-center min-w-[80px] focus:outline-none group animate-fade-in" 
                onClick={() => openViewer(idx)}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="relative w-16 h-16 mb-2 group-hover:scale-105 transition-transform duration-200">
                  {/* Borde animado */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-0.5 animate-spin-slow">
                    <div className="w-full h-full rounded-full bg-white p-0.5">
                      <img 
                        src={story.user.avatar || '/default-avatar.png'} 
                        alt="avatar" 
                        className="w-full h-full object-cover rounded-full" 
                      />
                    </div>
                  </div>
                  
                  {/* Indicador de visto - se puede implementar cuando se agregue la funcionalidad */}
                  {/* {story.viewed && (
                    <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                    </div>
                  )} */}
                </div>
                <span className="text-xs text-center truncate max-w-[72px] text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                  {story.user.username}
                </span>
              </button>
            ))
          )}
        </div>
        
        {/* Indicadores de scroll */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      </div>

      {/* Viewer de stories */}
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
