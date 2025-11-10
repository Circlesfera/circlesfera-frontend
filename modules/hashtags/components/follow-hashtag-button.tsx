'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ReactElement, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { checkFollowingHashtag, followHashtag, type FollowHashtagResponse,unfollowHashtag } from '@/services/api/hashtags';

interface FollowHashtagButtonProps {
  readonly tag: string;
  readonly variant?: 'default' | 'compact';
}

/**
 * Botón para seguir/dejar de seguir un hashtag.
 */
export function FollowHashtagButton({ tag, variant = 'default' }: FollowHashtagButtonProps): ReactElement {
  const queryClient = useQueryClient();
  const normalizedTag = tag.replace(/^#/, '').toLowerCase().trim();

  // Verificar si ya está siguiendo
  const { data: followStatus, isLoading: isLoadingStatus } = useQuery<FollowHashtagResponse>({
    queryKey: ['hashtag-follow-status', normalizedTag],
    queryFn: () => checkFollowingHashtag(normalizedTag),
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  const [isFollowing, setIsFollowing] = useState<boolean>(followStatus?.followed ?? false);

  useEffect(() => {
    if (followStatus?.followed !== undefined) {
    setIsFollowing(followStatus.followed);
  }
  }, [followStatus?.followed]);

  const followMutation = useMutation({
    mutationFn: () => followHashtag(normalizedTag),
    onSuccess: () => {
      setIsFollowing(true);
      void queryClient.invalidateQueries({ queryKey: ['hashtag-follow-status', normalizedTag] });
      void queryClient.invalidateQueries({ queryKey: ['hashtags', 'following'] });
      void queryClient.invalidateQueries({ queryKey: ['feed', 'home'] }); // Invalidar feed para incluir nuevos posts
      toast.success(`Ahora sigues #${normalizedTag}`);
    },
    onError: () => {
      toast.error('No se pudo seguir el hashtag');
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowHashtag(normalizedTag),
    onSuccess: () => {
      setIsFollowing(false);
      void queryClient.invalidateQueries({ queryKey: ['hashtag-follow-status', normalizedTag] });
      void queryClient.invalidateQueries({ queryKey: ['hashtags', 'following'] });
      void queryClient.invalidateQueries({ queryKey: ['feed', 'home'] }); // Invalidar feed
      toast.success(`Dejaste de seguir #${normalizedTag}`);
    },
    onError: () => {
      toast.error('No se pudo dejar de seguir el hashtag');
    }
  });

  const handleToggle = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  if (isLoadingStatus) {
    return (
      <button
        type="button"
        disabled
        className={`rounded-full bg-slate-700 px-4 py-1.5 text-sm font-medium text-white transition disabled:cursor-not-allowed ${
          variant === 'compact' ? 'px-2 py-1 text-xs' : ''
        }`}
      >
        ...
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={followMutation.isPending || unfollowMutation.isPending}
        className={`rounded-full px-2 py-1 text-xs font-medium transition disabled:cursor-not-allowed ${
          isFollowing
            ? 'bg-slate-700 text-white hover:bg-slate-600'
            : 'bg-primary-500 text-white hover:bg-primary-400'
        }`}
        title={isFollowing ? 'Dejar de seguir' : 'Seguir hashtag'}
      >
        {isFollowing ? 'Siguiendo' : 'Seguir'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={followMutation.isPending || unfollowMutation.isPending}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed ${
        isFollowing
          ? 'border border-slate-600 bg-transparent text-white hover:bg-slate-800'
          : 'bg-primary-500 text-white hover:bg-primary-400'
      }`}
    >
      {followMutation.isPending || unfollowMutation.isPending
        ? '...'
        : isFollowing
          ? 'Siguiendo'
          : 'Seguir'}
    </button>
  );
}

