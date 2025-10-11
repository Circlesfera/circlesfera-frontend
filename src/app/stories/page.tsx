"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Button, Avatar } from '@/design-system';
import { useAuth } from '@/features/auth/useAuth';
import { getUsersWithStories, UserWithStories } from '@/services/storyService';
import ProtectedRoute from '@/components/ProtectedRoute';
import StoryViewer from '@/components/StoryViewer';
import { Plus, ArrowLeft } from 'lucide-react';
import logger from '@/utils/logger';

export default function StoriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [stories, setStories] = useState<UserWithStories[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithStories | null>(null);
  const [isViewing, setIsViewing] = useState(false);

  // Obtener usuario inicial desde URL params
  const initialUser = searchParams.get('user');

  // Cargar stories iniciales
  useEffect(() => {
    const loadStories = async () => {
      if (authLoading || !user) return;

      try {
        setLoading(true);
        const response = await getUsersWithStories();
        if (response.success) {
          setStories(response.users || []);

          // Si hay usuario inicial, configurarlo
          if (initialUser && response.users) {
            const foundUser = response.users.find(u => u.username === initialUser);
            if (foundUser) {
              setSelectedUser(foundUser);
              setIsViewing(true);
            }
          }
        }
      } catch (error) {

      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, [user, authLoading, initialUser]);

  const handleUserSelect = (user: UserWithStories) => {
    setSelectedUser(user);
    setIsViewing(true);

    // Actualizar URL
    router.push(`/stories?user=${user.username}`);
  };

  const handleCloseViewer = () => {
    setIsViewing(false);
    setSelectedUser(null);
    router.push('/stories');
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando stories...</p>
        </div>
      </div>
    );
  }

  if (isViewing && selectedUser) {
    const currentStory = selectedUser.latestStory;

    return (
      <StoryViewer
        story={currentStory}
        userId={selectedUser._id}
        username={selectedUser.username}
        onClose={handleCloseViewer}
        onStoryDeleted={() => {
          // Recargar stories cuando se elimine una

        }}
      />
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="mr-4"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Volver
                </Button>
                <h1 className="text-xl font-semibold text-gray-900">
                  Stories
                </h1>
              </div>

              <Button
                variant="primary"
                gradient
                size="sm"
                onClick={() => router.push('/stories/create')}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Crear Story
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {stories.length === 0 ? (
            /* Empty State */
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No hay stories disponibles
              </h2>
              <p className="text-gray-600 mb-8">
                Crea tu primera story para comenzar a compartir momentos con tus amigos.
              </p>
              <Button
                variant="primary"
                gradient
                size="lg"
                onClick={() => router.push('/stories/create')}
                className="w-full"
              >
                Crear mi primera story
              </Button>
            </div>
          ) : (
            /* Stories Grid */
            <div className="space-y-6">
              {/* Add Story Card */}
              <Card className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar
                      src={user?.avatar}
                      alt="Tu story"
                      size="xl"
                      fallback={user?.fullName || user?.username || 'Tú'}
                      interactive
                      ring
                      ringColor="blue"
                    />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      Tu story
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Comparte un momento
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => router.push('/stories/create')}
                  >
                    Agregar
                  </Button>
                </div>
              </Card>

              {/* Stories List */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Todas las stories
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stories.map((userWithStories) => (
                    <Card
                      key={userWithStories._id}
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleUserSelect(userWithStories)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar
                            src={userWithStories.avatar}
                            alt={userWithStories.username}
                            size="lg"
                            fallback={userWithStories.fullName || userWithStories.username}
                            interactive
                            ring={true}
                            ringColor="purple"
                          />
                          {userWithStories.storiesCount > 1 && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                              <span className="text-xs font-bold text-gray-700">
                                {userWithStories.storiesCount}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {userWithStories.username}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {userWithStories.fullName}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {userWithStories.storiesCount} {userWithStories.storiesCount === 1 ? 'story' : 'stories'}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(userWithStories.latestStory.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
