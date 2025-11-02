'use client';

import Image from 'next/image';
import { useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';

import { followUser, unfollowUser } from '@/services/api/follows';
import { blockUser, unblockUser, getBlockStatus, type BlockStatusResponse } from '@/services/api/blocks';
import type { PublicProfile, UserStats } from '@/services/api/users';
import { useSessionStore } from '@/store/session';
import { toast } from 'sonner';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VerifiedBadge } from '@/components/verified-badge';

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
      console.error(error);
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
    <header className="flex flex-col items-center gap-4 text-center">
      <div className="relative size-24">
        <Image
          src={profile.avatarUrl ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${profile.handle}`}
          alt={profile.displayName}
          fill
          className="rounded-full object-cover"
        />
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-semibold text-white">{profile.displayName}</h1>
          {profile.isVerified && <VerifiedBadge size="md" />}
        </div>
        <p className="text-sm text-white/60">@{profile.handle}</p>
      </div>

      {/* Estadísticas */}
      <div className="flex gap-6 text-center">
        <div>
          <div className="text-lg font-semibold text-white">{stats.posts.toLocaleString('es')}</div>
          <div className="text-xs text-white/60">publicaciones</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-white">{stats.followers.toLocaleString('es')}</div>
          <div className="text-xs text-white/60">seguidores</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-white">{stats.following.toLocaleString('es')}</div>
          <div className="text-xs text-white/60">siguiendo</div>
        </div>
      </div>

      {profile.bio ? <p className="max-w-lg text-sm text-white/70">{profile.bio}</p> : null}

      {isOwnProfile ? (
        <Link
          href={`/${profile.handle}/edit`}
          className="mt-2 rounded-full border border-white/20 bg-transparent px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Editar perfil
        </Link>
      ) : (
        <div className="mt-2 flex gap-2">
          {hasBlockedYou ? (
            <div className="rounded-full border border-red-500/50 bg-red-900/20 px-6 py-2 text-sm font-semibold text-red-400">
              Este usuario te ha bloqueado
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleFollow}
                disabled={isLoading || isBlocked}
                className={`rounded-full px-6 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  isFollowing
                    ? 'border border-white/20 bg-transparent text-white hover:bg-white/10'
                    : 'bg-primary-500 text-white hover:bg-primary-400'
                }`}
              >
                {isLoading ? 'Procesando...' : isFollowing ? 'Siguiendo' : 'Seguir'}
              </button>
              <button
                type="button"
                onClick={handleBlock}
                disabled={blockMutation.isPending || unblockMutation.isPending}
                className={`rounded-full border px-6 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  isBlocked
                    ? 'border-green-500/50 bg-green-900/20 text-green-400 hover:bg-green-900/30'
                    : 'border-red-500/50 bg-red-900/20 text-red-400 hover:bg-red-900/30'
                }`}
              >
                {blockMutation.isPending || unblockMutation.isPending
                  ? 'Procesando...'
                  : isBlocked
                    ? 'Desbloquear'
                    : 'Bloquear'}
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

