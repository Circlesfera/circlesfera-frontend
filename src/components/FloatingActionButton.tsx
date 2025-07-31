"use client";

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import CreatePostForm from './CreatePostForm';
import CreateStoryForm from './CreateStoryForm';

// Iconos SVG
const PlusIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const PostIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const StoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface FloatingActionButtonProps {
  onPostCreated?: () => void;
  onStoryCreated?: () => void;
}

export default function FloatingActionButton({ onPostCreated, onStoryCreated }: FloatingActionButtonProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showStoryForm, setShowStoryForm] = useState(false);

  const handlePostCreated = () => {
    setShowPostForm(false);
    setIsOpen(false);
    onPostCreated?.();
  };

  const handleStoryCreated = () => {
    setShowStoryForm(false);
    setIsOpen(false);
    onStoryCreated?.();
  };

  if (!user) return null;

  return (
    <>
      {/* Botón flotante principal */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
        >
          {isOpen ? <CloseIcon /> : <PlusIcon />}
        </button>

        {/* Menú desplegable */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[200px]">
            <div className="space-y-1">
              <button
                onClick={() => setShowPostForm(true)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <PostIcon />
                <span className="font-medium text-gray-900">Crear publicación</span>
              </button>
              
              <button
                onClick={() => setShowStoryForm(true)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <StoryIcon />
                <span className="font-medium text-gray-900">Crear story</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear post */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Crear publicación</h2>
                <button
                  onClick={() => setShowPostForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
              <CreatePostForm onPostCreated={handlePostCreated} />
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear story */}
      {showStoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Crear story</h2>
                <button
                  onClick={() => setShowStoryForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
              <CreateStoryForm onStoryCreated={handleStoryCreated} />
            </div>
          </div>
        </div>
      )}
    </>
  );
} 