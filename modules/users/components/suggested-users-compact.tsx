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
 * Versión compacta de usuarios sugeridos para la página de explorar
 */
export function SuggestedUsersCompact(): ReactElement {
  const currentUser = useSessionStore((state) => state.user);
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  const { data: suggestedUsers = [], isLoading } = useQuery<SuggestedUser[]>({
    queryKey: ['suggested-users', currentUser?.id, 'compact'],
    queryFn: async () => {
      if (!currentUser) return [];
      
      try {
        const users = await searchUsers({ q: 'a', limit: 20 });
        const filtered = users
          .filter((user) => user.id !== currentUser.id)
          .slice(0, 4)
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
    onMutate: async ({ userId }) => {
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
    onSuccess: (data) => {
      if (data.following) {
        toast.success('Ahora sigues a este usuario');
      } else {
        toast.success('Has dejado de seguir a este usuario');
      }
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error, variables) => {
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

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-6 self-start rounded-2xl glass-card p-5 max-h-[calc(100vh-3rem)] overflow-y-auto border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_48px_rgba(139,92,246,0.15)] transition-all duration-300"
    >
      {/* Header compacto */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
            <svg className="size-3.5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-white">Sugerencias</h3>
        </div>
        <Link
          href="/explore"
          className="text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors"
        >
          Ver todo
        </Link>
      </div>

      {/* Estado de carga */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2 animate-pulse">
              <div className="size-10 rounded-full bg-slate-800/50" />
              <div className="flex-1">
                <div className="h-3 w-20 bg-slate-800/50 rounded mb-1.5" />
                <div className="h-2 w-16 bg-slate-800/50 rounded" />
              </div>
              <div className="h-6 w-16 rounded-lg bg-slate-800/50" />
            </div>
          ))}
        </div>
      ) : suggestedUsers.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-xs text-slate-400/70">No hay sugerencias disponibles</p>
        </div>
      ) : (
        /* Lista compacta de usuarios */
        <div className="space-y-2">
          {suggestedUsers.map((user, index) => {
          const isFollowing = followedUsers.has(user.id);
          const isFollowingMutation = followMutation.isPending;

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
            >
              <Link
                href={`/${user.handle}`}
                className="relative size-10 shrink-0 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-primary-400/40 transition-all duration-300"
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
                  className="block group/link"
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-xs font-semibold text-white group-hover/link:text-primary-400 transition-colors truncate">
                      {user.displayName}
                    </span>
                    {user.isVerified && <VerifiedBadge size="sm" />}
                  </div>
                  <span className="text-[10px] text-slate-400/70 block truncate">
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
                className={`shrink-0 px-3 py-1.5 text-[10px] font-semibold rounded-lg transition-all duration-300 ${
                  isFollowing
                    ? 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
                    : 'bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isFollowingMutation ? (
                  <span className="size-2.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
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
      )}
    </motion.div>
  );
}

