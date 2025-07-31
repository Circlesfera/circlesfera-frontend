import React, { useState } from 'react';
import { followUser, unfollowUser } from '@/services/userService';
import { useAuth } from '@/features/auth/useAuth';

// Iconos SVG modernos
const UserPlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const UserCheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

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
      className={`
        px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center space-x-2
        ${loading 
          ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
          : following 
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800 border border-gray-200' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:scale-105'
        }
      `}
    >
      {loading ? (
        <>
          <SpinnerIcon />
          <span>...</span>
        </>
      ) : following ? (
        <>
          <UserCheckIcon />
          <span>Siguiendo</span>
        </>
      ) : (
        <>
          <UserPlusIcon />
          <span>Seguir</span>
        </>
      )}
    </button>
  );
}
