'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ReactElement,useEffect, useState } from 'react';
import { toast } from 'sonner';

import { VerifiedBadge } from '@/components/verified-badge';
import { getAvatarUrl, isLocalImage } from '@/lib/image-utils';
import { followUser, unfollowUser } from '@/services/api/follows';
import type { PublicProfile, UserStats } from '@/services/api/users';
import { useSessionStore } from '@/store/session';

import { FollowersDialog } from './followers-dialog';
import { ProfileOptionsMenu } from './profile-options-menu';

interface ProfileHeaderProps {
  readonly profile: PublicProfile;
  readonly stats?: UserStats;
  readonly isFollowing?: boolean;
}

export function ProfileHeader({ profile, stats, isFollowing: initialFollowing }: ProfileHeaderProps): ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = useSessionStore((state) => state.user);
  const [isFollowing, setIsFollowing] = useState(initialFollowing ?? false);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);
  
  const avatarUrl = getAvatarUrl(profile.avatarUrl, profile.handle);
  const isOwnProfile = currentUser?.handle?.toLowerCase() === profile.handle.toLowerCase();

  // Inicializar estado de seguimiento
  useEffect(() => {
    if (initialFollowing !== undefined) {
      setIsFollowing(initialFollowing);
    }
  }, [initialFollowing]);

  const followMutation = useMutation({
    mutationFn: () => followUser(profile.handle),
    onSuccess: (data) => {
      setIsFollowing(data.following);
      void queryClient.invalidateQueries({ queryKey: ['profile', profile.handle] });
      void queryClient.invalidateQueries({ queryKey: ['follow-status', profile.handle] });
      toast.success(data.following ? 'Ahora sigues a este usuario' : 'Dejaste de seguir a este usuario');
    },
    onError: () => {
      toast.error('No se pudo completar la acción');
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUser(profile.handle),
    onSuccess: (data) => {
      setIsFollowing(data.following);
      void queryClient.invalidateQueries({ queryKey: ['profile', profile.handle] });
      void queryClient.invalidateQueries({ queryKey: ['follow-status', profile.handle] });
      toast.success('Dejaste de seguir a este usuario');
    },
    onError: () => {
      toast.error('No se pudo completar la acción');
    }
  });

  const handleFollowToggle = (): void => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const openFollowersDialog = (type: 'followers' | 'following'): void => {
    if (type === 'followers') {
      setFollowersDialogOpen(true);
    } else {
      setFollowingDialogOpen(true);
    }
  };

  const handleMessageClick = async (): Promise<void> => {
    if (!currentUser || !profile.id) {
      toast.error('No se puede iniciar conversación');
      return;
    }

    try {
      // Importar dinámicamente para evitar circular dependencies
      const { createConversation } = await import('@/services/api/messages');
      const result = await createConversation({ userId: profile.id });
      // Invalidar conversaciones para actualizar la lista
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });
      // Navegar a mensajes con el ID de la conversación en la URL
      router.push(`/messages?conversation=${result.id}`);
    } catch (error) {
      toast.error('No se pudo iniciar la conversación');
      console.error('Error al crear conversación:', error);
    }
  };

  // Parsear enlaces en bio
  const parseBioLinks = (bio: string): ReactElement => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = bio.split(urlRegex);
    
    return (
      <>
        {parts.map((part, index) => {
          if (urlRegex.test(part)) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 underline transition-colors"
              >
                {part}
              </a>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  // Formatear fecha
  const formatJoinDate = (date: string | Date): string => {
    const joinDate = typeof date === 'string' ? new Date(date) : date;
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `Se unió en ${months[joinDate.getMonth()]} ${joinDate.getFullYear()}`;
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col items-center gap-6 text-center"
    >
      {/* Menú de opciones */}
      {!isOwnProfile && (
        <div className="absolute top-0 right-0">
          <ProfileOptionsMenu profile={profile} />
        </div>
      )}
      <div className="relative group">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="relative size-32 overflow-hidden rounded-full border-4 border-primary-500/30 shadow-lg shadow-primary-500/20 transition-all duration-300 group-hover:border-primary-500/50 group-hover:shadow-primary-500/40"
        >
          <Image
            src={avatarUrl}
            alt={profile.displayName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            unoptimized={isLocalImage(avatarUrl)}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-foreground"
          >
            {profile.displayName}
          </motion.h1>
          {profile.isVerified && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <VerifiedBadge size="md" />
            </motion.div>
          )}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-base text-foreground-muted"
        >
          @{profile.handle}
        </motion.p>
      </div>

      {profile.bio ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl text-sm leading-relaxed text-foreground"
        >
          {parseBioLinks(profile.bio)}
        </motion.div>
      ) : null}

      {/* Fecha de creación */}
      {'createdAt' in profile && profile.createdAt && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22 }}
          className="text-xs text-foreground-muted"
        >
          {formatJoinDate(profile.createdAt)}
        </motion.p>
      )}

      {/* Acciones */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex items-center gap-3"
      >
        {isOwnProfile ? (
          <>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/settings?tab=profile"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-all duration-300 hover:from-primary-500 hover:via-accent-500 hover:to-primary-600 hover:shadow-xl hover:shadow-primary-500/40"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar perfil
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-surface-strong hover:border-border-strong"
                title="Configuración completa"
              >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            </motion.div>
          </>
        ) : (
          <>
            <motion.button
              type="button"
              onClick={handleFollowToggle}
              disabled={followMutation.isPending || unfollowMutation.isPending}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white dark:text-white shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
                isFollowing
                  ? 'border border-border bg-surface backdrop-blur-sm hover:bg-surface-strong hover:border-border-strong text-foreground'
                  : 'bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 shadow-primary-500/30 hover:from-primary-500 hover:via-accent-500 hover:to-primary-600 hover:shadow-xl hover:shadow-primary-500/40'
              }`}
            >
              {followMutation.isPending || unfollowMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {isFollowing ? 'Dejando de seguir...' : 'Siguiendo...'}
                </span>
              ) : isFollowing ? (
                'Siguiendo'
              ) : (
                'Seguir'
              )}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => {
                void handleMessageClick();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-surface-strong hover:border-border-strong"
            >
              Mensaje
            </motion.button>
          </>
        )}
      </motion.div>

      {/* Estadísticas */}
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-8 pt-4"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-1 transition-all duration-200 hover:text-primary-400"
          >
            <span className="text-2xl font-bold text-foreground">{stats.posts.toLocaleString('es')}</span>
            <span className="text-sm text-foreground-muted">Publicaciones</span>
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-1 transition-all duration-200 hover:text-primary-400 cursor-pointer"
            onClick={() => {
              openFollowersDialog('followers');
            }}
          >
            <span className="text-2xl font-bold text-foreground">{stats.followers.toLocaleString('es')}</span>
            <span className="text-sm text-foreground-muted">Seguidores</span>
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-1 transition-all duration-200 hover:text-primary-400 cursor-pointer"
            onClick={() => {
              openFollowersDialog('following');
            }}
          >
            <span className="text-2xl font-bold text-foreground">{stats.following.toLocaleString('es')}</span>
            <span className="text-sm text-foreground-muted">Siguiendo</span>
          </motion.button>
        </motion.div>
      )}

      {/* Diálogos */}
      <FollowersDialog
        isOpen={followersDialogOpen}
        onClose={() => {
          setFollowersDialogOpen(false);
        }}
        handle={profile.handle}
        type="followers"
      />
      <FollowersDialog
        isOpen={followingDialogOpen}
        onClose={() => {
          setFollowingDialogOpen(false);
        }}
        handle={profile.handle}
        type="following"
      />
    </motion.header>
  );
}

