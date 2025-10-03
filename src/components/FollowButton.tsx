"use client";

import { useState, useEffect, useRef } from 'react';
import { followUser, unfollowUser, muteUser, restrictUser } from '@/services/userService';
import { useAuth } from '@/features/auth/useAuth';
import Button from '@/design-system/components/Button';

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
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sincronizar el estado cuando cambie initialFollowing
  useEffect(() => {
    console.log('🔍 FollowButton - Sincronizando estado:', {
      userId,
      initialFollowing,
      currentFollowing: following
    });
    setFollowing(initialFollowing);
  }, [initialFollowing, userId]);

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
      console.error('Usuario no autenticado');
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
      onChange?.(true);
    } catch (error: any) {
      // Solo logear errores críticos
      if (error.response?.status >= 500) {
        console.error('Error en follow:', error);
      }
      
      // No cambiar el estado en caso de error
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
      onChange?.(false);
    } catch (error: any) {
      // Solo logear errores críticos
      if (error.response?.status >= 500) {
        console.error('Error en unfollow:', error);
      }
      
      // No cambiar el estado en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleMute = async () => {
    try {
      await muteUser(userId);
      setShowMenu(false);
      // TODO: Mostrar notificación de éxito
      console.log('Usuario silenciado exitosamente');
    } catch (error: any) {
      console.error('Error al silenciar usuario:', error);
      // TODO: Mostrar notificación de error
    }
  };

  const handleRestrict = async () => {
    try {
      await restrictUser(userId);
      setShowMenu(false);
      // TODO: Mostrar notificación de éxito
      console.log('Usuario restringido exitosamente');
    } catch (error: any) {
      console.error('Error al restringir usuario:', error);
      // TODO: Mostrar notificación de error
    }
  };

  const CheckIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const ChevronDownIcon = () => (
    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );

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
        <Button
          variant="secondary"
          size="md"
          onClick={handleClick}
          loading={loading}
          rightIcon={<ChevronDownIcon />}
          leftIcon={<CheckIcon />}
        >
          Siguiendo
        </Button>
      ) : (
        <Button
          variant="primary"
          size="md"
          gradient
          onClick={handleClick}
          loading={loading}
          leftIcon={<PlusIcon />}
        >
          Seguir
        </Button>
      )}

      {/* Menú desplegable moderno */}
      {showMenu && following && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
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
            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-all duration-200"
          >
            <MuteIcon />
            <span className="font-medium">Silenciar</span>
          </button>
          
          <button
            onClick={handleRestrict}
            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-all duration-200"
          >
            <RestrictIcon />
            <span className="font-medium">Restringir</span>
          </button>
        </div>
      )}
    </div>
  );
}
