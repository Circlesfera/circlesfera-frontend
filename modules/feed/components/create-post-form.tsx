'use client';

import Image from 'next/image';
import { useState, type ReactElement, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { fadeUpVariants } from '@/lib/motion-config';

import { createPost } from '@/services/api/feed';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
      logger.error('Error al crear publicación', { error });
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
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
    >
      <Card padding="lg" variant="glass" className="w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
        <Textarea
          value={caption}
          onChange={(e) => {
            setCaption(e.target.value);
          }}
          placeholder="¿Qué estás pensando?"
          maxLength={2200}
          showCount
          className="min-h-[100px]"
        />

        {previews.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {previews.map((preview, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="relative aspect-square group rounded-xl overflow-hidden glass-card transition-all duration-300"
              >
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <button
                  type="button"
                  onClick={() => {
                    removeFile(index);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-red-600/90 backdrop-blur-sm p-1.5 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:scale-110 shadow-lg"
                >
                  <svg
                    className="size-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </motion.div>
            ))}
          </motion.div>
        ) : null}

        <div className="flex items-center justify-between pt-3 border-t divider">
          <Button
            type="button"
            intent="ghost"
            size="md"
            onClick={() => {
              fileInputRef.current?.click();
            }}
            leftIcon={
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          >
            Fotos/Videos
          </Button>
          <Button
            type="submit"
            intent="primary"
            size="md"
            loading={createPostMutation.isPending}
            disabled={caption.trim().length === 0 && files.length === 0}
          >
            Publicar
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </form>
    </Card>
    </motion.div>
  );
}

