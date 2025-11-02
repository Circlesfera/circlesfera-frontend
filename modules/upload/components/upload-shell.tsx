'use client';

import { useState, useRef, useEffect, type ReactElement, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

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
    onError: (error: Error) => {
      toast.error(error.message || 'No se pudo crear la publicación');
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
    <div className="w-full max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Crear nueva publicación</h1>
        <p className="mt-2 text-sm text-slate-400">Comparte tus momentos con la comunidad</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selector de archivos */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-4">
            <label htmlFor="media-input" className="block text-sm font-medium text-slate-300 mb-2">
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
            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              disabled={selectedFiles.length >= 10 || createPostMutation.isPending}
              className="w-full rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/40 p-8 text-center transition hover:border-primary-500 hover:bg-slate-800/60 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="mx-auto mb-2 size-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p className="text-sm font-medium text-slate-400">
                {selectedFiles.length === 0
                  ? 'Haz clic para seleccionar archivos'
                  : `${selectedFiles.length} archivo${selectedFiles.length > 1 ? 's' : ''} seleccionado${selectedFiles.length > 1 ? 's' : ''}`}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Máximo 10 archivos (imágenes: JPG, PNG, WebP, GIF | videos: MP4, WebM)
              </p>
            </button>
          </div>

          {/* Preview de archivos */}
          {selectedFiles.length > 0 && (
            <MediaPreview files={selectedFiles} onRemove={handleRemoveFile} />
          )}
        </div>

        {/* Editor de caption */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <CaptionEditor value={caption} onChange={setCaption} />
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              router.back();
            }}
            disabled={createPostMutation.isPending}
            className="rounded-xl border border-slate-700 bg-transparent px-6 py-3 font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={selectedFiles.length === 0 || caption.trim().length === 0 || createPostMutation.isPending}
            className="rounded-xl bg-primary-600 px-6 py-3 font-medium text-white transition hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createPostMutation.isPending ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
}

