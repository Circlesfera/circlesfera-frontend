import React, { useState } from 'react';
import { followUser, unfollowUser } from '@/services/userService';
import { useAuth } from '@/features/auth/useAuth';

export default function FollowButton({
  userId,
  initialFollowing,
  onChange
}: {
  userId: string;
  initialFollowing: boolean;
  onChange?: (following: boolean) => void;
}) {
  const { token } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (following) {
        await unfollowUser(userId, token!);
        setFollowing(false);
        onChange?.(false);
      } else {
        await followUser(userId, token!);
        setFollowing(true);
        onChange?.(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-4 py-1 rounded font-semibold text-sm transition ${following ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
    >
      {loading ? '...' : following ? 'Siguiendo' : 'Seguir'}
    </button>
  );
}
