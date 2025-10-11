import { useState, useCallback } from 'react';
import { toggleLike, deletePost, Post } from '@/services/postService';
import logger from '@/utils/logger';

interface UsePostReturn {
  isLiked: boolean;
  likesCount: number;
  isDeleted: boolean;
  loading: boolean;
  handleLike: () => Promise<void>;
  handleDelete: () => Promise<void>;
}

/**
 * Hook personalizado para gestionar acciones individuales de un post
 * @param post - Post a gestionar
 * @param userId - ID del usuario actual
 * @param onDeleted - Callback cuando el post es eliminado
 * @returns Estado y funciones para gestionar el post
 */
export function usePost(
  post: Post,
  userId?: string,
  onDeleted?: (postId: string) => void
): UsePostReturn {
  const [isLiked, setIsLiked] = useState(
    post.likes?.some(id => id === userId) || false
  );
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [isDeleted, setIsDeleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLike = useCallback(async () => {
    const previousLiked = isLiked;
    const previousCount = likesCount;

    try {
      // Actualización optimista
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

      // Llamar al servicio
      const response = await toggleLike(post._id);

      if (!response.success) {
        // Revertir si falla
        setIsLiked(previousLiked);
        setLikesCount(previousCount);
      } else {
        // Actualizar con datos del servidor
        setLikesCount(response.likesCount);
      }
    } catch (error) {
      // ✅ IMPLEMENTADO: Logging de error al dar like
      logger.error('Error toggling like:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        postId: post._id,
        action: isLiked ? 'unlike' : 'like'
      });
      // Revertir en caso de error
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
    }
  }, [post._id, isLiked, likesCount]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este post?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await deletePost(post._id);

      if (response.success) {
        setIsDeleted(true);
        if (onDeleted) {
          onDeleted(post._id);
        }
      }
    } catch (error) {
      // ✅ IMPLEMENTADO: Logging de error al eliminar post
      logger.error('Error deleting post:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        postId: post._id
      });
      // El error se maneja en el componente que usa el hook
    } finally {
      setLoading(false);
    }
  }, [post._id, onDeleted]);

  return {
    isLiked,
    likesCount,
    isDeleted,
    loading,
    handleLike,
    handleDelete
  };
}

