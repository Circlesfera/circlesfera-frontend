import { useState, useEffect, useCallback, useRef } from 'react';
import { liveCommentService } from '@/services/liveStreamService';
import type {
  LiveComment,
  CreateLiveCommentData,
  LiveCommentFilters,
  LiveStreamStats,
} from '@/types/live';

export const useLiveComments = (streamId: string | null, filters: LiveCommentFilters = {}) => {
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
  } | null>(null);
  const lastCommentRef = useRef<LiveComment | null>(null);

  const loadComments = useCallback(async () => {
    if (!streamId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await liveCommentService.getComments(streamId, {
        ...filters,
        page: pagination?.page || 1,
        limit: pagination?.limit || 50,
      });

      setComments(response.data);
      setPagination(response.pagination || null);

      // Guardar referencia al último comentario para cargar más
      if (response.data.length > 0) {
        lastCommentRef.current = response.data[response.data.length - 1] || null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando comentarios');
    } finally {
      setLoading(false);
    }
  }, [streamId, filters, pagination?.page, pagination?.limit]);

  const loadMoreComments = useCallback(async () => {
    if (!streamId || !pagination || pagination.page * pagination.limit >= pagination.total) return;

    try {
      setLoading(true);

      const response = await liveCommentService.getComments(streamId, {
        ...filters,
        page: pagination.page + 1,
        limit: pagination.limit,
      });

      setComments(prev => [...prev, ...response.data]);
      setPagination(prev => prev ? {
        ...prev,
        page: prev.page + 1,
        total: response.pagination?.total || prev.total,
      } : null);

      if (response.data.length > 0) {
        lastCommentRef.current = response.data[response.data.length - 1] || null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando más comentarios');
    } finally {
      setLoading(false);
    }
  }, [streamId, filters, pagination]);

  const loadNewComments = useCallback(async () => {
    if (!streamId || !lastCommentRef.current) return;

    try {
      const response = await liveCommentService.getComments(streamId, {
        ...filters,
        since: new Date(lastCommentRef.current.createdAt).toISOString(),
        limit: 50,
      });

      if (response.data.length > 0) {
        setComments(prev => [...response.data, ...prev]);
        lastCommentRef.current = response.data[response.data.length - 1] || null;
      }
    } catch (err) {

    }
  }, [streamId, filters]);

  const refresh = useCallback(() => {
    setComments([]);
    setPagination(null);
    lastCommentRef.current = null;
  }, []);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Cargar comentarios nuevos cada 5 segundos
  useEffect(() => {
    if (!streamId) return;

    const interval = setInterval(loadNewComments, 5000);
    return () => clearInterval(interval);
  }, [streamId, loadNewComments]);

  return {
    comments,
    loading,
    error,
    pagination,
    loadMoreComments,
    loadNewComments,
    refresh,
  };
};

export const useCreateLiveComment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createComment = useCallback(async (
    streamId: string,
    data: CreateLiveCommentData
  ): Promise<LiveComment | null> => {
    try {
      setLoading(true);
      setError(null);

      const comment = await liveCommentService.createComment(streamId, data);
      return comment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando comentario');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createComment,
    loading,
    error,
  };
};

export const useLiveCommentReactions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reactToComment = useCallback(async (
    streamId: string,
    commentId: string,
    reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'angry'
  ): Promise<{ reactionCount: number; userReaction: string } | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await liveCommentService.reactToComment(
        streamId,
        commentId,
        reactionType
      );
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error reaccionando al comentario');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeReaction = useCallback(async (
    streamId: string,
    commentId: string
  ): Promise<{ reactionCount: number; userReaction: null } | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await liveCommentService.removeReaction(streamId, commentId);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error removiendo reacción');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleReaction = useCallback(async (
    streamId: string,
    commentId: string,
    reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'angry',
    hasReaction: boolean
  ) => {
    if (hasReaction) {
      return removeReaction(streamId, commentId);
    } else {
      return reactToComment(streamId, commentId, reactionType);
    }
  }, [reactToComment, removeReaction]);

  return {
    reactToComment,
    removeReaction,
    toggleReaction,
    loading,
    error,
  };
};

export const useLiveCommentModeration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moderateComment = useCallback(async (
    streamId: string,
    commentId: string,
    action: 'hide' | 'delete' | 'pin' | 'unpin',
    reason?: string
  ): Promise<{ success: boolean; data?: unknown; message?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const result = await liveCommentService.moderateComment(
        streamId,
        commentId,
        action,
        reason
      );
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error moderando comentario');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    moderateComment,
    loading,
    error,
  };
};

export const useLiveCommentStats = (streamId: string | null) => {
  const [stats, setStats] = useState<LiveStreamStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!streamId) return;

    try {
      setLoading(true);
      setError(null);

      const statsData = await liveCommentService.getCommentStats(streamId);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
  }, [streamId]);

  const refresh = useCallback(() => {
    if (streamId) {
      loadStats();
    }
  }, [streamId, loadStats]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Actualizar estadísticas cada 30 segundos
  useEffect(() => {
    if (!streamId) return;

    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [streamId, loadStats]);

  return {
    stats,
    loading,
    error,
    refresh,
  };
};
