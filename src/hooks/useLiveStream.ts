import { useState, useEffect, useCallback } from 'react';
import { liveStreamService } from '@/services/liveStreamService';
import type {
  LiveStream,
  CreateLiveStreamData,
  StartLiveStreamData,
  EndLiveStreamData,
  LiveStreamFilters,
} from '@/types/live';

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando transmisiones');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando transmisión');
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
      return stream;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando transmisión');
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
      return stream;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error iniciando transmisión');
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
  ): Promise<{ liveStream: LiveStream; cstvVideo?: any } | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await liveStreamService.endLiveStream(streamId, data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error terminando transmisión');
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
    } catch (err) {
      console.error('Error agregando viewer:', err);
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
    } catch (err) {
      console.error('Error removiendo viewer:', err);
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
      return stream;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error invitando co-host');
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
