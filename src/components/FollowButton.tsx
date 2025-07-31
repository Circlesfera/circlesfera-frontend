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
      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
        loading 
          ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
          : following 
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
    >
      {loading ? '...' : following ? 'Siguiendo' : 'Seguir'}
    </button>
  );
}
