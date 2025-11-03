'use client';

import Image from 'next/image';
import { useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import { fadeUpVariants } from '@/lib/motion-config';

import { followUser, unfollowUser } from '@/services/api/follows';
import { blockUser, unblockUser, getBlockStatus, type BlockStatusResponse } from '@/services/api/blocks';
import type { PublicProfile, UserStats } from '@/services/api/users';
import { logger } from '@/lib/logger';
import { useSessionStore } from '@/store/session';
import { toast } from 'sonner';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VerifiedBadge } from '@/components/verified-badge';
import { getAvatarUrl } from '@/lib/image-utils';

interface ProfileHeaderProps {
  readonly profile: PublicProfile;
  readonly stats: UserStats;
}

export function ProfileHeader({ profile, stats }: ProfileHeaderProps): ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = useSessionStore((state) => state.user);
  const isOwnProfile = currentUser?.id === profile.id;
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Obtener estado de bloqueo
  const { data: blockStatus } = useQuery<BlockStatusResponse>({
    queryKey: ['block-status', profile.handle],
    queryFn: () => getBlockStatus(profile.handle),
    enabled: !isOwnProfile && !!currentUser
  });

  const isBlocked = blockStatus?.isBlocked ?? false;
  const hasBlockedYou = blockStatus?.hasBlockedYou ?? false;

  const blockMutation = useMutation({
    mutationFn: () => blockUser(profile.handle),
    onSuccess: () => {
      toast.success('Usuario bloqueado');
      queryClient.invalidateQueries({ queryKey: ['block-status', profile.handle] });
      queryClient.invalidateQueries({ queryKey: ['profile', profile.handle] });
      router.refresh();
    },
    onError: () => {
      toast.error('No se pudo bloquear al usuario');
    }
  });

  const unblockMutation = useMutation({
    mutationFn: () => unblockUser(profile.handle),
    onSuccess: () => {
      toast.success('Usuario desbloqueado');
      queryClient.invalidateQueries({ queryKey: ['block-status', profile.handle] });
      queryClient.invalidateQueries({ queryKey: ['profile', profile.handle] });
      router.refresh();
    },
    onError: () => {
      toast.error('No se pudo desbloquear al usuario');
    }
  });

  const handleFollow = async (): Promise<void> => {
    if (isLoading || isOwnProfile || isBlocked || hasBlockedYou) {
      return;
    }

    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(profile.handle);
        setIsFollowing(false);
        toast.success('Dejaste de seguir a este usuario');
      } else {
        await followUser(profile.handle);
        setIsFollowing(true);
        toast.success('Ahora sigues a este usuario');
      }
      router.refresh();
    } catch (error) {
      toast.error('No se pudo actualizar el seguimiento');
      logger.error('Error al actualizar seguimiento', { error, profileId: profile.id });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlock = async (): Promise<void> => {
    if (isOwnProfile) {
      return;
    }

    if (isBlocked) {
      if (window.confirm('¿Estás seguro de que quieres desbloquear a este usuario?')) {
        unblockMutation.mutate();
      }
    } else {
      if (window.confirm('¿Estás seguro de que quieres bloquear a este usuario? No podrás ver su contenido ni él el tuyo.')) {
        blockMutation.mutate();
      }
    }
  };

  return (
    <motion.header
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="glass-card rounded-2xl p-8 mb-8"
    >
      <div className="flex gap-8">
        {/* Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="relative group shrink-0"
        >
          <div className="relative size-28 overflow-hidden rounded-full ring-4 ring-white/10 backdrop-blur-sm">
            <Image
              key={profile.avatarUrl || profile.handle}
              src={getAvatarUrl(profile.avatarUrl, profile.handle)}
              alt={profile.displayName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        </motion.div>

        {/* Info */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-white tracking-tight">@{profile.handle}</h1>
              {profile.isVerified && (
                <VerifiedBadge size="md" className="text-primary-400" />
              )}
            </div>
            {isOwnProfile ? (
              <Link
                href="/settings?tab=profile"
                className="rounded-xl glass-dark px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-black/30 hover:shadow-elegant active:scale-95"
              >
                Editar perfil
              </Link>
            ) : (
              <div className="flex gap-3">
                {hasBlockedYou ? (
                  <div className="rounded-xl border border-red-500/30 bg-red-900/20 backdrop-blur-sm px-6 py-2.5 text-sm font-medium text-red-400">
                    Este usuario te ha bloqueado
                  </div>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleFollow}
                      disabled={isLoading || isBlocked}
                      className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50 ${
                        isFollowing
                          ? 'glass-dark text-white hover:bg-black/30'
                          : 'bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white hover:from-primary-500 hover:via-accent-500 hover:to-primary-600 shadow-lg shadow-primary-500/40'
                      }`}
                    >
                      {isLoading ? '...' : isFollowing ? 'Siguiendo' : 'Seguir'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleBlock}
                      disabled={blockMutation.isPending || unblockMutation.isPending}
                      className={`rounded-xl border backdrop-blur-sm px-6 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50 ${
                        isBlocked
                          ? 'border-green-500/30 bg-green-900/20 text-green-400 hover:bg-green-900/30'
                          : 'border-red-500/30 bg-red-900/20 text-red-400 hover:bg-red-900/30'
                      }`}
                    >
                      {isBlocked ? 'Desbloquear' : 'Bloquear'}
                    </motion.button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Estadísticas */}
          <div className="flex gap-10">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white tracking-tight">{stats.posts.toLocaleString('es')}</span>
              <span className="text-sm text-slate-400 mt-0.5">publicaciones</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white tracking-tight">{stats.followers.toLocaleString('es')}</span>
              <span className="text-sm text-slate-400 mt-0.5">seguidores</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white tracking-tight">{stats.following.toLocaleString('es')}</span>
              <span className="text-sm text-slate-400 mt-0.5">siguiendo</span>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <div className="text-lg font-semibold text-white">{profile.displayName}</div>
            {profile.bio && (
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}

