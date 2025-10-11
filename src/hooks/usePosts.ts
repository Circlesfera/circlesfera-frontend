import { useState, useCallback, useEffect } from 'react';
import { getUserPosts, Post } from '@/services/postService';

interface UsePostsOptions {
  username: string;
  initialPosts?: Post[];
}

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  removePost: (postId: string) => void;
  addPost: (post: Post) => void;
}

/**
 * Hook personalizado para gestionar posts de un usuario
 * @param options - Opciones de configuración
 * @returns Estado y funciones para gestionar posts
 */
export function usePosts({ username, initialPosts = [] }: UsePostsOptions): UsePostsReturn {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const POSTS_PER_PAGE = 9;

  // Cargar posts iniciales
  useEffect(() => {
    if (initialPosts.length === 0) {
      loadInitialPosts();
    }
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInitialPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUserPosts(username, 1, POSTS_PER_PAGE);

      if (response.success) {
        setPosts(response.posts || []);
        setHasMore(
          response.pagination
            ? response.pagination.page < response.pagination.pages
            : false
        );
        setPage(1);
      }
    } catch (err) {
      setError('Error al cargar los posts');

    } finally {
      setLoading(false);
    }
  }, [username]);

  // Cargar más posts (paginación)
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);

      const nextPage = page + 1;
      const response = await getUserPosts(username, nextPage, POSTS_PER_PAGE);

      if (response.success && response.posts) {
        setPosts(prev => {
          // Evitar duplicados
          const newPosts = response.posts.filter(
            newPost => !prev.some(existingPost => existingPost._id === newPost._id)
          );
          return [...prev, ...newPosts];
        });

        setHasMore(
          response.pagination
            ? response.pagination.page < response.pagination.pages
            : false
        );
        setPage(nextPage);
      }
    } catch (err) {
      setError('Error al cargar más posts');

    } finally {
      setLoading(false);
    }
  }, [username, loading, hasMore, page]);

  // Refrescar posts
  const refresh = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    await loadInitialPosts();
  }, [loadInitialPosts]);

  // Actualizar un post específico
  const updatePost = useCallback((postId: string, updates: Partial<Post>) => {
    setPosts(prev =>
      prev.map(post =>
        post._id === postId ? { ...post, ...updates } : post
      )
    );
  }, []);

  // Eliminar un post
  const removePost = useCallback((postId: string) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  }, []);

  // Agregar un nuevo post al inicio
  const addPost = useCallback((post: Post) => {
    setPosts(prev => [post, ...prev]);
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    updatePost,
    removePost,
    addPost
  };
}

