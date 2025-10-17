"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import logger from '@/utils/logger';
import { getFollowers, getFollowing, UserProfile, UserSuggestion, updateUserProfile, User } from '@/services/userService';
import { createDirectConversation } from '@/services/conversationService';
import { FollowButton, EditProfileForm } from '@/features/profile/components';
import { UserListModal } from '@/features/profile/components';
import { ModernProfileHeader, ModernProfileTabs } from '@/features/profile/components';
import { useToast } from '@/components/Toast';

// Función para convertir UserProfile a User compatible con EditProfileForm
const convertToFormData = (profile: UserProfile): User => {
  const converted = {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    avatar: profile.avatar || '',           // ✅ Siempre incluir, aunque esté vacío
    bio: profile.bio || '',                 // ✅ Siempre incluir, aunque esté vacío
    fullName: profile.fullName || '',       // ✅ Siempre incluir, aunque esté vacío
    website: profile.website || '',         // ✅ Siempre incluir, aunque esté vacío
    location: profile.location || '',       // ✅ Siempre incluir, aunque esté vacío
    phone: profile.phone || '',             // ✅ Siempre incluir, aunque esté vacío
    gender: profile.gender as 'male' | 'female' | 'other' | 'prefer-not-to-say' || 'prefer-not-to-say',
    birthDate: profile.birthDate || '',
    isPrivate: profile.isPrivate !== undefined ? profile.isPrivate : false,
    followers: profile.followers || [],
    following: profile.following || [],
    posts: profile.posts?.map(p => p.id) || [],
    savedPosts: [],
    blockedUsers: [],
    createdAt: profile.createdAt || new Date().toISOString(),
    updatedAt: profile.updatedAt || new Date().toISOString()
  } as User;


  return converted;
};

export default function ClientProfilePage({ profile }: { profile: UserProfile }) {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
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
      const response = await createDirectConversation(profile.id);

      if (response.success) {
        // Redirigir a la página de mensajes con la conversación seleccionada
        router.push(`/messages?conversation=${response.conversation.id}`);
      }
    } catch (error) {
      logger.error('Error creating conversation:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        profileId: profile.id
      });
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

        }
        setIsFollowingProfile(isFollowing);
      }
    }
  }, [profileData?.isFollowing, profileData?.id, profileData, user, isOwnProfile, isFollowingProfile]);

  const reloadProfile = useCallback(async () => {
    try {
      const { getUserProfileByUsername } = await import('@/services/userService');
      const newProfileData = await getUserProfileByUsername(profileData?.username || '');

      // Solo actualizar si los datos del servidor son diferentes a los locales
      // Esto evita sobrescribir cambios recién guardados
      setProfileData(prevData => {
        if (!prevData) return newProfileData;

        // Comparar campos críticos para ver si hay diferencias significativas
        const hasSignificantChanges =
          prevData.fullName !== newProfileData.fullName ||
          prevData.bio !== newProfileData.bio ||
          prevData.location !== newProfileData.location ||
          prevData.phone !== newProfileData.phone ||
          prevData.gender !== newProfileData.gender ||
          prevData.birthDate !== newProfileData.birthDate ||
          prevData.website !== newProfileData.website ||
          prevData.avatar !== newProfileData.avatar ||
          prevData.followersCount !== newProfileData.followersCount ||
          prevData.followingCount !== newProfileData.followingCount;

        logger.info('🔍 reloadProfile - Comparación de datos:', {
          hasSignificantChanges,
          prev: {
            location: prevData.location,
            phone: prevData.phone,
            gender: prevData.gender,
            birthDate: prevData.birthDate
          },
          new: {
            location: newProfileData.location,
            phone: newProfileData.phone,
            gender: newProfileData.gender,
            birthDate: newProfileData.birthDate
          }
        });

        if (hasSignificantChanges) {
          logger.info('🔍 reloadProfile - Actualizando con datos del servidor');
          return newProfileData;
        } else {
          logger.info('🔍 reloadProfile - No hay cambios significativos, manteniendo datos locales');
          return prevData;
        }
      });
    } catch (error) {
      // Solo logear errores críticos
      if (error instanceof Error && error.message.includes('500')) {
        logger.error('reloadProfile - Server error:', error);
      }
    }
  }, [profileData?.username]);

  // Función para manejar cambios en el seguimiento
  const handleFollowChange = useCallback(async (isFollowing: boolean) => {
    // Solo loggear en desarrollo para debugging
    if (process.env.NODE_ENV === 'development') {

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

        }
      }
    }

    // Recargar los datos del perfil para actualizar contadores
    await reloadProfile();
  }, [reloadProfile, user, refreshUser]);

  // Handlers para abrir modales
  const handleShowFollowers = async () => {
    if (!profileData?.id) return;
    setShowFollowers(true);
    try {
      const data = await getFollowers(profileData.id);
      setFollowersList(data);
    } catch (error) {
      // Solo logear errores críticos
      if (error instanceof Error && error.message.includes('500')) {

      }
      setFollowersList([]);
    }
  };

  const handleShowFollowing = async () => {
    if (!profileData?.id) return;
    setShowFollowing(true);
    try {
      const data = await getFollowing(profileData.id);
      setFollowingList(data);
    } catch (error) {
      // Solo logear errores críticos
      if (error instanceof Error && error.message.includes('500')) {

      }
      setFollowingList([]);
    }
  };

  // Mostrar loading si AuthContext está cargando
  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 px-2">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  // Verificar si profileData es válido
  if (!profileData || !profileData.username) {
    return (
      <div className="max-w-3xl mx-auto mt-10 px-2">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header del perfil moderno */}
        <ModernProfileHeader
          user={convertToFormData(profileData)}
          isOwnProfile={isOwnProfile || false}
          stats={stats}
          onEditClick={() => setShowEdit(v => !v)}
          onFollowersClick={handleShowFollowers}
          onFollowingClick={handleShowFollowing}
          onMessageClick={handleSendMessage}
          followButton={!isOwnProfile ? (
            <div className="flex flex-col gap-2">
              <ProfileFollowButton
                userId={profileData.id}
                username={profileData.username}
                isFollowing={isFollowingProfile}
                onFollowChange={handleFollowChange}
              />
            </div>
          ) : undefined}
        />

        {/* Edición de perfil */}
        {isOwnProfile && showEdit && (
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/20 rounded-xl"></div>
              <div className="relative bg-white dark:bg-gray-800 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700/50 p-4 sm:p-6">
                <EditProfileForm
                  profile={convertToFormData(profileData)}
                  onSave={async (updatedData) => {
                    try {

                      // Actualizar el perfil usando el servicio y obtener los datos actualizados del backend
                      const updatedProfile = await updateUserProfile(updatedData);

                      // Log de datos actualizados
                      logger.info('🔍 ClientProfilePage - Datos actualizados recibidos:', updatedData);
                      logger.info('🔍 ClientProfilePage - Datos devueltos por backend:', updatedProfile);

                      // Actualizar el estado local con los datos frescos del backend
                      setProfileData(prevData => {
                        if (!prevData) return prevData;
                        const newData = {
                          ...prevData,
                          avatar: updatedProfile.avatar || prevData.avatar || '',
                          bio: updatedProfile.bio || '',
                          fullName: updatedProfile.fullName || '',
                          website: updatedProfile.website || '',
                          location: updatedProfile.location || '',
                          phone: updatedProfile.phone || '',
                          gender: updatedProfile.gender || prevData.gender || 'prefer-not-to-say',
                          birthDate: updatedProfile.birthDate || '',
                          isPrivate: updatedProfile.isPrivate !== undefined ? updatedProfile.isPrivate : prevData.isPrivate || false
                        } as UserProfile;

                        logger.info('🔍 ClientProfilePage - Estado local actualizado con datos del backend:', {
                          fullName: newData.fullName,
                          location: newData.location,
                          phone: newData.phone,
                          gender: newData.gender,
                          birthDate: newData.birthDate
                        });

                        return newData;
                      });

                      // Siempre actualizar el usuario en el contexto de autenticación
                      // porque EditProfileForm ya maneja la subida del avatar internamente
                      await refreshUser();

                      // Cerrar el modal
                      setShowEdit(false);

                      // TEMPORALMENTE DESHABILITADO - reloadProfile está causando que los datos desaparezcan
                      // El problema es que reloadProfile está obteniendo datos del caché antes de que se invalide completamente
                      // setTimeout(() => {
                      //   reloadProfile().catch(error => {
                      //     logger.warn('Profile page - Background reload failed:', error);
                      //   });
                      // }, 2000);

                      // Mostrar mensaje de éxito
                      toast.success('Perfil actualizado correctamente');
                    } catch (error) {
                      logger.error('Error saving profile:', {
                        error: error instanceof Error ? error.message : 'Unknown error',
                        username: profileData?.username
                      });
                      // Mostrar error al usuario
                      toast.error('Error al guardar el perfil. Por favor, inténtalo de nuevo.');
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

  return <FollowButton userId={userId} initialFollowing={isFollowing} onChangeAction={onFollowChange} />;
}
