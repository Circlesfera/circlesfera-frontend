'use client';

import Image from 'next/image';
import { useState, useMemo, type ReactElement, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useSessionStore } from '@/store/session';

import { fadeUpVariants } from '@/lib/motion-config';

import { createPost } from '@/services/api/feed';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { getAvatarUrl, isLocalImage } from '@/lib/image-utils';

interface CreatePostFormProps {
  readonly onSuccess?: () => void;
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps): ReactElement {
  const queryClient = useQueryClient();
  const user = useSessionStore((state) => state.user);
  const [caption, setCaption] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
      setCaption('');
      setFiles([]);
      setPreviews([]);
      setIsExpanded(false);
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

  // Obtener avatar sincronizado del usuario actual - usar useMemo para re-renderizar cuando cambie
  const avatarUrl = useMemo(() => {
    if (!user) return null;
    return getAvatarUrl(user.avatarUrl ?? null, user.handle);
  }, [user?.avatarUrl, user?.handle]);

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="rounded-3xl glass-card p-5 md:p-6 mb-6 border border-white/5 shadow-elegant-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="relative shrink-0 group/avatar">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/30 via-primary-400/30 to-primary-600/30 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 blur-md" />
            <div className="relative size-12 rounded-full ring-2 ring-primary-500/20 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
              {user && avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={user.displayName ?? 'Usuario'}
                  fill
                  className="object-cover"
                  unoptimized={isLocalImage(avatarUrl)}
                  key={`${user.id}-${user.avatarUrl ?? 'no-avatar'}`} // Force re-render when avatar changes
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <span className="text-lg font-bold text-primary-400">
                    {user?.displayName?.charAt(0).toUpperCase() ?? 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Input y controles */}
          <div className="flex-1 space-y-4">
            {/* Textarea mejorado */}
            <textarea
              value={caption}
              onChange={(e) => {
                setCaption(e.target.value);
                if (e.target.value.length > 0 || files.length > 0) {
                  setIsExpanded(true);
                }
              }}
              onFocus={() => {
                setIsExpanded(true);
              }}
              placeholder="¿Qué estás pensando?"
              maxLength={2200}
              rows={isExpanded ? 4 : 3}
              className="w-full resize-none rounded-xl border border-white/5 bg-white/5 px-4 py-3.5 text-base text-white placeholder:text-white/30 transition-all duration-200 focus:border-primary-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />

            {/* Contador de caracteres */}
            {isExpanded && (
              <div className="flex justify-end">
                <span className={`text-xs ${caption.length > 2100 ? 'text-red-400' : 'text-white/40'}`}>
                  {caption.length}/2200
                </span>
              </div>
            )}

            {/* Preview de archivos */}
            <AnimatePresence>
              {previews.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                >
                  {previews.map((preview, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.02 }}
                      className="relative aspect-square group rounded-xl overflow-hidden glass-card border border-white/5 transition-all duration-300"
                    >
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <motion.button
                        type="button"
                        onClick={() => {
                          removeFile(index);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute right-2 top-2 rounded-full bg-red-600/90 backdrop-blur-sm p-1.5 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 shadow-lg"
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
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Acciones del formulario */}
            <AnimatePresence>
              {(isExpanded || files.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between gap-4 pt-3 border-t border-white/5"
                >
                  <motion.button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Fotos/Videos
                  </motion.button>

                  <motion.button
                    type="submit"
                    disabled={caption.trim().length === 0 && files.length === 0 || createPostMutation.isPending}
                    whileHover={{ scale: createPostMutation.isPending ? 1 : 1.05 }}
                    whileTap={{ scale: createPostMutation.isPending ? 1 : 0.95 }}
                    className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-primary-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
                  >
                    {createPostMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Publicando...
                      </span>
                    ) : (
                      'Publicar'
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input de archivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </form>
    </motion.div>
  );
}
