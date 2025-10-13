"use client";

import { useState, useEffect, useRef } from 'react';
import { followUser, unfollowUser, muteUser, restrictUser } from '@/services/userService';
import { useAuth } from '@/features/auth/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import logger from '@/utils/logger';

export default function FollowButton({
  userId,
  initialFollowing,
  onChangeAction
}: {
  userId: string;
  initialFollowing: boolean;
  onChangeAction?: (following: boolean) => void;
}) {
  const { user } = useAuth();
  const { success, error: showError } = useNotifications();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sincronizar el estado cuando cambie initialFollowing
  useEffect(() => {

    setFollowing(initialFollowing);
  }, [initialFollowing, userId, following]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleClick = async () => {
    if (loading || !user) return;

    // Verificar autenticación antes de proceder
    if (!user) {

      return;
    }

    // Si ya está siguiendo, mostrar menú desplegable
    if (following) {
      setShowMenu(!showMenu);
      return;
    }

    // Si no está siguiendo, seguir al usuario
    setLoading(true);
    try {
      await followUser(userId);
      setFollowing(true);
      onChangeAction?.(true);
      success('¡Usuario seguido!', 'Ahora verás sus publicaciones en tu feed');
    } catch (followError: unknown) {
      logger.error('Error following user:', {
        error: followError instanceof Error ? followError.message : 'Unknown error',
        userId
      });
      showError('Error al seguir', 'No se pudo seguir al usuario. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (loading || !user) return;

    setLoading(true);
    setShowMenu(false);

    try {
      await unfollowUser(userId);
      setFollowing(false);
      onChangeAction?.(false);
      success('Usuario dejado de seguir', 'Ya no verás sus publicaciones en tu feed');
    } catch (unfollowError: unknown) {
      logger.error('Error unfollowing user:', {
        error: unfollowError instanceof Error ? unfollowError.message : 'Unknown error',
        userId
      });
      showError('Error al dejar de seguir', 'No se pudo dejar de seguir al usuario. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleMute = async () => {
    try {
      await muteUser(userId);
      setShowMenu(false);
      success('Usuario silenciado', 'No verás más sus publicaciones en tu feed');
    } catch (muteError: unknown) {
      logger.error('Error muting user:', {
        error: muteError instanceof Error ? muteError.message : 'Unknown error',
        userId
      });
      showError('Error al silenciar', 'No se pudo silenciar al usuario. Inténtalo de nuevo.');
    }
  };

  const handleRestrict = async () => {
    try {
      await restrictUser(userId);
      setShowMenu(false);
      success('Usuario restringido', 'Sus comentarios serán ocultados para ti');
    } catch (restrictError: unknown) {
      logger.error('Error restricting user:', {
        error: restrictError instanceof Error ? restrictError.message : 'Unknown error',
        userId
      });
      showError('Error al restringir', 'No se pudo restringir al usuario. Inténtalo de nuevo.');
    }
  };

  const UnfollowIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const MuteIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  );

  const RestrictIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  return (
    <div className="relative" ref={menuRef}>
      {following ? (
        <button
          onClick={handleClick}
          disabled={loading}
          className="text-xs font-semibold text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:text-gray-100 dark:text-gray-100 transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Siguiendo'}
        </button>
      ) : (
        <button
          onClick={handleClick}
          disabled={loading}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Seguir'}
        </button>
      )}

      {/* Menú desplegable moderno */}
      {showMenu && following && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 overflow-hidden">
          <button
            onClick={handleUnfollow}
            disabled={loading}
            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-all duration-200"
          >
            <UnfollowIcon />
            <span className="font-medium">Dejar de seguir</span>
          </button>

          <button
            onClick={handleMute}
            className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-800 dark:bg-gray-800 flex items-center gap-3 transition-all duration-200"
          >
            <MuteIcon />
            <span className="font-medium">Silenciar</span>
          </button>

          <button
            onClick={handleRestrict}
            className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-800 dark:bg-gray-800 flex items-center gap-3 transition-all duration-200"
          >
            <RestrictIcon />
            <span className="font-medium">Restringir</span>
          </button>
        </div>
      )}
    </div>
  );
}
