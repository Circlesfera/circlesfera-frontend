"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import { getFollowers, getFollowing, UserProfile, UserSuggestion, updateUserProfile } from '@/services/userService';
import { createDirectConversation } from '@/services/conversationService';
import { User } from '@/types';
import FollowButton from '@/components/FollowButton';
import EditProfileForm from '@/components/EditProfileForm';
import UserListModal from '@/components/UserListModal';
import ModernProfileHeader from '@/components/profile/ModernProfileHeader';
import ModernProfileTabs from '@/components/profile/ModernProfileTabs';


// Función para convertir UserProfile a User
const convertToUser = (profile: UserProfile): User => {
  const user: User = {
    _id: profile._id,
    username: profile.username,
    email: profile.email,
    followers: profile.followers || [],
    following: profile.following || [],
    posts: profile.posts?.map(post => post._id) || [],
    savedPosts: [],
    blockedUsers: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Propiedades opcionales
  if (profile.avatar) {
    user.avatar = profile.avatar;
  }
  if (profile.bio) user.bio = profile.bio;
  if (profile.fullName) user.fullName = profile.fullName;
  if (profile.website) user.website = profile.website;
  if (profile.location) user.location = profile.location;
  if (profile.phone) user.phone = profile.phone;
  if (profile.gender) user.gender = profile.gender as 'male' | 'female' | 'other' | 'prefer-not-to-say';
  if (profile.birthDate) user.birthDate = profile.birthDate;
  if (profile.isPrivate !== undefined) user.isPrivate = profile.isPrivate;

  // Propiedades con valores por defecto
  user.isVerified = false;
  user.isActive = true;
  user.lastSeen = new Date().toISOString();
  user.preferences = {
    notifications: {
      likes: true,
      comments: true,
      follows: true,
      mentions: true,
      messages: true,
      stories: true,
      posts: true
    },
    privacy: {
      showEmail: false,
      showPhone: false,
      showBirthDate: false
    }
  };

  return user;
};

export default function ClientProfilePage({ profile }: { profile: UserProfile }) {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [profileData, setProfileData] = useState(profile);
  const isOwnProfile = user && user.username === profile?.username;

  // Estado para modales de seguidores/seguidos
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState<UserSuggestion[]>([]);
  const [followingList, setFollowingList] = useState<UserSuggestion[]>([]);
  const [isFollowingProfile, setIsFollowingProfile] = useState(false);

  // Función para enviar mensaje directo
  const handleSendMessage = useCallback(async () => {
    if (!profile || isOwnProfile) return;
    
    try {
      // Crear conversación directa
      const response = await createDirectConversation(profile._id);
      
      if (response.success) {
        // Redirigir a la página de mensajes con la conversación seleccionada
        router.push(`/messages?conversation=${response.conversation._id}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      // Si falla, redirigir a la página de mensajes para que el usuario pueda crear la conversación manualmente
      router.push('/messages');
    }
  }, [profile, isOwnProfile, router]);

  // Estadísticas calculadas desde el backend
  const stats = {
    posts: profileData?.postsCount || 0,
    reels: profileData?.reelsCount || 0,
    stories: profileData?.storiesCount || 0,
    followers: profileData?.followersCount || 0,
    following: profileData?.followingCount || 0,
    likes: profileData?.totalLikes || 0,
    comments: profileData?.totalComments || 0
  };

  // Determinar si estamos siguiendo al perfil actual usando la información del backend
  useEffect(() => {
    if (user && profileData && !isOwnProfile) {
      // Usar la información isFollowing que viene del backend
      const isFollowing = profileData.isFollowing || false;
      // Loggear siempre para debugging del problema
      console.log('🔍 ClientProfilePage - Estado inicial de seguimiento:', {
        username: profileData.username,
        isFollowing,
        fromBackend: profileData.isFollowing,
        profileData: profileData,
        userFollowing: user.following
      });
      setIsFollowingProfile(isFollowing);
    }
  }, [user, profileData, isOwnProfile]);

  // Mantener el estado sincronizado cuando el perfil se actualice
  useEffect(() => {
    if (user && profileData && !isOwnProfile) {
      // Usar la información isFollowing que viene del backend
      const isFollowing = profileData.isFollowing || false;
      // Solo actualizar si el estado ha cambiado realmente
      if (isFollowing !== isFollowingProfile) {
        // Solo loggear en desarrollo para debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 ClientProfilePage - Actualizando estado de seguimiento:', {
            username: profileData.username,
            oldState: isFollowingProfile,
            newState: isFollowing
          });
        }
        setIsFollowingProfile(isFollowing);
      }
    }
  }, [profileData?.isFollowing, profileData?._id, profileData, user, isOwnProfile, isFollowingProfile]);

      const reloadProfile = useCallback(async () => {
      try {
        const { getUserProfileByUsername } = await import('@/services/userService');
        const newProfileData = await getUserProfileByUsername(profileData?.username || '');
        setProfileData(newProfileData);
      } catch (error) {
        // Solo logear errores críticos
        if (error instanceof Error && error.message.includes('500')) {
          console.error('Error al recargar perfil:', error);
        }
      }
    }, [profileData?.username]);

  // Función para manejar cambios en el seguimiento
  const handleFollowChange = useCallback(async (isFollowing: boolean) => {
    // Solo loggear en desarrollo para debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 ClientProfilePage - handleFollowChange:', {
        username: profileData?.username,
        newState: isFollowing,
        previousState: isFollowingProfile
      });
    }
    
    // Actualizar el estado local inmediatamente
    setIsFollowingProfile(isFollowing);
    
    // Actualizar el estado del perfil para reflejar el cambio
    setProfileData(prevData => {
      if (!prevData) return prevData;
      return {
        ...prevData,
        isFollowing,
        followersCount: isFollowing 
          ? (prevData.followersCount || 0) + 1 
          : Math.max((prevData.followersCount || 0) - 1, 0)
      };
    });
    
    // Actualizar el estado del usuario actual para reflejar el cambio
    if (user) {
      try {
        await refreshUser();
      } catch (error) {
        // Solo logear errores críticos
        if (error instanceof Error && error.message.includes('500')) {
          console.error('Error refreshing user after follow:', error);
        }
      }
    }
    
    // Recargar los datos del perfil para actualizar contadores
    await reloadProfile();
  }, [reloadProfile, user, refreshUser, profileData?.username, isFollowingProfile]);



  // Handlers para abrir modales
  const handleShowFollowers = async () => {
    if (!profileData?._id) return;
    setShowFollowers(true);
    try {
      const data = await getFollowers(profileData._id);
      setFollowersList(data);
    } catch (error) {
      // Solo logear errores críticos
      if (error instanceof Error && error.message.includes('500')) {
        console.error('Error loading followers:', error);
      }
      setFollowersList([]);
    }
  };
  
  const handleShowFollowing = async () => {
    if (!profileData?._id) return;
    setShowFollowing(true);
    try {
      const data = await getFollowing(profileData._id);
      setFollowingList(data);
    } catch (error) {
      // Solo logear errores críticos
      if (error instanceof Error && error.message.includes('500')) {
        console.error('Error loading following:', error);
      }
      setFollowingList([]);
    }
  };

  // Verificar si profileData es válido
  if (!profileData || !profileData.username) {
    return (
      <div className="max-w-3xl mx-auto mt-10 px-2">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Perfil no encontrado</h3>
          <p>El usuario que buscas no existe o ha sido eliminado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Header del perfil moderno */}
        <ModernProfileHeader
          user={convertToUser(profileData)}
          isOwnProfile={isOwnProfile || false}
          stats={stats}
          onEditClick={() => setShowEdit(v => !v)}
          onFollowersClick={handleShowFollowers}
          onFollowingClick={handleShowFollowing}
          onMessageClick={handleSendMessage}
          followButton={!isOwnProfile ? (
            <div className="flex flex-col gap-2">
              <ProfileFollowButton 
                userId={profileData._id} 
                username={profileData.username} 
                isFollowing={isFollowingProfile}
                onFollowChange={handleFollowChange}
              />
              {/* Debug info - remover después */}
              <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                <div>Debug Info:</div>
                <div>profileData.isFollowing: {String(profileData.isFollowing)}</div>
                <div>isFollowingProfile: {String(isFollowingProfile)}</div>
                <div>user.following includes profileData._id: {String(user?.following?.includes(profileData._id))}</div>
                <div>profileData._id: {profileData._id}</div>
                <div>user.following: {JSON.stringify(user?.following)}</div>
              </div>
            </div>
          ) : undefined}
        />


        {/* Edición de perfil */}
        {isOwnProfile && showEdit && (
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/20 rounded-xl"></div>
              <div className="relative bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100/50 p-4 sm:p-6">
                <EditProfileForm 
                  profile={profileData} 
                  onSave={async (updatedData) => { 
                    try {
                      // Actualizar el perfil usando el servicio
                      await updateUserProfile(updatedData);
                      // Actualizar el estado local
                      setProfileData(prev => ({ ...prev, ...updatedData }));
                      // Cerrar el modal
                      setShowEdit(false); 
                      // Recargar el perfil desde el servidor
                      await reloadProfile();
                    } catch (error) {
                      console.error('Error guardando perfil:', error);
                      // Mostrar error al usuario
                      alert('Error al guardar el perfil. Por favor, inténtalo de nuevo.');
                    }
                  }} 
                  onCancel={() => setShowEdit(false)} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Pestañas de contenido modernas */}
        <ModernProfileTabs 
          username={profileData.username} 
          isOwnProfile={isOwnProfile || false} 
        />
      </div>

      {/* Modales de seguidores/seguidos */}
      <UserListModal
        open={showFollowers}
        onClose={() => setShowFollowers(false)}
        users={followersList}
        title="Seguidores"
        currentUserFollowing={user?.following || []}
      />
      <UserListModal
        open={showFollowing}
        onClose={() => setShowFollowing(false)}
        users={followingList}
        title="Seguidos"
        currentUserFollowing={user?.following || []}
      />
    </div>
  );
}

function ProfileFollowButton({ 
  userId, 
  username, 
  isFollowing, 
  onFollowChange 
}: { 
  userId: string; 
  username: string; 
  isFollowing: boolean;
  onFollowChange: (isFollowing: boolean) => void;
}) {
  const { user } = useAuth();
  
  if (!user || user.username === username) return null;
  
  return <FollowButton userId={userId} initialFollowing={isFollowing} onChange={onFollowChange} />;
} 