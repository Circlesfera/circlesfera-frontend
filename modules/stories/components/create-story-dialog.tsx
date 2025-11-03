'use client';

import Image from 'next/image';
import { useState, useRef, useEffect, type ReactElement } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createStory, type CreateStoryPayload } from '@/services/api/stories';
import { uploadMedia } from '@/services/api/media';

interface CreateStoryDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function CreateStoryDialog({ open, onClose }: CreateStoryDialogProps): ReactElement {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const createStoryMutation = useMutation({
    mutationFn: (payload: CreateStoryPayload) => createStory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories', 'feed'] });
      toast.success('Story creada exitosamente');
      handleClose();
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'No se pudo crear la story');
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea imagen o video
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('Solo se permiten imágenes y videos');
      return;
    }

    // Validar tamaño (máximo 15MB para stories)
    if (file.size > 15 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 15MB');
      return;
    }

    setSelectedFile(file);

    // Crear preview
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Para videos, crear preview usando FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = (): void => {
    setSelectedFile(null);
    setPreview(null);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleSubmit = async (): Promise<void> => {
    if (!selectedFile) {
      toast.error('Selecciona una imagen o video');
      return;
    }

    setUploading(true);
    try {
      // Subir media primero
      const mediaResult = await uploadMedia(selectedFile);

      // Crear story
      const payload: CreateStoryPayload = {
        media: {
          kind: selectedFile.type.startsWith('video/') ? 'video' : 'image',
          url: mediaResult.url,
          thumbnailUrl: mediaResult.thumbnailUrl,
          durationMs: mediaResult.durationMs,
          width: mediaResult.width,
          height: mediaResult.height
        }
      };

      createStoryMutation.mutate(payload);
    } catch (error) {
      toast.error('Error al subir el archivo');
      setUploading(false);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  if (!open) {
    return <></>;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-800/50 bg-slate-900/95 backdrop-blur-xl shadow-2xl"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/50 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Crear Story</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-800/50 hover:text-white"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!selectedFile ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-slate-700/50 bg-slate-900/30 p-12">
                <div className="size-16 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center">
                  <svg className="size-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white mb-2">Sube una foto o video</p>
                  <p className="text-xs text-slate-400 mb-4">
                    Las stories duran 24 horas y solo puedes ver quién las ha visto
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-all hover:from-primary-500 hover:to-primary-400 hover:shadow-xl active:scale-95"
                  >
                    Seleccionar archivo
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl border border-slate-800/50 bg-black">
                {selectedFile.type.startsWith('image/') ? (
                  <Image
                    src={preview || ''}
                    alt="Preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <video
                    src={preview || ''}
                    className="h-full w-full object-contain"
                    controls
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  disabled={uploading}
                  className="rounded-xl border border-slate-700/50 bg-transparent px-6 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800/50 hover:text-white disabled:opacity-50 active:scale-95"
                >
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={uploading || createStoryMutation.isPending}
                  className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-all hover:from-primary-500 hover:to-primary-400 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {uploading || createStoryMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {uploading ? 'Subiendo...' : 'Publicando...'}
                    </span>
                  ) : (
                    'Compartir Story'
                  )}
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}

