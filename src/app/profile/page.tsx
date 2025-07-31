"use client";

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/features/auth/useAuth';
import EditProfileForm from '@/components/EditProfileForm';
import { getUserProfile, updateUserProfile, User } from '@/services/userService';

// Iconos SVG modernos
const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BookmarkIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const GridIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'liked'>('posts');


  useEffect(() => {
    if (token && user) {
      fetchProfile();
    }
  }, [token, user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      if (token) {
        const profileData = await getUserProfile(token);
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData: Partial<User>) => {
    try {
      if (token) {
        const updatedProfile = await updateUserProfile(token, updatedData);
        setProfile(updatedProfile);
        setShowEditForm(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="flex items-center space-x-8 mb-8">
                <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar perfil</h3>
            <p className="text-gray-600">No se pudo cargar la información del perfil</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header del perfil */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt="avatar" 
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-gray-100 shadow-lg" 
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    {profile.username[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* Información del perfil */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowEditForm(true)}
                        className="btn-secondary px-4 py-2 text-sm font-medium"
                      >
                        <EditIcon />
                        <span className="ml-2">Editar perfil</span>
                      </button>
                      <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <SettingsIcon />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="flex items-center space-x-8 mb-4">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{profile.postsCount || 0}</div>
                    <div className="text-sm text-gray-600">publicaciones</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{profile.followersCount || 0}</div>
                    <div className="text-sm text-gray-600">seguidores</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{profile.followingCount || 0}</div>
                    <div className="text-sm text-gray-600">siguiendo</div>
                  </div>
                </div>

                {/* Información personal */}
                <div className="space-y-2">
                  {profile.fullName && (
                    <div className="font-semibold text-gray-900">{profile.fullName}</div>
                  )}
                  {profile.bio && (
                    <div className="text-gray-700 whitespace-pre-wrap">{profile.bio}</div>
                  )}
                  {profile.website && (
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {profile.website}
                    </a>
                  )}
                  {profile.location && (
                    <div className="text-gray-600 text-sm">{profile.location}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs de contenido */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 text-sm font-medium transition-colors ${
                    activeTab === 'posts'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <GridIcon />
                  <span>PUBLICACIONES</span>
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 text-sm font-medium transition-colors ${
                    activeTab === 'saved'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <BookmarkIcon />
                  <span>GUARDADAS</span>
                </button>
                <button
                  onClick={() => setActiveTab('liked')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 text-sm font-medium transition-colors ${
                    activeTab === 'liked'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <HeartIcon />
                  <span>ME GUSTA</span>
                </button>
              </nav>
            </div>

            {/* Contenido de las tabs */}
            <div className="p-8">
              {activeTab === 'posts' && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GridIcon />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Comparte fotos y videos</h3>
                  <p className="text-gray-600 mb-6">Cuando compartas fotos y videos, aparecerán en tu perfil.</p>
                  <button className="btn-primary">
                    Compartir tu primera foto
                  </button>
                </div>
              )}

              {activeTab === 'saved' && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookmarkIcon />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Guarda fotos y videos</h3>
                  <p className="text-gray-600 mb-6">Guarda las fotos y videos que te gusten en una colección privada.</p>
                  <button className="btn-primary">
                    Explorar contenido
                  </button>
                </div>
              )}

              {activeTab === 'liked' && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HeartIcon />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Fotos y videos que te gustan</h3>
                  <p className="text-gray-600 mb-6">Las fotos y videos que te gusten aparecerán aquí.</p>
                  <button className="btn-primary">
                    Explorar contenido
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de editar perfil */}
        {showEditForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <EditProfileForm 
                profile={profile} 
                onSave={handleProfileUpdate}
                onCancel={() => setShowEditForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
