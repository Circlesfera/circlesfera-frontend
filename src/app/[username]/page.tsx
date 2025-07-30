import { notFound } from 'next/navigation';
import { getUserProfile } from '@/services/userService';
import PostCard from '@/components/PostCard';
import FollowButton from '@/components/FollowButton';
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

  // Obtener usuario autenticado (solo en cliente)
  // Para SSR, FollowButton se renderiza solo si no es el propio usuario
  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="flex items-center gap-6 mb-6">
        {profile.avatar ? (
          <img src={profile.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <span className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-3xl">
            {profile.username[0].toUpperCase()}
          </span>
        )}
        <div>
          <div className="flex items-center gap-4 mb-1">
            <div className="text-2xl font-bold">{profile.username}</div>
            {/* Botón seguir solo si no es el propio usuario */}
            <ClientOnly>
              <ProfileFollowButton userId={profile._id} username={profile.username} />
            </ClientOnly>
          </div>
          <div className="text-gray-600 mb-1">{profile.bio}</div>
          <div className="flex gap-4 text-sm">
            <span><b>{profile.posts.length}</b> publicaciones</span>
            <span><b>{profile.followers.length}</b> seguidores</span>
            <span><b>{profile.following.length}</b> seguidos</span>
          </div>
        </div>
      </div>
      <div>
        {profile.posts.length === 0 ? (
          <div className="text-center text-gray-500">Este usuario no ha publicado nada aún.</div>
        ) : (
          profile.posts.map(post => <PostCard key={post._id} post={post} />)
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
