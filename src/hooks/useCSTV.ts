import { useState, useEffect, useCallback } from 'react';
import { cstvService } from '@/services/cstvService';
import type {
  CSTVVideo,
  CreateCSTVData,
  UpdateCSTVData,
  CSTVFilters,
  CSTVSearchFilters,
} from '@/types/cstv';

export const useCSTVVideos = (filters: CSTVFilters = {}) => {
  const [videos, setVideos] = useState<CSTVVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const loadVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await cstvService.getVideos({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });

      setVideos(response.data as CSTVVideo[]);
      setPagination(response.pagination!);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando videos CSTV');
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
    setVideos([]);
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  return {
    videos,
    loading,
    error,
    pagination,
    loadMore,
    refresh,
  };
};

export const useCSTVVideo = (videoId: string | null) => {
  const [video, setVideo] = useState<CSTVVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVideo = useCallback(async () => {
    if (!videoId) return;

    try {
      setLoading(true);
      setError(null);

      const videoData = await cstvService.getVideo(videoId);
      setVideo(videoData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando video CSTV');
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  const refresh = useCallback(() => {
    if (videoId) {
      loadVideo();
    }
  }, [videoId, loadVideo]);

  useEffect(() => {
    loadVideo();
  }, [loadVideo]);

  return {
    video,
    loading,
    error,
    refresh,
  };
};

export const useCreateCSTVVideo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVideo = useCallback(async (data: CreateCSTVData): Promise<CSTVVideo | null> => {
    try {
      setLoading(true);
      setError(null);

      const video = await cstvService.createVideo(data);
      return video;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando video CSTV');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createVideo,
    loading,
    error,
  };
};

export const useUpdateCSTVVideo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateVideo = useCallback(async (
    videoId: string,
    data: UpdateCSTVData
  ): Promise<CSTVVideo | null> => {
    try {
      setLoading(true);
      setError(null);

      const video = await cstvService.updateVideo(videoId, data);
      return video;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando video CSTV');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateVideo,
    loading,
    error,
  };
};

export const useDeleteCSTVVideo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteVideo = useCallback(async (videoId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await cstvService.deleteVideo(videoId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando video CSTV');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteVideo,
    loading,
    error,
  };
};

export const useCSTVLikes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLike = useCallback(async (
    videoId: string,
    isCurrentlyLiked: boolean
  ): Promise<{ likesCount: number; isLiked: boolean } | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await cstvService.toggleLike(videoId, isCurrentlyLiked);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando like');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    toggleLike,
    loading,
    error,
  };
};

export const useCSTVSaves = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSave = useCallback(async (
    videoId: string,
    isCurrentlySaved: boolean
  ): Promise<{ savesCount: number; isSaved: boolean } | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await cstvService.toggleSave(videoId, isCurrentlySaved);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando guardado');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    toggleSave,
    loading,
    error,
  };
};

export const useTrendingVideos = (limit = 20) => {
  const [videos, setVideos] = useState<CSTVVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTrending = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const trendingVideos = await cstvService.getTrendingVideos(limit);
      setVideos(trendingVideos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando videos trending');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const refresh = useCallback(() => {
    loadTrending();
  }, [loadTrending]);

  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  return {
    videos,
    loading,
    error,
    refresh,
  };
};

export const useCSTVSearch = (searchTerm: string, filters: Omit<CSTVSearchFilters, 'q'> = {}) => {
  const [results, setResults] = useState<CSTVVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);

  const search = useCallback(async () => {
    if (!searchTerm.trim()) {
      setResults([]);
      setPagination(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await cstvService.searchVideos({
        q: searchTerm,
        ...filters,
      });

      setResults(response.data.videos);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error buscando videos');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters]);

  const loadMore = useCallback(async () => {
    if (!searchTerm.trim() || !pagination || pagination.page >= pagination.pages) return;

    try {
      setLoading(true);

      const response = await cstvService.searchVideos({
        q: searchTerm,
        ...filters,
        page: pagination.page + 1,
      });

      setResults(prev => [...prev, ...response.data.videos]);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando más resultados');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, pagination]);

  const clearResults = useCallback(() => {
    setResults([]);
    setPagination(null);
    setError(null);
  }, []);

  useEffect(() => {
    search();
  }, [search]);

  return {
    results,
    loading,
    error,
    pagination,
    search,
    loadMore,
    clearResults,
  };
};
