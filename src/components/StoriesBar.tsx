"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { getUsersWithStories, UserWithStories } from '@/services/storyService';
import { useAuth } from '@/features/auth/useAuth';
import StoryViewer from './StoryViewer';
import StorySkeleton from './StorySkeleton';
import CreateStoryForm from './CreateStoryForm';

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

const CameraIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function StoriesBar() {
  const { user } = useAuth();
  const [usersWithStories, setUsersWithStories] = useState<UserWithStories[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithStories | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchUsersWithStories = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      const response = await getUsersWithStories();
      if (response.success) {
        setUsersWithStories(response.users);
      }
    } catch (error) {
      console.error('Error fetching users with stories:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsersWithStories();
  }, [fetchUsersWithStories]);

  const openViewer = useCallback((userWithStories: UserWithStories) => {
    setSelectedUser(userWithStories);
    setViewerOpen(true);
  }, []);

  const closeViewer = useCallback(() => {
    setViewerOpen(false);
    setSelectedUser(null);
  }, []);

  const handleCreateStory = useCallback(() => {
    setShowCreateForm(true);
  }, []);

  const handleStoryCreated = useCallback(() => {
    // Recargar la lista de usuarios con stories
    fetchUsersWithStories();
    setShowCreateForm(false);
  }, [fetchUsersWithStories]);

  const handleStoryDeleted = useCallback(() => {
    // Recargar la lista de usuarios con stories
    fetchUsersWithStories();
  }, [fetchUsersWithStories]);

  const handleCloseCreateForm = useCallback(() => {
    setShowCreateForm(false);
  }, []);

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const storyDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - storyDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'ahora';
    if (diffInHours < 24) return `${diffInHours}h`;
    return storyDate.toLocaleDateString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Header mejorado - Optimizado para móvil */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <StoryIcon />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Historias</h2>
            <p className="text-gray-500 text-xs">Momentos que duran 24 horas</p>
          </div>
        </div>

        <button
          onClick={handleCreateStory}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 group"
        >
          <CameraIcon />
        </button>
      </div>

      {/* Contenedor de stories con scroll horizontal - Optimizado para móvil */}
      <div className="relative">
        <div className="flex gap-3 sm:gap-4 overflow-x-auto py-4 sm:py-6 px-4 sm:px-6 scrollbar-hide">
          {/* Tu historia actual (si existe) */}
          {(() => {
            const currentUserStory = usersWithStories.find(user => user._id === user?._id);
            return currentUserStory ? (
              <button
                className="flex flex-col items-center min-w-[70px] sm:min-w-[80px] flex-shrink-0 focus:outline-none group"
                onClick={() => openViewer(currentUserStory)}
              >
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 mb-2 sm:mb-3">
                  <div className="w-full h-full rounded-full border-2 border-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 p-0.5 group-hover:scale-105 transition-all duration-200">
                    <div className="w-full h-full rounded-full bg-white p-0.5">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt="avatar"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs sm:text-sm">
                          {user?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Indicador de tiempo */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-xs font-medium text-gray-900 truncate max-w-[56px] sm:max-w-[64px] block">
                    Tu historia
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(currentUserStory.latestStory.createdAt)}
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex flex-col items-center min-w-[70px] sm:min-w-[80px] flex-shrink-0">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 mb-2 sm:mb-3">
                  <div className="w-full h-full rounded-full border-2 border-gray-300 bg-white p-0.5">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt="avatar"
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs sm:text-sm">
                          {user?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Botón de agregar */}
                  <button
                    onClick={handleCreateStory}
                    className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-all duration-200 group"
                  >
                    <PlusIcon />
                  </button>
                </div>
                <span className="text-xs text-center text-gray-600 font-medium">
                  Tu historia
                </span>
              </div>
            );
          })()}

          {/* Usuarios con stories */}
          {loading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <StorySkeleton />
                </div>
              ))}
            </>
          ) : usersWithStories.length === 0 ? (
            <div className="flex items-center justify-center w-full py-8 sm:py-12">
                <div className="text-center px-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <StoryIcon />
                  </div>
                  <h3 className="text-gray-700 font-medium mb-2 text-sm sm:text-base">No hay historias aún</h3>
                  <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">¡Sé el primero en crear una historia!</p>
                  <button
                    onClick={handleCreateStory}
                    className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-xs sm:text-sm font-medium"
                  >
                    Crear mi primera historia
                  </button>
                </div>
              </div>
            ) : (
              usersWithStories
                .filter(userWithStories => userWithStories._id !== user?._id) // Excluir al usuario actual ya que se muestra arriba
                .map((userWithStories) => (
                  <button
                    key={userWithStories._id}
                    className="flex flex-col items-center min-w-[70px] sm:min-w-[80px] flex-shrink-0 focus:outline-none group"
                    onClick={() => openViewer(userWithStories)}
                  >
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 mb-2 sm:mb-3">
                      <div className="w-full h-full rounded-full border-2 border-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 p-0.5 group-hover:scale-105 transition-all duration-200">
                        <div className="w-full h-full rounded-full bg-white p-0.5">
                          <img
                            src={userWithStories.avatar || '/default-avatar.png'}
                            alt="avatar"
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                      </div>
                      {/* Indicador de tiempo */}
                      <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-medium text-gray-900 truncate max-w-[56px] sm:max-w-[64px] block">
                        {userWithStories.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(userWithStories.latestStory.createdAt)}
                      </span>
                    </div>
                  </button>
                ))
              )}
        </div>

        {/* Indicadores de scroll */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Viewer de stories */}
      {viewerOpen && selectedUser && (
        <StoryViewer
          story={selectedUser.latestStory}
          userId={selectedUser._id}
          username={selectedUser.username}
          onClose={closeViewer}
          onStoryDeleted={handleStoryDeleted}
        />
      )}

      {/* Modal para crear story */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <CreateStoryForm
            onStoryCreated={handleStoryCreated}
            onClose={handleCloseCreateForm}
          />
        </div>
      )}
    </>
  );
}
