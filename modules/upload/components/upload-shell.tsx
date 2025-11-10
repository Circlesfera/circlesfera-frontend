'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { type ChangeEvent,type ReactElement, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import { fadeUpVariants } from '@/lib/motion-config';
import { createPost } from '@/services/api/feed';
import { uploadMedia } from '@/services/api/media';
import { createStory, type CreateStoryPayload } from '@/services/api/stories';

import { CaptionEditor } from './caption-editor';
import { MediaPreview } from './media-preview';

type ContentType = 'post' | 'frame' | 'story';

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

export function UploadShell(): ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [contentType, setContentType] = useState<ContentType>('post');
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [caption, setCaption] = useState('');

  const createPostMutation = useMutation({
    mutationFn: async ({ caption, media }: { caption: string; media: File[] }) => createPost({ caption, media }),
    onSuccess: (data) => {
      toast.success('Publicación creada exitosamente');
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      router.push(`/posts/${data.post.id}`);
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { status?: number; data?: { code?: string; message?: string } } };
      const status = axiosError.response?.status;
      const code = axiosError.response?.data?.code;
      const message = axiosError.response?.data?.message;

      if (status === 503 || code === 'STORAGE_SERVICE_UNAVAILABLE') {
        toast.error('El servicio de almacenamiento no está disponible. Por favor, verifica que MinIO esté corriendo.', {
          duration: 5000
        });
      } else {
        toast.error(message || 'No se pudo crear la publicación');
      }
      logger.error('Error al crear publicación', error);
    }
  });

  const createStoryMutation = useMutation({
    mutationFn: async ({ media, sharedPostId }: { media: File; sharedPostId?: string }) => {
      // Subir el media primero
      const uploadResult = await uploadMedia(media);
      
      // Crear el payload de story
      const payload: CreateStoryPayload = {
        media: {
          kind: media.type.startsWith('image/') ? 'image' : 'video',
          url: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl || uploadResult.url,
          durationMs: uploadResult.durationMs,
          width: uploadResult.width,
          height: uploadResult.height
        },
        ...(sharedPostId && { sharedPostId })
      };

      return createStory(payload);
    },
    onSuccess: () => {
      // Invalidar el query de stories para actualizar la barra
      void queryClient.invalidateQueries({ queryKey: ['stories', 'feed'] });
      toast.success('Story creada exitosamente');
      router.push('/feed');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { status?: number; data?: { code?: string; message?: string } } };
      const message = axiosError.response?.data?.message;
      toast.error(message || 'No se pudo crear la story');
      logger.error('Error al crear story desde upload', error);
    }
  });

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      return;
    }

    // Validaciones según tipo de contenido
    if (contentType === 'story') {
      // Stories solo permiten 1 archivo
      if (files.length > 1) {
        toast.error('Las stories solo pueden tener un archivo');
        return;
      }
      const file = files[0];
      if (!file) {
        return;
      }
      if (file.type.startsWith('image/')) {
        setSelectedFiles([{
          file,
          preview: URL.createObjectURL(file),
          type: 'image'
        }]);
      } else if (file.type.startsWith('video/')) {
        setSelectedFiles([{
          file,
          preview: URL.createObjectURL(file),
          type: 'video'
        }]);
      } else {
        toast.error('Solo se permiten imágenes o videos');
        return;
      }
    } else if (contentType === 'frame') {
      // Frames solo permiten 1 video
      if (files.length > 1) {
        toast.error('Los frames solo pueden tener un video');
        return;
      }
      const file = files[0];
      if (!file) {
        return;
      }
      if (!file.type.startsWith('video/')) {
        toast.error('Los frames solo pueden ser videos');
        return;
      }
      // Validar duración del video (máximo 60 segundos)
      const video = document.createElement('video');
      video.preload = 'metadata';
      const videoUrl = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoUrl);
        const duration = video.duration;
        if (duration > 60) {
          toast.error('Los frames deben tener una duración máxima de 60 segundos');
          return;
        }
        setSelectedFiles([{
          file,
          preview: URL.createObjectURL(file),
          type: 'video'
        }]);
      };
      video.onerror = () => {
        window.URL.revokeObjectURL(videoUrl);
        toast.error('Error al cargar el video');
      };
      video.src = videoUrl;
    } else {
      // Posts permiten múltiples archivos
    const validFiles: MediaFile[] = [];
    const maxFiles = 10 - selectedFiles.length;

    files.slice(0, maxFiles).forEach((file) => {
      if (file.type.startsWith('image/')) {
        validFiles.push({
          file,
          preview: URL.createObjectURL(file),
          type: 'image'
        });
      } else if (file.type.startsWith('video/')) {
        validFiles.push({
          file,
          preview: URL.createObjectURL(file),
          type: 'video'
        });
      }
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number): void => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      const fileToRemove = newFiles[index];
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleContentTypeChange = (type: ContentType): void => {
    setContentType(type);
    // Limpiar archivos seleccionados al cambiar tipo
    selectedFiles.forEach((file) => {
      URL.revokeObjectURL(file.preview);
    });
    setSelectedFiles([]);
    setCaption('');
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      toast.error('Selecciona al menos un archivo');
      return;
    }

    if (contentType === 'story') {
      // Stories no requieren caption obligatorio
      const storyFile = selectedFiles[0];
      if (!storyFile) {
        toast.error('Selecciona un archivo');
        return;
      }
      createStoryMutation.mutate({
        media: storyFile.file
      });
    } else if (contentType === 'frame') {
      // Frames requieren caption
      if (caption.trim().length === 0) {
        toast.error('Escribe una descripción para tu frame');
        return;
      }
      // Frames se crean como posts pero solo con videos
      createPostMutation.mutate({
        caption: caption.trim(),
        media: selectedFiles.map((m) => m.file)
      });
    } else {
      // Posts requieren caption
    if (caption.trim().length === 0) {
      toast.error('Escribe una descripción para tu publicación');
      return;
    }
    createPostMutation.mutate({
      caption: caption.trim(),
      media: selectedFiles.map((m) => m.file)
    });
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, [selectedFiles]);

  const isSubmitting = createPostMutation.isPending || createStoryMutation.isPending;

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl"
    >
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gradient-primary">
          Crear contenido
        </h1>
        <p className="mt-2 text-sm text-slate-400">Comparte posts, frames o stories con la comunidad</p>
      </div>

      {/* Selector de tipo de contenido */}
      <Card padding="lg" variant="glass" className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Tipo de contenido
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['post', 'frame', 'story'] as ContentType[]).map((type) => (
              <motion.button
                key={type}
                type="button"
                onClick={() => {
                  handleContentTypeChange(type);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className={`relative rounded-xl p-4 text-center transition-all duration-300 ${
                  contentType === type
                    ? 'bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30'
                    : 'glass-dark text-slate-300 hover:bg-white/5 hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex flex-col items-center gap-2">
                  {type === 'post' && (
                    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                  {type === 'frame' && (
                    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                  {type === 'story' && (
                    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  )}
                  <span className="text-sm font-semibold capitalize">{type}</span>
                </div>
                {contentType === type && (
                  <motion.div
                    layoutId="contentTypeIndicator"
                    className="absolute inset-0 rounded-xl border-2 border-white/30"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-slate-800/50 p-3 text-xs text-slate-400">
          {contentType === 'post' && (
            <p>📸 <strong>Posts:</strong> Puedes subir hasta 10 imágenes o videos con una descripción</p>
          )}
          {contentType === 'frame' && (
            <p>🎬 <strong>Frames:</strong> Videos verticales cortos (máximo 60 segundos) con descripción</p>
          )}
          {contentType === 'story' && (
            <p>✨ <strong>Stories:</strong> Una imagen o video que desaparece después de 24 horas (sin descripción obligatoria)</p>
          )}
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selector de archivos */}
        <Card padding="lg" variant="glass">
          <div className="mb-4">
            <label htmlFor="media-input" className="block text-sm font-semibold text-slate-300 mb-3">
              {contentType === 'story' ? 'Seleccionar imagen o video' : contentType === 'frame' ? 'Seleccionar video' : 'Seleccionar imágenes o videos'}
            </label>
            <input
              ref={fileInputRef}
              id="media-input"
              type="file"
              accept={contentType === 'frame' ? 'video/*' : 'image/*,video/*'}
              multiple={contentType !== 'story' && contentType !== 'frame'}
              onChange={handleFileSelect}
              disabled={(contentType === 'post' && selectedFiles.length >= 10) || isSubmitting}
              className="hidden"
            />
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              disabled={(contentType === 'post' && selectedFiles.length >= 10) || isSubmitting}
              className="group w-full rounded-xl border-2 border-dashed border-slate-700/50 glass-dark p-12 text-center transition-all duration-300 hover:border-primary-500/50 hover:bg-primary-500/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                  <div className="relative size-14 rounded-xl border border-primary-500/30 bg-gradient-to-br from-primary-500/10 to-transparent flex items-center justify-center group-hover:border-primary-500/50 group-hover:scale-110 transition-all duration-300">
                    <svg className="size-7 text-primary-400 group-hover:text-primary-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors duration-300">
                {selectedFiles.length === 0
                  ? 'Haz clic para seleccionar archivos'
                  : `${selectedFiles.length} archivo${selectedFiles.length > 1 ? 's' : ''} seleccionado${selectedFiles.length > 1 ? 's' : ''}`}
              </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {contentType === 'frame'
                      ? 'Videos: MP4, WebM (máximo 60 segundos)'
                      : contentType === 'story'
                        ? 'Imágenes: JPG, PNG, WebP | Videos: MP4, WebM'
                        : 'Máximo 10 archivos (imágenes: JPG, PNG, WebP, GIF | videos: MP4, WebM)'}
              </p>
                </div>
              </div>
            </motion.button>
          </div>

          {/* Preview de archivos */}
          {selectedFiles.length > 0 && (
            <MediaPreview files={selectedFiles} onRemove={handleRemoveFile} />
          )}
        </Card>

        {/* Editor de caption (solo para posts y frames) */}
        {(contentType === 'post' || contentType === 'frame') && (
        <Card padding="lg" variant="glass">
          <CaptionEditor value={caption} onChange={setCaption} />
        </Card>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            onClick={() => {
              router.back();
            }}
            disabled={isSubmitting}
            intent="ghost"
            size="lg"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={
              selectedFiles.length === 0 ||
              ((contentType === 'post' || contentType === 'frame') && caption.trim().length === 0) ||
              isSubmitting
            }
            intent="primary"
            size="lg"
            loading={isSubmitting}
          >
            {contentType === 'story' ? 'Publicar Story' : contentType === 'frame' ? 'Publicar Frame' : 'Publicar'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
