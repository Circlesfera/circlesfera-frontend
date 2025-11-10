'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { type ReactElement,useState } from 'react';
import { toast } from 'sonner';

import { VerifiedBadge } from '@/components/verified-badge';
import { getAvatarUrl } from '@/lib/image-utils';
import { logger } from '@/lib/logger';
import { fadeUpVariants } from '@/lib/motion-config';
import { followUser, unfollowUser } from '@/services/api/follows';
import { searchUsers } from '@/services/api/users';
import { useSessionStore } from '@/store/session';

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
        logger.error('Error al obtener usuarios sugeridos', error);
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
    onMutate: ({ userId }) => {
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
      return { wasFollowing };
    },
    onSuccess: (data) => {
      if (data.following) {
        toast.success('Ahora sigues a este usuario');
      } else {
        toast.success('Has dejado de seguir a este usuario');
      }
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (_error, variables, context) => {
      setFollowedUsers((prev) => {
        const newSet = new Set(prev);
        if (context?.wasFollowing) {
          newSet.add(variables.userId);
        } else {
          newSet.delete(variables.userId);
        }
        return newSet;
      });
      toast.error('Error al actualizar la relación');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['suggested-users', currentUser?.id] });
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
        className="sticky top-6 self-start rounded-2xl glass-card pl-5 pt-5 pb-5 max-h-[calc(100vh-3rem)] overflow-y-auto border border-slate-200/50 dark:border-white/5"
      >
        <div className="mb-6">
          <div className="h-6 w-32 bg-slate-800/50 rounded-lg animate-pulse mb-2" />
          <div className="h-3 w-40 bg-slate-800/30 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-slate-800/50 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 bg-slate-800/50 rounded animate-pulse" />
                <div className="h-3 w-36 bg-slate-800/30 rounded animate-pulse" />
              </div>
              <div className="h-8 w-20 bg-slate-800/50 rounded-lg animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-6 self-start rounded-2xl glass-card pl-5 pt-6 pb-6 max-h-[calc(100vh-3rem)] overflow-y-auto border border-slate-200/50 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_48px_rgba(139,92,246,0.15)] transition-all duration-300"
    >
      {/* Header mejorado */}
      <div className="mb-6 pr-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
            <svg className="size-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Usuarios sugeridos</h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400/70 ml-10">Descubre nuevas cuentas para seguir</p>
      </div>

      {suggestedUsers.length === 0 ? (
        <div className="py-12 text-center pr-5">
          <div className="mb-5 flex justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="size-16 rounded-2xl bg-gradient-to-br from-primary-500/10 via-primary-400/10 to-accent-500/10 flex items-center justify-center ring-2 ring-primary-500/10"
            >
              <svg className="size-7 text-primary-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </motion.div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400/70 mb-5 font-medium">No hay usuarios sugeridos en este momento</p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 hover:text-primary-300 transition-all duration-200 hover:gap-3 border border-primary-500/20"
          >
            <span>Explorar usuarios</span>
            <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="space-y-2 pr-5">
          {suggestedUsers.map((user, index) => {
            const isFollowing = followedUsers.has(user.id);
            const isFollowingMutation = followMutation.isPending;

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="group relative"
              >
                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300 ease-out border border-transparent hover:border-slate-300 dark:hover:border-white/5 hover:shadow-md">
                  <Link
                    href={`/${user.handle}`}
                    className="relative size-14 shrink-0 rounded-full overflow-hidden ring-2 ring-slate-300/50 dark:ring-white/10 group-hover:ring-primary-400/50 transition-all duration-300 group-hover:scale-105 group-hover:ring-2"
                  >
                    <Image
                      src={getAvatarUrl(user.avatarUrl, user.handle)}
                      alt={user.displayName}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized
                    />
                  </Link>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <Link
                      href={`/${user.handle}`}
                      className="block group/link"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover/link:text-primary-400 transition-colors truncate">
                          {user.displayName}
                        </span>
                        {user.isVerified && <VerifiedBadge size="sm" />}
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400/80 block truncate mb-1">
                        @{user.handle}
                      </span>
                      {user.bio && (
                        <p className="text-xs text-slate-600 dark:text-slate-400/60 line-clamp-2 mt-1">
                          {user.bio}
                        </p>
                      )}
                    </Link>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    type="button"
                    onClick={() => {
                      handleFollow(user);
                    }}
                    disabled={isFollowingMutation}
                    className={`shrink-0 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ease-out ${
                      isFollowing
                        ? 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-white/20 hover:shadow-lg hover:shadow-white/5'
                        : 'bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/50 hover:from-primary-500 hover:to-accent-400 hover:-translate-y-0.5'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isFollowingMutation ? (
                      <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : isFollowing ? (
                      <span className="flex items-center gap-1.5">
                        <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Siguiendo
                      </span>
                    ) : (
                      'Seguir'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {suggestedUsers.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200/50 dark:border-white/5 pr-5">
          <Link
            href="/explore"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold text-primary-400 bg-primary-500/5 hover:bg-primary-500/10 hover:text-primary-300 transition-all duration-200 group border border-primary-500/10 hover:border-primary-500/20"
          >
            <span>Ver más sugerencias</span>
            <svg className="size-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </motion.div>
  );
}

