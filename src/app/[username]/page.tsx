import { notFound } from 'next/navigation';
import { getUserProfile } from '@/services/userService';
import PostCard from '@/components/PostCard';
import FollowButton from '@/components/FollowButton';
import { useAuth } from '@/features/auth/useAuth';
import EditProfileForm from '@/components/EditProfileForm';

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

// Componente para renderizar FollowButton y EditProfileForm solo en cliente
'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
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
    <div className="max-w-2xl mx-auto mt-8">
      <div className="flex items-center gap-6 mb-6">
        {profileData.avatar ? (
          <img src={profileData.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <span className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-3xl">
            {profileData.username[0].toUpperCase()}
          </span>
        )}
        <div>
          <div className="flex items-center gap-4 mb-1">
            <div className="text-2xl font-bold">{profileData.username}</div>
            {!isOwnProfile && (
              <ProfileFollowButton userId={profileData._id} username={profileData.username} />
            )}
            {isOwnProfile && (
              <button onClick={() => setShowEdit(v => !v)} className="ml-2 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm">{showEdit ? 'Cancelar' : 'Editar perfil'}</button>
            )}
          </div>
          <div className="text-gray-600 mb-1">{profileData.bio}</div>
          <div className="flex gap-4 text-sm">
            <span><b>{profileData.posts.length}</b> publicaciones</span>
            <span><b>{profileData.followers.length}</b> seguidores</span>
            <span><b>{profileData.following.length}</b> seguidos</span>
          </div>
        </div>
      </div>
      {isOwnProfile && showEdit && (
        <EditProfileForm initialBio={profileData.bio} onProfileUpdated={() => { setShowEdit(false); reloadProfile(); }} />
      )}
      <div>
        {profileData.posts.length === 0 ? (
          <div className="text-center text-gray-500">Este usuario no ha publicado nada aún.</div>
        ) : (
          profileData.posts.map((post: any) => <PostCard key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
}

// Componente para renderizar FollowButton solo en cliente y evitar SSR
'use client';
import { useEffect, useState } from 'react';
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <>{children}</>;
}

function ProfileFollowButton({ userId, username }: { userId: string; username: string }) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  useEffect(() => {
    if (user && user.following) {
      setFollowing(user.following.includes(userId));
    }
  }, [user, userId]);
  if (!user || user.username === username) return null;
  return <FollowButton userId={userId} initialFollowing={following} onChange={setFollowing} />;
}
