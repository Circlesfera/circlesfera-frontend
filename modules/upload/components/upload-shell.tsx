'use client';

import { useState, useRef, useEffect, type ReactElement, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { fadeUpVariants } from '@/lib/motion-config';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { createPost } from '@/services/api/feed';
import { MediaPreview } from './media-preview';
import { CaptionEditor } from './caption-editor';

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

export function UploadShell(): ReactElement {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [caption, setCaption] = useState('');

  const createPostMutation = useMutation({
    mutationFn: ({ caption, media }: { caption: string; media: File[] }) => createPost({ caption, media }),
    onSuccess: (data) => {
      toast.success('Publicación creada exitosamente');
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
    }
  });

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      return;
    }

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

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast.error('Selecciona al menos una imagen o video');
      return;
    }

    if (caption.trim().length === 0) {
      toast.error('Escribe una descripción para tu publicación');
      return;
    }

    createPostMutation.mutate({
      caption: caption.trim(),
      media: selectedFiles.map((m) => m.file)
    });
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, [selectedFiles]);

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl"
    >
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gradient-primary">
          Crear nueva publicación
        </h1>
        <p className="mt-2 text-sm text-slate-400">Comparte tus momentos con la comunidad</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selector de archivos */}
        <Card padding="lg" variant="glass">
          <div className="mb-4">
            <label htmlFor="media-input" className="block text-sm font-semibold text-slate-300 mb-3">
              Seleccionar imágenes o videos
            </label>
            <input
              ref={fileInputRef}
              id="media-input"
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              disabled={selectedFiles.length >= 10 || createPostMutation.isPending}
              className="hidden"
            />
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              disabled={selectedFiles.length >= 10 || createPostMutation.isPending}
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
                Máximo 10 archivos (imágenes: JPG, PNG, WebP, GIF | videos: MP4, WebM)
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

        {/* Editor de caption */}
        <Card padding="lg" variant="glass">
          <CaptionEditor value={caption} onChange={setCaption} />
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            onClick={() => {
              router.back();
            }}
            disabled={createPostMutation.isPending}
            intent="ghost"
            size="lg"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={selectedFiles.length === 0 || caption.trim().length === 0 || createPostMutation.isPending}
            intent="primary"
            size="lg"
            loading={createPostMutation.isPending}
          >
            Publicar
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

