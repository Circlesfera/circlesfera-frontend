import React, { useEffect, useState, useRef } from 'react';
import { getUserStories, Story } from '@/services/storyService';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  userId: string;
  username: string;
  onClose: () => void;
}

// Iconos SVG
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ReplyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

export default function StoryViewer({ userId, username, onClose }: Props) {
  const [stories, setStories] = useState<Story[]>([]);
  const [storyIndex, setStoryIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const progressRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar stories del usuario
  useEffect(() => {
    const loadUserStories = async () => {
      try {
        setLoading(true);
        const response = await getUserStories(username);
        if (response.success) {
          setStories(response.stories);
        }
      } catch (error) {
        console.error('Error loading user stories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserStories();
  }, [username]);

  useEffect(() => {
    if (stories.length > 0) {
      setShow(true);
      startProgress();
    }
    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [stories, storyIndex]);

  const startProgress = () => {
    setProgress(0);
    setIsPaused(false);
    
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }

    progressRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (storyIndex < stories.length - 1) {
            setStoryIndex(prev => prev + 1);
          } else {
            onClose();
          }
          return 0;
        }
        return prev + 1;
      });
    }, 50); // 5 segundos total (50ms * 100)
  };

  const pauseProgress = () => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }
  };

  const resumeProgress = () => {
    startProgress();
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      setStoryIndex(prev => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowRight') {
      setStoryIndex(prev => Math.min(stories.length - 1, prev + 1));
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const story = stories[storyIndex];

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white">Cargando historias...</div>
      </div>
    );
  }

  if (!story || stories.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white">No hay historias disponibles</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (story.type) {
      case 'image':
        return (
          <img 
            src={story.content.image?.url} 
            alt={story.content.image?.alt || "story"} 
            className="w-full h-full object-cover" 
          />
        );
      
      case 'video':
        return (
          <video 
            src={story.content.video?.url}
            poster={story.content.video?.thumbnail}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
          />
        );
      
      case 'text':
        const textStyle = story.content.text;
        return (
          <div 
            className="w-full h-full flex items-center justify-center p-8"
            style={{
              backgroundColor: textStyle?.backgroundColor || '#000000',
              color: textStyle?.textColor || '#ffffff',
              fontSize: `${textStyle?.fontSize || 24}px`,
              fontFamily: textStyle?.fontFamily || 'Arial'
            }}
          >
            <div className="text-center">
              {textStyle?.content}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black"
          onMouseEnter={pauseProgress}
          onMouseLeave={resumeProgress}
        >
          {/* Barra de progreso */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4">
            <div className="flex gap-2">
              {stories.map((_, index) => (
                <div key={index} className="flex-1 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: index === storyIndex ? `${progress}%` : 
                             index < storyIndex ? '100%' : '0%' 
                    }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Header con información del usuario */}
          <div className="absolute top-16 left-0 right-0 z-10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                  {story.user.avatar ? (
                    <img 
                      src={story.user.avatar} 
                      alt="avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white text-sm">
                      {story.user.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">
                    {story.user.username}
                  </div>
                  <div className="text-white text-opacity-70 text-xs">
                    {new Date(story.createdAt).toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-200"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-full max-w-md h-full">
              {renderContent()}
            </div>
          </div>

          {/* Navegación */}
          <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
            <button
              onClick={() => setStoryIndex(prev => Math.max(0, prev - 1))}
              disabled={storyIndex === 0}
              className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-200 pointer-events-auto disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronLeftIcon />
            </button>
            
            <button
              onClick={() => setStoryIndex(prev => Math.min(stories.length - 1, prev + 1))}
              disabled={storyIndex === stories.length - 1}
              className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-200 pointer-events-auto disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronRightIcon />
            </button>
          </div>

          {/* Acciones */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
            <div className="flex items-center justify-center space-x-6">
              <button className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-200">
                <HeartIcon />
              </button>
              
              <button className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-200">
                <ReplyIcon />
              </button>
              
              <button className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-200">
                <ShareIcon />
              </button>
            </div>
          </div>

          {/* Caption */}
          {story.caption && (
            <div className="absolute bottom-20 left-0 right-0 z-10 p-4">
              <div className="text-center">
                <p className="text-white text-sm bg-black bg-opacity-50 rounded-lg px-4 py-2 inline-block">
                  {story.caption}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
