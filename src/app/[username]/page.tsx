"use client";
import { notFound } from 'next/navigation';
import { getUserProfile } from '@/services/userService';
import PostCard from '@/components/PostCard';
import FollowButton from '@/components/FollowButton';
import EditProfileForm from '@/components/EditProfileForm';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';

const RESERVED_ROUTES = [
  'login', 'register', 'explore', 'messages', 'notifications', 'profile', 'api'
];

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  if (RESERVED_ROUTES.includes(params.username.toLowerCase())) {
    return notFound();
  }

  let profile = null;
  try {
    profile = await getUserProfile(params.username);
  } catch {
    return notFound();
  }

  return (
    <ClientOnlyProfile profile={profile} />
  );
}

function ClientOnlyProfile({ profile }: { profile: any }) {
  const { user } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [profileData, setProfileData] = useState(profile);
  const isOwnProfile = user && user.username === profile.username;

  const reloadProfile = async () => {
    const { getUserProfile } = await import('@/services/userService');
    setProfileData(await getUserProfile(profile.username));
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-2">
      {/* Cabecera de perfil */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
        {profileData.avatar ? (
          <img src={profileData.avatar} alt="avatar" className="w-32 h-32 rounded-full object-cover border-4 border-[var(--accent)] shadow-md" />
        ) : (
          <span className="w-32 h-32 rounded-full bg-gradient-to-tr from-[var(--accent)] to-blue-400 flex items-center justify-center font-bold text-white text-5xl border-4 border-white shadow-md">
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
            <span><b>{profileData.followers.length}</b> seguidores</span>
            <span><b>{profileData.following.length}</b> seguidos</span>
          </div>
        </div>
      </div>
      {/* Edición de perfil */}
      {isOwnProfile && showEdit && (
        <EditProfileForm initialBio={profileData.bio} onProfileUpdated={() => { setShowEdit(false); reloadProfile(); }} />
      )}
      {/* Grid de publicaciones */}
      <div className="mt-10">
        {profileData.posts.length === 0 ? (
          <div className="text-center text-gray-500">Este usuario no ha publicado nada aún.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {profileData.posts.map((post: any) => (
              <div key={post._id} className="aspect-square overflow-hidden rounded-xl shadow-sm bg-gray-100 cursor-pointer hover:scale-105 transition-transform">
                <img src={post.image} alt="post" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
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
