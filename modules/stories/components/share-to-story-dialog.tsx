'use client';

import Image from 'next/image';
import { useState, type ReactElement } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { FeedItem } from '@/services/api/types/feed';
import { createStory, type CreateStoryPayload, type StoryMedia } from '@/services/api/stories';
import { generateSharedPostImage } from '../utils/generate-shared-post-image';
import { logger } from '@/lib/logger';
import { useSessionStore } from '@/store/session';
import { apiClient } from '@/services/api/client';

interface ShareToStoryDialogProps {
  readonly post: FeedItem;
  readonly onClose: () => void;
}

export function ShareToStoryDialog({ post, onClose }: ShareToStoryDialogProps): ReactElement {
  const queryClient = useQueryClient();
  const currentUser = useSessionStore((state) => state.user);
  const [isGenerating, setIsGenerating] = useState(false);

  const createStoryMutation = useMutation({
    mutationFn: (payload: CreateStoryPayload) => createStory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories', 'feed'] });
      toast.success('Post compartido en tu story');
      onClose();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'No se pudo compartir el post';
      toast.error(message);
    }
  });

  const handleShare = async (): Promise<void> => {
    if (!currentUser) {
      toast.error('Debes iniciar sesión');
      return;
    }

    // No permitir compartir tu propio post
    if (post.author.id === currentUser.id) {
      toast.error('No puedes compartir tu propio post');
      return;
    }

    setIsGenerating(true);

    try {
      // Obtener el primer media del post
      const postMedia = post.media[0];
      if (!postMedia) {
        toast.error('El post no tiene media');
        return;
      }

      // Generar imagen para la story
      const storyImageDataUrl = await generateSharedPostImage(
        postMedia.thumbnailUrl || postMedia.url,
        post.author.displayName,
        post.author.handle,
        post.author.avatarUrl
      );

      // Convertir data URL a blob y luego a File
      const response = await fetch(storyImageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'shared-post.jpg', { type: 'image/jpeg' });

      // Subir la imagen al backend usando FormData
      // Usamos un endpoint temporal que procesa media y devuelve URL
      // En producción, debería haber un endpoint /media/upload dedicado
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      try {
        // Intentamos usar un endpoint de media upload si existe
        const uploadResponse = await apiClient.post<{ url: string; thumbnailUrl: string; width?: number; height?: number }>(
          '/media/upload',
          uploadFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        // Crear la story con el post compartido
        const payload: CreateStoryPayload = {
          media: {
            kind: 'image',
            url: uploadResponse.data.url,
            thumbnailUrl: uploadResponse.data.thumbnailUrl || uploadResponse.data.url,
            width: uploadResponse.data.width,
            height: uploadResponse.data.height
          },
          sharedPostId: post.id
        };

        createStoryMutation.mutate(payload);
      } catch (uploadError) {
        // Si el endpoint no existe, usamos la data URL directamente
        // El backend debería poder procesar URLs de imágenes públicas
        logger.warn('Endpoint /media/upload no disponible, usando data URL', { error: uploadError, postId: post.id });
        
        // Por ahora, creamos la story usando el thumbnail del post original
        // como fallback. En producción, necesitaremos implementar el endpoint de upload.
        toast.error('Error al subir la imagen. El endpoint de upload de media no está disponible.');
      }
    } catch (error) {
      logger.error('Error al generar imagen para compartir en story', { error, postId: post.id });
      toast.error('Error al generar la imagen para compartir');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 dark:bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Compartir en tu story</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-600 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative size-10 overflow-hidden rounded-full">
              <Image
                src={post.author.avatarUrl || '/default-avatar.png'}
                alt={post.author.displayName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{post.author.displayName}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">@{post.author.handle}</p>
            </div>
          </div>
          {post.caption && (
            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{post.caption}</p>
          )}
          {post.media[0] && (
            <div className="mt-3 relative aspect-square w-full overflow-hidden rounded-lg">
              <Image
                src={post.media[0].thumbnailUrl || post.media[0].url}
                alt="Post preview"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          Se creará una story con una imagen del post. El autor recibirá una notificación.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white transition hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={isGenerating || createStoryMutation.isPending}
            className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-white font-medium transition hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating || createStoryMutation.isPending ? 'Creando...' : 'Compartir'}
          </button>
        </div>
      </div>
    </div>
  );
}

