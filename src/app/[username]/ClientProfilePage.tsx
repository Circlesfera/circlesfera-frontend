"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { getFollowers, getFollowing, UserProfile, UserSuggestion } from '@/services/userService';
import { Post } from '@/services/postService';
import FollowButton from '@/components/FollowButton';
import EditProfileForm from '@/components/EditProfileForm';
import UserListModal from '@/components/UserListModal';

export default function ClientProfilePage({ profile }: { profile: UserProfile }) {
  const { user } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [profileData, setProfileData] = useState(profile);
  const isOwnProfile = user && user.username === profile.username;

  // Estado para modales de seguidores/seguidos
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState<UserSuggestion[]>([]);
  const [followingList, setFollowingList] = useState<UserSuggestion[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  const reloadProfile = async () => {
    const { getUserProfile } = await import('@/services/userService');
    setProfileData(await getUserProfile(profile.username));
  };

  // Handlers para abrir modales
  const handleShowFollowers = async () => {
    setShowFollowers(true);
    setLoadingFollowers(true);
    const data = await getFollowers(profileData._id);
    setFollowersList(data);
    setLoadingFollowers(false);
  };
  const handleShowFollowing = async () => {
    setShowFollowing(true);
    setLoadingFollowing(true);
    const data = await getFollowing(profileData._id);
    setFollowingList(data);
    setLoadingFollowing(false);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-2">
      {/* Cabecera de perfil */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
        {profileData.avatar ? (
          <img src={profileData.avatar} alt="avatar" className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-md" />
        ) : (
          <span className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center font-bold text-white text-5xl border-4 border-white shadow-md">
            {profileData.username[0].toUpperCase()}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-2 flex-wrap">
            <div className="text-3xl font-extrabold text-gray-900 truncate">{profileData.username}</div>
            {!isOwnProfile && (
              <ProfileFollowButton userId={profileData._id} username={profileData.username} following={user?.following || []} />
            )}
            {isOwnProfile && (
              <button onClick={() => setShowEdit(v => !v)} className="ml-2 px-4 py-1 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 text-sm font-semibold border border-gray-200 transition-colors shadow-sm">{showEdit ? 'Cancelar' : 'Editar perfil'}</button>
            )}
          </div>
          <div className="text-gray-700 mb-2 break-words">{profileData.bio}</div>
          <div className="flex gap-8 text-base font-medium">
            <span><b>{profileData.posts.length}</b> publicaciones</span>
            <button className="hover:underline" onClick={handleShowFollowers}>
              <b>{profileData.followers.length}</b> seguidores
            </button>
            <button className="hover:underline" onClick={handleShowFollowing}>
              <b>{profileData.following.length}</b> seguidos
            </button>
          </div>
        </div>
      </div>
      {/* Edición de perfil */}
      {isOwnProfile && showEdit && (
        <EditProfileForm profile={profileData} onSave={async () => { setShowEdit(false); await reloadProfile(); }} onCancel={() => setShowEdit(false)} />
      )}
      {/* Grid de publicaciones */}
      <div className="mt-10">
        {profileData.posts.length === 0 ? (
          <div className="text-center text-gray-500">Este usuario no ha publicado nada aún.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {profileData.posts.map((post: Post) => (
              <div key={post._id} className="aspect-square overflow-hidden rounded-xl shadow-sm bg-gray-100 cursor-pointer hover:scale-105 transition-transform">
                <img src={post.content.images?.[0]?.url || '/default-post.jpg'} alt="post" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
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