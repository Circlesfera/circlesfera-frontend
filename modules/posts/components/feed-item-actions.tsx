'use client';

import { type ReactElement } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';

import type { InfiniteData } from '@tanstack/react-query';
import type { FeedItem, FeedCursorResponse } from '@/services/api/types/feed';
import { likePost, unlikePost } from '@/services/api/likes';
import { savePost, unsavePost } from '@/services/api/saves';
import { sharePost, copyPostLink } from '@/lib/share';

interface FeedItemActionsProps {
  readonly post: FeedItem;
}

/**
 * Componente mejorado para las acciones de un post con mejor diseño y animaciones.
 */
export function FeedItemActions({ post }: FeedItemActionsProps): ReactElement {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      // Obtener el estado actual del post desde el cache para determinar qué acción tomar
      const feedData = queryClient.getQueryData<InfiniteData<FeedCursorResponse>>(['feed', 'home']);
      let currentPost: FeedItem | undefined;
      
      if (feedData) {
        for (const page of feedData.pages) {
          currentPost = page.data.find((item) => item.id === postId);
          if (currentPost) break;
        }
      }
      
      // Usar el estado actual del post, o el prop como fallback
      const isCurrentlyLiked = currentPost?.isLikedByViewer ?? post.isLikedByViewer;
      
      // Ejecutar la acción correspondiente
      if (isCurrentlyLiked) {
        return await unlikePost(postId);
      } else {
        return await likePost(postId);
      }
    },
    onMutate: async (postId: string) => {
      // Cancelar cualquier query en progreso para evitar sobrescribir nuestro update optimista
      await queryClient.cancelQueries({ queryKey: ['feed', 'home'] });
      await queryClient.cancelQueries({ queryKey: ['post', postId] });

      // Snapshot del valor anterior
      const previousFeed = queryClient.getQueryData<InfiniteData<FeedCursorResponse>>(['feed', 'home']);
      const previousPost = queryClient.getQueryData<{ post: FeedItem }>(['post', postId]);

      // Obtener el estado actual del post antes de actualizar
      let currentPostState: FeedItem | undefined;
      if (previousFeed) {
        for (const page of previousFeed.pages) {
          currentPostState = page.data.find((item) => item.id === postId);
          if (currentPostState) break;
        }
      }
      
      // Si no está en el feed, usar el post individual
      if (!currentPostState && previousPost) {
        currentPostState = previousPost.post;
      }
      
      // Si no está en ninguno, usar el prop
      const isCurrentlyLiked = currentPostState?.isLikedByViewer ?? post.isLikedByViewer;

      // Actualización optimista del feed
      queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
        { queryKey: ['feed', 'home'] },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((item: FeedItem) => {
                if (item.id === postId) {
                  const newLikes = isCurrentlyLiked 
                    ? Math.max(0, item.stats.likes - 1)
                    : item.stats.likes + 1;
                  
                  return {
                    ...item,
                    isLikedByViewer: !isCurrentlyLiked,
                    stats: {
                      ...item.stats,
                      likes: newLikes
                    }
                  };
                }
                return item;
              })
            }))
          };
        }
      );

      // Actualización optimista del post individual
      queryClient.setQueryData<{ post: FeedItem }>(
        ['post', postId],
        (old) => {
          if (!old) return old;
          
          const newLikes = isCurrentlyLiked 
            ? Math.max(0, old.post.stats.likes - 1)
            : old.post.stats.likes + 1;
          
          return {
            ...old,
            post: {
              ...old.post,
              isLikedByViewer: !isCurrentlyLiked,
              stats: {
                ...old.post.stats,
                likes: newLikes
              }
            }
          };
        }
      );

      // Retornar contexto con snapshot para rollback
      return { previousFeed, previousPost };
    },
    onError: (err, postId, context) => {
      // Revertir al valor anterior en caso de error
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed', 'home'], context.previousFeed);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      toast.error('No se pudo actualizar el like');
    },
    onSuccess: async (data, postId) => {
      // Confirmar el estado con la respuesta del servidor
      // La actualización optimista ya ajustó el contador, solo necesitamos confirmar isLikedByViewer
      queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
        { queryKey: ['feed', 'home'] },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((item: FeedItem) => {
                if (item.id === postId) {
                  // Confirmar el estado del like con la respuesta del servidor
                  // El contador ya fue actualizado en onMutate, solo sincronizamos el estado
                  return {
                    ...item,
                    isLikedByViewer: data.liked
                  };
                }
                return item;
              })
            }))
          };
        }
      );

      // Actualizar el post individual también
      queryClient.setQueryData<{ post: FeedItem }>(
        ['post', postId],
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            post: {
              ...old.post,
              isLikedByViewer: data.liked
            }
          };
        }
      );

      // Invalidar analytics en background sin bloquear la UI
      queryClient.invalidateQueries({ 
        queryKey: ['analytics'],
        exact: false 
      });
    },
    onSettled: () => {
      // No hacer nada adicional aquí para mantener la fluidez de la UI
      // La actualización optimista ya está aplicada y se sincronizó con el servidor
    }
  });

  const saveMutation = useMutation({
    mutationFn: (postId: string) => {
      // Obtener el estado actual del post desde el cache para determinar qué acción tomar
      const feedData = queryClient.getQueryData<InfiniteData<FeedCursorResponse>>(['feed', 'home']);
      let currentPost: FeedItem | undefined;
      
      if (feedData) {
        for (const page of feedData.pages) {
          currentPost = page.data.find((item) => item.id === postId);
          if (currentPost) break;
        }
      }
      
      // Usar el estado actual del post, o el prop como fallback
      const isCurrentlySaved = currentPost?.isSavedByViewer ?? post.isSavedByViewer;
      
      // Ejecutar la acción correspondiente
      if (isCurrentlySaved) {
        return unsavePost(postId);
      } else {
        return savePost(postId);
      }
    },
    onMutate: async (postId: string) => {
      // Cancelar cualquier query en progreso para evitar sobrescribir nuestro update optimista
      await queryClient.cancelQueries({ queryKey: ['feed', 'home'] });
      await queryClient.cancelQueries({ queryKey: ['post', postId] });

      // Snapshot del valor anterior
      const previousFeed = queryClient.getQueryData<InfiniteData<FeedCursorResponse>>(['feed', 'home']);
      const previousPost = queryClient.getQueryData<{ post: FeedItem }>(['post', postId]);

      // Obtener el estado actual del post antes de actualizar
      let currentPostState: FeedItem | undefined;
      if (previousFeed) {
        for (const page of previousFeed.pages) {
          currentPostState = page.data.find((item) => item.id === postId);
          if (currentPostState) break;
        }
      }
      
      // Si no está en el feed, usar el post individual
      if (!currentPostState && previousPost) {
        currentPostState = previousPost.post;
      }
      
      // Si no está en ninguno, usar el prop
      const isCurrentlySaved = currentPostState?.isSavedByViewer ?? post.isSavedByViewer;

      // Actualización optimista del feed
      queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
        { queryKey: ['feed', 'home'] },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((item: FeedItem) => {
                if (item.id === postId) {
                  return {
                    ...item,
                    isSavedByViewer: !isCurrentlySaved
                  };
                }
                return item;
              })
            }))
          };
        }
      );

      // Actualización optimista del post individual
      queryClient.setQueryData<{ post: FeedItem }>(
        ['post', postId],
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            post: {
              ...old.post,
              isSavedByViewer: !isCurrentlySaved
            }
          };
        }
      );

      // Retornar contexto con snapshot para rollback
      return { previousFeed, previousPost };
    },
    onError: (err, postId, context) => {
      // Revertir al valor anterior en caso de error
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed', 'home'], context.previousFeed);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      toast.error('No se pudo actualizar el guardado');
    },
    onSuccess: (data, postId) => {
      // Confirmar el estado con la respuesta del servidor
      queryClient.setQueriesData<InfiniteData<FeedCursorResponse>>(
        { queryKey: ['feed', 'home'] },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((item: FeedItem) => {
                if (item.id === postId) {
                  return {
                    ...item,
                    isSavedByViewer: data.saved ?? !item.isSavedByViewer
                  };
                }
                return item;
              })
            }))
          };
        }
      );

      // Actualizar el post individual también
      queryClient.setQueryData<{ post: FeedItem }>(
        ['post', postId],
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            post: {
              ...old.post,
              isSavedByViewer: data.saved ?? !old.post.isSavedByViewer
            }
          };
        }
      );

      // Invalidar queries relacionadas en background
      queryClient.invalidateQueries({ queryKey: ['saved'] });
      
      const feedData = queryClient.getQueryData<InfiniteData<FeedCursorResponse>>(['feed', 'home']);
      let currentPost: FeedItem | undefined;
      if (feedData) {
        for (const page of feedData.pages) {
          currentPost = page.data.find((item) => item.id === postId);
          if (currentPost) break;
        }
      }
      const isSaved = currentPost?.isSavedByViewer ?? post.isSavedByViewer;
      toast.success(isSaved ? 'Post guardado' : 'Post desguardado');
    }
  });

  const handleLike = (): void => {
    likeMutation.mutate(post.id);
  };

  const handleSave = (): void => {
    saveMutation.mutate(post.id);
  };

  const handleShare = async (): Promise<void> => {
    const shared = await sharePost(post.id, `Publicación de @${post.author.handle}`);
    if (shared) {
      toast.success('Enlace copiado al portapapeles');
    } else {
      // Si falla sharePost, intentar copiar directamente
      const copied = await copyPostLink(post.id);
      if (copied) {
        toast.success('Enlace copiado al portapapeles');
      } else {
        toast.error('No se pudo copiar el enlace');
      }
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {/* Like Button */}
      <motion.button
        type="button"
        onClick={handleLike}
        disabled={likeMutation.isPending}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`group relative rounded-xl p-2 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
          post.isLikedByViewer 
            ? 'text-red-500 hover:text-red-400 hover:bg-red-500/25' 
            : 'text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/15'
        }`}
        title={post.isLikedByViewer ? 'Quitar me gusta' : 'Me gusta'}
      >
        {post.isLikedByViewer && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-red-500/25 backdrop-blur-sm"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
        )}
        <motion.svg
          className="relative z-10 h-6 w-6"
          fill={post.isLikedByViewer ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={post.isLikedByViewer ? 2.5 : 2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </motion.svg>
        {likeMutation.isPending && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-50" />
          </div>
        )}
      </motion.button>

      {/* Comment Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
      <Link
        href={`/posts/${post.id}#comments`}
          className="group flex rounded-xl p-2 text-slate-600 dark:text-slate-400 hover:text-primary-400 hover:bg-primary-500/15 transition-all duration-300"
          title="Comentar"
      >
          <svg 
            className="h-6 w-6 transition-transform duration-300 group-hover:scale-105" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </Link>
      </motion.div>

      {/* Share Button */}
      <motion.button
        type="button"
        onClick={handleShare}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group rounded-xl p-2 text-slate-600 dark:text-slate-400 hover:text-primary-400 hover:bg-primary-500/15 transition-all duration-300"
        title="Compartir"
      >
        <svg 
          className="h-6 w-6 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-12" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342c-.400 0-.816-.039-1.236-.115l-.866-2.322c-.35-.937.062-1.954.938-2.305l2.322-.866c.402-.15.81-.231 1.221-.231.4 0 .816.039 1.236.115l.866 2.322c.35.937-.062 1.954-.938 2.305l-2.322.866c-.402.15-.81.231-1.221.231zM13.342 8.684c.4 0 .816-.039 1.236-.115l.866-2.322c.35-.937-.062-1.954-.938-2.305l-2.322-.866c-.402-.15-.81-.231-1.221-.231-.4 0-.816.039-1.236.115l-.866 2.322c-.35.937.062 1.954.938 2.305l2.322.866c.402.15.81.231 1.221.231zM21.316 13.342c.4 0 .816-.039 1.236-.115l.866-2.322c.35-.937-.062-1.954-.938-2.305l-2.322-.866c-.402-.15-.81-.231-1.221-.231-.4 0-.816.039-1.236.115l-.866 2.322c-.35.937.062 1.954.938 2.305l2.322.866c.402.15.81.231 1.221.231zM16.658 21.316c-.4 0-.816.039-1.236.115l-.866 2.322c-.35.937.062 1.954.938 2.305l2.322.866c.402.15.81.231 1.221.231.4 0 .816-.039 1.236-.115l.866-2.322c.35-.937-.062-1.954-.938-2.305l-2.322-.866c-.402-.15-.81-.231-1.221-.231z"
          />
        </svg>
      </motion.button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Save Button */}
      <motion.button
        type="button"
        onClick={handleSave}
        disabled={saveMutation.isPending}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`group relative rounded-xl p-2 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
          post.isSavedByViewer 
            ? 'text-primary-400 hover:text-primary-300 hover:bg-primary-500/25' 
            : 'text-slate-600 dark:text-slate-400 hover:text-primary-400 hover:bg-primary-500/15'
        }`}
        title={post.isSavedByViewer ? 'Desguardar' : 'Guardar'}
      >
        {post.isSavedByViewer && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-primary-500/25 backdrop-blur-sm"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
        )}
        <motion.svg
          className="relative z-10 h-6 w-6"
          fill={post.isSavedByViewer ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={post.isSavedByViewer ? 2.5 : 2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </motion.svg>
        {saveMutation.isPending && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-50" />
          </div>
        )}
      </motion.button>
    </div>
  );
}
