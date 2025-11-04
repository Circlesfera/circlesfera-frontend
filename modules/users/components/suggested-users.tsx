'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactElement } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { searchUsers } from '@/services/api/users';
import { followUser, unfollowUser } from '@/services/api/follows';
import { useSessionStore } from '@/store/session';
import { getAvatarUrl } from '@/lib/image-utils';
import { VerifiedBadge } from '@/components/verified-badge';
import { fadeUpVariants } from '@/lib/motion-config';
import { toast } from 'sonner';

interface SuggestedUser {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  isVerified: boolean;
  bio: string | null;
  following?: boolean;
}

/**
 * Componente que muestra usuarios sugeridos en una barra lateral.
 * Usa el endpoint de búsqueda para obtener usuarios, pero puede ser fácilmente
 * reemplazado con un endpoint específico de sugerencias.
 */
export function SuggestedUsers(): ReactElement {
  const currentUser = useSessionStore((state) => state.user);
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  // Obtener usuarios sugeridos - por ahora usamos búsqueda aleatoria
  // TODO: Reemplazar con endpoint específico de sugerencias cuando esté disponible
  const { data: suggestedUsers = [], isLoading } = useQuery<SuggestedUser[]>({
    queryKey: ['suggested-users', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      
      try {
        // Intentar obtener usuarios con una búsqueda simple
        // En producción, esto debería ser un endpoint específico como /users/suggestions
        const users = await searchUsers({ q: 'a', limit: 20 });
        const filtered = users
          .filter((user) => user.id !== currentUser.id)
          .slice(0, 5)
          .map((user) => ({
            id: user.id,
            handle: user.handle,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            isVerified: user.isVerified ?? false,
            bio: user.bio,
            following: false
          }));
        return filtered;
      } catch (error) {
        console.error('Error fetching suggested users:', error);
        return [];
      }
    },
    enabled: Boolean(currentUser) && isHydrated && !!accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1
  });

  const followMutation = useMutation({
    mutationFn: async ({ handle, userId }: { handle: string; userId: string }) => {
      const isFollowing = followedUsers.has(userId);
      if (isFollowing) {
        await unfollowUser(handle);
        return { following: false };
      }
      await followUser(handle);
      return { following: true };
    },
    onMutate: async ({ userId }) => {
      // Optimistic update
      const wasFollowing = followedUsers.has(userId);
      setFollowedUsers((prev) => {
        const newSet = new Set(prev);
        if (wasFollowing) {
          newSet.delete(userId);
        } else {
          newSet.add(userId);
        }
        return newSet;
      });
    },
    onSuccess: (data, variables) => {
      if (data.following) {
        toast.success('Ahora sigues a este usuario');
      } else {
        toast.success('Has dejado de seguir a este usuario');
      }
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error, variables) => {
      // Revertir cambio optimista
      setFollowedUsers((prev) => {
        const newSet = new Set(prev);
        if (followedUsers.has(variables.userId)) {
          newSet.delete(variables.userId);
        } else {
          newSet.add(variables.userId);
        }
        return newSet;
      });
      toast.error('Error al actualizar la relación');
    }
  });

  const handleFollow = (user: SuggestedUser): void => {
    followMutation.mutate({ handle: user.handle, userId: user.id });
  };

  if (isLoading) {
    return (
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="sticky top-6 rounded-2xl glass-card p-5"
      >
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white mb-1">Usuarios sugeridos</h2>
          <p className="text-xs text-slate-400">Descubre nuevas cuentas</p>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="size-10 rounded-full bg-slate-800/50" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-slate-800/50 rounded mb-2" />
                <div className="h-3 w-32 bg-slate-800/50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (suggestedUsers.length === 0) {
    return <></>;
  }

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="sticky top-6 rounded-2xl glass-card p-5"
    >
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gradient-primary mb-1">Usuarios sugeridos</h2>
        <p className="text-xs text-slate-400">Descubre nuevas cuentas</p>
      </div>

      <div className="space-y-4">
        {suggestedUsers.map((user) => {
          const isFollowing = followedUsers.has(user.id);
          const isFollowingMutation = followMutation.isPending;

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 group"
            >
              <Link
                href={`/${user.handle}`}
                className="relative size-11 shrink-0 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-primary-400/30 transition-all duration-300"
              >
                <Image
                  src={getAvatarUrl(user.avatarUrl, user.handle)}
                  alt={user.displayName}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  unoptimized
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/${user.handle}`}
                  className="block hover:text-primary-400 transition-colors"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm font-semibold text-white truncate">
                      {user.displayName}
                    </span>
                    {user.isVerified && <VerifiedBadge size="sm" />}
                  </div>
                  <span className="text-xs text-slate-400 block truncate">
                    @{user.handle}
                  </span>
                </Link>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  handleFollow(user);
                }}
                disabled={isFollowingMutation}
                className={`shrink-0 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ${
                  isFollowing
                    ? 'glass-dark text-slate-300 hover:bg-white/10 hover:text-white'
                    : 'bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isFollowingMutation ? (
                  <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : isFollowing ? (
                  'Siguiendo'
                ) : (
                  'Seguir'
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      <Link
        href="/explore"
        className="mt-5 block text-center text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors"
      >
        Ver más sugerencias →
      </Link>
    </motion.div>
  );
}

