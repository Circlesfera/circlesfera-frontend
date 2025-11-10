'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { type CSSProperties,type ReactElement,useState } from 'react';
import { toast } from 'sonner';

import { VerifiedBadge } from '@/components/verified-badge';
import { getAvatarUrl } from '@/lib/image-utils';
import { logger } from '@/lib/logger';
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
}

/**
 * Carousel horizontal de usuarios sugeridos para la página de explorar
 * Diseño integrado y fluido dentro del flujo de descubrimiento
 */
export function SuggestedUsersCarousel(): ReactElement {
  const currentUser = useSessionStore((state) => state.user);
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  const { data: suggestedUsers = [], isLoading } = useQuery<SuggestedUser[]>({
    queryKey: ['suggested-users', currentUser?.id, 'carousel'],
    queryFn: async () => {
      if (!currentUser) return [];
      
      try {
        const users = await searchUsers({ q: 'a', limit: 20 });
        const filtered = users
          .filter((user) => user.id !== currentUser.id)
          .slice(0, 10)
          .map((user) => ({
            id: user.id,
            handle: user.handle,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            isVerified: user.isVerified ?? false,
            bio: user.bio
          }));
        return filtered;
      } catch (error) {
        logger.error('Error al obtener usuarios sugeridos (carousel)', error);
        return [];
      }
    },
    enabled: Boolean(currentUser) && isHydrated && !!accessToken,
    staleTime: 1000 * 60 * 5,
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
      void queryClient.invalidateQueries({ queryKey: ['suggested-users', currentUser?.id, 'carousel'] });
    }
  });

  const handleFollow = (user: SuggestedUser): void => {
    followMutation.mutate({ handle: user.handle, userId: user.id });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8"
    >
      {/* Header del carousel */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Descubre creadores</h2>
          <p className="text-xs text-slate-400/80">Explora perfiles que te pueden interesar</p>
        </div>
        <Link
          href="/explore"
          className="text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors hidden sm:block"
        >
          Ver todo
        </Link>
      </div>

      {/* Estado de carga */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide justify-center md:justify-start">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-32 sm:w-36 animate-pulse">
              <div className="aspect-square rounded-2xl bg-slate-800/50 mb-3" />
              <div className="h-4 w-20 bg-slate-800/50 rounded mb-2" />
              <div className="h-3 w-16 bg-slate-800/50 rounded" />
            </div>
          ))}
        </div>
      ) : suggestedUsers.length === 0 ? (
        <div className="py-8 text-center rounded-2xl glass-card border border-white/5">
          <div className="mb-3 flex justify-center">
            <div className="size-12 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center">
              <svg className="size-6 text-primary-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-slate-400/70">No hay sugerencias disponibles en este momento</p>
        </div>
      ) : (
        /* Carousel horizontal */
        <div className="relative">
          <div
            className="flex gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-hide justify-center md:justify-start"
            style={{
              WebkitOverflowScrolling: 'touch'
            } as CSSProperties}
          >
            {suggestedUsers.map((user, index) => {
              const isFollowing = followedUsers.has(user.id);
              const isFollowingMutation = followMutation.isPending;

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex-shrink-0 w-32 sm:w-36"
                >
                  <div className="group relative bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10">
                    {/* Avatar */}
                    <Link
                      href={`/${user.handle}`}
                      className="block mb-3"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden ring-2 ring-white/10 group-hover:ring-primary-400/40 transition-all duration-300">
                        <Image
                          src={getAvatarUrl(user.avatarUrl, user.handle)}
                          alt={user.displayName}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          unoptimized
                        />
                      </div>
                    </Link>

                    {/* Información del usuario */}
                    <div className="mb-3">
                      <Link
                        href={`/${user.handle}`}
                        className="block group/link"
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-sm font-semibold text-white group-hover/link:text-primary-400 transition-colors truncate block">
                            {user.displayName}
                          </span>
                          {user.isVerified && (
                            <VerifiedBadge size="sm" className="shrink-0" />
                          )}
                        </div>
                        <span className="text-xs text-slate-400/70 block truncate">
                          @{user.handle}
                        </span>
                      </Link>
                    </div>

                    {/* Botón seguir */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => {
                        handleFollow(user);
                      }}
                      disabled={isFollowingMutation}
                      className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-300 ${
                        isFollowing
                          ? 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                          : 'bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isFollowingMutation ? (
                        <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent inline-block" />
                      ) : isFollowing ? (
                        'Siguiendo'
                      ) : (
                        'Seguir'
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

