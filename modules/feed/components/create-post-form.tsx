'use client';

import Image from 'next/image';
import { useState, type ReactElement, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPost } from '@/services/api/feed';
import { toast } from 'sonner';

interface CreatePostFormProps {
  readonly onSuccess?: () => void;
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps): ReactElement {
  const queryClient = useQueryClient();
  const [caption, setCaption] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
      setCaption('');
      setFiles([]);
      setPreviews([]);
      toast.success('Publicación creada exitosamente');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('No se pudo crear la publicación');
      console.error(error);
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) {
      return;
    }

    const validFiles = selectedFiles.filter((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });

    if (validFiles.length !== selectedFiles.length) {
      toast.error('Algunos archivos no son válidos (solo imágenes y videos)');
    }

    const newFiles = [...files, ...validFiles].slice(0, 10);
    setFiles(newFiles);

    // Generar previews
    const newPreviews: string[] = [];
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newPreviews.push(result);
        setPreviews((prev) => [...prev, ...newPreviews]);
      };
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFile = (index: number): void => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (caption.trim().length === 0 && files.length === 0) {
      toast.error('Debes añadir un texto o al menos un archivo');
      return;
    }

    createPostMutation.mutate({ caption, media: files });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
      <div className="space-y-4">
        <textarea
          value={caption}
          onChange={(e) => {
            setCaption(e.target.value);
          }}
          placeholder="¿Qué está pasando?"
          maxLength={2200}
          rows={4}
          className="w-full resize-none rounded-xl border border-white/10 bg-slate-800/60 p-4 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/40"
        />
        <div className="text-xs text-white/50 text-right">
          {caption.length}/2200
        </div>

        {previews.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 p-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-square">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    removeFile(index);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white transition hover:bg-red-600"
                >
                  <svg
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              fileInputRef.current?.click();
            }}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Media ({files.length}/10)
          </button>
          <button
            type="submit"
            disabled={createPostMutation.isPending || (caption.trim().length === 0 && files.length === 0)}
            className="rounded-full bg-primary-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createPostMutation.isPending ? 'Publicando...' : 'Publicar'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </form>
  );
}

