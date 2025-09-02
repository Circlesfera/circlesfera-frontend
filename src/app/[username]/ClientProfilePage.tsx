"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { getFollowers, getFollowing, UserProfile, UserSuggestion } from '@/services/userService';
import { Post } from '@/services/postService';
import { Story } from '@/services/storyService';
import FollowButton from '@/components/FollowButton';
import EditProfileForm from '@/components/EditProfileForm';
import UserListModal from '@/components/UserListModal';
import ProfileTabs from '@/components/ProfileTabs';
import Link from 'next/link';

// Iconos SVG
const PostsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const VideoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const StoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

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
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  // Estadísticas calculadas desde el backend
  const stats = {
    posts: profileData?.postsCount || 0,
    reels: profileData?.reelsCount || 0,
    videos: profileData?.longVideosCount || 0,
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
    setLoadingFollowers(true);
    try {
      const data = await getFollowers(profileData._id);
      setFollowersList(data);
    } catch (error) {
      console.error('Error loading followers:', error);
      setFollowersList([]);
    } finally {
      setLoadingFollowers(false);
    }
  };
  
  const handleShowFollowing = async () => {
    if (!profileData?._id) return;
    setShowFollowing(true);
    setLoadingFollowing(true);
    try {
      const data = await getFollowing(profileData._id);
      setFollowingList(data);
    } catch (error) {
      console.error('Error loading following:', error);
      setFollowingList([]);
    } finally {
      setLoadingFollowing(false);
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
    <div className="max-w-4xl mx-auto mt-10 px-2">
      {/* Cabecera de perfil */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profileData.avatar ? (
              <img 
                src={profileData.avatar} 
                alt="avatar" 
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg" 
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-lg">
                {profileData.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>

          {/* Información del perfil */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900">{profileData.username}</h1>
              
              {!isOwnProfile && (
                <ProfileFollowButton userId={profileData._id} username={profileData.username} following={user?.following || []} />
              )}
              
              {isOwnProfile && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowEdit(v => !v)} 
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 text-sm font-semibold border border-gray-200 transition-colors shadow-sm"
                  >
                    {showEdit ? 'Cancelar' : 'Editar perfil'}
                  </button>
                  <Link 
                    href="/settings" 
                    className="p-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
                  >
                    <SettingsIcon />
                  </Link>
                </div>
              )}
            </div>

            {/* Información personal */}
            <div className="mb-6">
              {profileData.fullName && (
                <div className="font-semibold text-gray-900 mb-2">{profileData.fullName}</div>
              )}
              {profileData.bio && (
                <div className="text-gray-700 mb-2 break-words">{profileData.bio}</div>
              )}
              {profileData.website && (
                <a 
                  href={profileData.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {profileData.website}
                </a>
              )}
            </div>

            {/* Estadísticas detalladas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <PostsIcon />
                </div>
                <div className="font-bold text-xl text-gray-900">{stats.posts}</div>
                <div className="text-sm text-gray-600">Publicaciones</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <VideoIcon />
                </div>
                <div className="font-bold text-xl text-gray-900">{stats.videos}</div>
                <div className="text-sm text-gray-600">Videos</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <StoryIcon />
                </div>
                <div className="font-bold text-xl text-gray-900">{stats.stories}</div>
                <div className="text-sm text-gray-600">Stories</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="font-bold text-xl text-gray-900">{stats.likes}</div>
                <div className="text-sm text-gray-600">Me gusta</div>
              </div>
            </div>

            {/* Seguidores y seguidos */}
            <div className="flex gap-8 text-base font-medium">
              <button className="hover:underline flex items-center gap-2" onClick={handleShowFollowers}>
                <span className="font-bold text-gray-900">{stats.followers}</span>
                <span className="text-gray-600">seguidores</span>
              </button>
              <button className="hover:underline flex items-center gap-2" onClick={handleShowFollowing}>
                <span className="font-bold text-gray-900">{stats.following}</span>
                <span className="text-gray-600">siguiendo</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{stats.comments}</span>
                <span className="text-gray-600">comentarios</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edición de perfil */}
      {isOwnProfile && showEdit && (
        <div className="mb-8">
          <EditProfileForm profile={profileData} onSave={async () => { setShowEdit(false); await reloadProfile(); }} onCancel={() => setShowEdit(false)} />
        </div>
      )}



      {/* Pestañas de contenido */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <ProfileTabs 
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