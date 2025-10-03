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
  }, [initialFollowing, userId]);

  const handleClick = async () => {
    if (loading || !user) return;
    
    // Verificar autenticación antes de proceder
    if (!user) {
      console.error('Usuario no autenticado');
      return;
    }
    
    console.log('🔍 FollowButton - Iniciando acción:', {
      userId,
      following,
      currentUser: user.username,
      action: following ? 'unfollow' : 'follow'
    });
    
    setLoading(true);
    try {
      if (following) {
        console.log('🔍 FollowButton - Ejecutando unfollowUser para userId:', userId);
        await unfollowUser(userId);
        setFollowing(false);
        onChange?.(false);
        console.log('✅ FollowButton - Unfollow exitoso');
      } else {
        console.log('🔍 FollowButton - Ejecutando followUser para userId:', userId);
        await followUser(userId);
        setFollowing(true);
        onChange?.(true);
        console.log('✅ FollowButton - Follow exitoso');
      }
    } catch (error: any) {
      console.error('Error en follow/unfollow:', {
        error: error,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Mostrar mensaje de error al usuario
      alert(`Error: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
      
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
            ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 hover:scale-105 border border-red-200' 
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Dejar de seguir
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
