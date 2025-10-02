"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { getFollowers, getFollowing, UserProfile, UserSuggestion } from '@/services/userService';
import { User } from '@/types';
import FollowButton from '@/components/FollowButton';
import EditProfileForm from '@/components/EditProfileForm';
import UserListModal from '@/components/UserListModal';
import ModernProfileHeader from '@/components/profile/ModernProfileHeader';
import ModernProfileInfo from '@/components/profile/ModernProfileInfo';
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
    console.log('Avatar set in convertToUser:', profile.avatar);
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
  const { user } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [profileData, setProfileData] = useState(profile);
  const isOwnProfile = user && user.username === profile?.username;

  // Estado para modales de seguidores/seguidos
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState<UserSuggestion[]>([]);
  const [followingList, setFollowingList] = useState<UserSuggestion[]>([]);

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

      const reloadProfile = useCallback(async () => {
      try {
        const { getUserProfileByUsername } = await import('@/services/userService');
        const newProfileData = await getUserProfileByUsername(profileData?.username || '');
        setProfileData(newProfileData);
      } catch (error) {
        console.error('Error al recargar perfil:', error);
      }
    }, [profileData?.username]);



  // Handlers para abrir modales
  const handleShowFollowers = async () => {
    if (!profileData?._id) return;
    setShowFollowers(true);
    try {
      const data = await getFollowers(profileData._id);
      setFollowersList(data);
    } catch (error) {
      console.error('Error loading followers:', error);
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
      console.error('Error loading following:', error);
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
          followButton={!isOwnProfile ? (
            <ProfileFollowButton 
              userId={profileData._id} 
              username={profileData.username} 
              following={user?.following || []} 
            />
          ) : undefined}
        />

        {/* Información adicional del perfil moderno */}
        <ModernProfileInfo 
          user={convertToUser(profileData)} 
          isOwnProfile={isOwnProfile || false} 
        />

        {/* Edición de perfil */}
        {isOwnProfile && showEdit && (
          <div className="mb-6">
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/40 p-4 sm:p-6">
                <EditProfileForm 
                  profile={profileData} 
                  onSave={async () => { 
                    setShowEdit(false); 
                    await reloadProfile(); 
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

function ProfileFollowButton({ userId, username, following }: { userId: string; username: string; following: string[] }) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  
  useEffect(() => {
    if (user && following) {
      setIsFollowing(following.includes(userId));
    }
  }, [user, userId, following]);
  
  if (!user || user.username === username) return null;
  
  return <FollowButton userId={userId} initialFollowing={isFollowing} onChange={setIsFollowing} />;
} 