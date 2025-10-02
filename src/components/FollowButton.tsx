"use client";

import { useState, useEffect } from 'react';
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
  const { user } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  // Sincronizar el estado cuando cambie initialFollowing
  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  const handleClick = async () => {
    if (loading || !user) return;
    
    // Verificar autenticación antes de proceder
    if (!user) {
      return;
    }
    
    setLoading(true);
    try {
      if (following) {
        await unfollowUser(userId);
        setFollowing(false);
        onChange?.(false);
      } else {
        await followUser(userId);
        setFollowing(true);
        onChange?.(true);
      }
    } catch (error: any) {
      // Solo logear errores críticos
      if (error.response?.status >= 500) {
        console.error('Error en follow/unfollow:', error);
      }
      
      // No cambiar el estado en caso de error
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
        loading 
          ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
          : following 
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105' 
            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:scale-105 shadow-md hover:shadow-lg'
      }`}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <span>...</span>
        </div>
      ) : following ? (
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Siguiendo
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Seguir
        </span>
      )}
    </button>
  );
}
