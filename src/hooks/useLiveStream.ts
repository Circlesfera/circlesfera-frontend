import { useState, useEffect, useCallback } from 'react';
import { liveStreamService } from '@/services/liveStreamService';
import type {
  LiveStream,
  CreateLiveStreamData,
  StartLiveStreamData,
  EndLiveStreamData,
  LiveStreamFilters,
} from '@/types/live';
import type { CSTVVideo } from '@/types/cstv';
import logger from '@/utils/logger';

export const useLiveStreams = (filters: LiveStreamFilters = {}) => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const loadStreams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await liveStreamService.getLiveStreams({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });

      setStreams(response.data);
      setPagination(response.pagination);
      logger.debug('Live streams loaded:', { count: response.data.length });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando transmisiones';
      setError(errorMessage);
      logger.error('Error loading live streams:', { error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  const loadMore = useCallback(async () => {
    if (pagination.page < pagination.pages && !loading) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [pagination.page, pagination.pages, loading]);

  const refresh = useCallback(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setStreams([]);
  }, []);

  useEffect(() => {
    loadStreams();
  }, [loadStreams]);

  return {
    streams,
    loading,
    error,
    pagination,
    loadMore,
    refresh,
  };
};

export const useLiveStream = (streamId: string | null) => {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStream = useCallback(async () => {
    if (!streamId) return;

    try {
      setLoading(true);
      setError(null);

      const streamData = await liveStreamService.getLiveStream(streamId);
      setStream(streamData);
      logger.debug('Live stream loaded:', { streamId });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando transmisión';
      setError(errorMessage);
      logger.error('Error loading live stream:', { error: err instanceof Error ? err.message : 'Unknown error', streamId });
    } finally {
      setLoading(false);
    }
  }, [streamId]);

  const refresh = useCallback(() => {
    if (streamId) {
      loadStream();
    }
  }, [streamId, loadStream]);

  useEffect(() => {
    loadStream();
  }, [loadStream]);

  return {
    stream,
    loading,
    error,
    refresh,
  };
};

export const useCreateLiveStream = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStream = useCallback(async (data: CreateLiveStreamData): Promise<LiveStream | null> => {
    try {
      setLoading(true);
      setError(null);

      const stream = await liveStreamService.createLiveStream(data);
      logger.info('Live stream created:', { streamId: stream._id });
      return stream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando transmisión';
      setError(errorMessage);
      logger.error('Error creating live stream:', { error: err instanceof Error ? err.message : 'Unknown error', data });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createStream,
    loading,
    error,
  };
};

export const useStartLiveStream = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startStream = useCallback(async (
    streamId: string,
    data: StartLiveStreamData
  ): Promise<LiveStream | null> => {
    try {
      setLoading(true);
      setError(null);

      const stream = await liveStreamService.startLiveStream(streamId, data);
      logger.info('Live stream started:', { streamId });
      return stream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error iniciando transmisión';
      setError(errorMessage);
      logger.error('Error starting live stream:', { error: err instanceof Error ? err.message : 'Unknown error', streamId });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    startStream,
    loading,
    error,
  };
};

export const useEndLiveStream = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endStream = useCallback(async (
    streamId: string,
    data: EndLiveStreamData = {}
  ): Promise<{ liveStream: LiveStream; cstvVideo?: CSTVVideo } | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await liveStreamService.endLiveStream(streamId, data);
      logger.info('Live stream ended:', { streamId });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error terminando transmisión';
      setError(errorMessage);
      logger.error('Error ending live stream:', { error: err instanceof Error ? err.message : 'Unknown error', streamId });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    endStream,
    loading,
    error,
  };
};

export const useLiveStreamViewers = (streamId: string | null) => {
  const [viewers, setViewers] = useState({
    current: 0,
    total: 0,
    peak: 0,
  });

  const addViewer = useCallback(async () => {
    if (!streamId) return;

    try {
      const result = await liveStreamService.addViewer(streamId);
      setViewers({
        current: result.currentViewers,
        total: result.totalViewers,
        peak: result.peakViewers,
      });
      logger.debug('Viewer added:', { streamId });
    } catch (err) {
      logger.error('Error adding viewer:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        streamId
      });
    }
  }, [streamId]);

  const removeViewer = useCallback(async () => {
    if (!streamId) return;

    try {
      const result = await liveStreamService.removeViewer(streamId);
      setViewers({
        current: result.currentViewers,
        total: result.totalViewers,
        peak: result.peakViewers,
      });
      logger.debug('Viewer removed:', { streamId });
    } catch (err) {
      logger.error('Error removing viewer:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        streamId
      });
    }
  }, [streamId]);

  return {
    viewers,
    addViewer,
    removeViewer,
  };
};

export const useCoHostInvitation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteCoHost = useCallback(async (
    streamId: string,
    userId: string
  ): Promise<LiveStream | null> => {
    try {
      setLoading(true);
      setError(null);

      const stream = await liveStreamService.inviteCoHost(streamId, userId);
      logger.info('Co-host invited:', { streamId, userId });
      return stream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error invitando co-host';
      setError(errorMessage);
      logger.error('Error inviting co-host:', { error: err instanceof Error ? err.message : 'Unknown error', streamId, userId });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    inviteCoHost,
    loading,
    error,
  };
};
