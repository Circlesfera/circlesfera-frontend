'use client';

import Image from 'next/image';
import { useState, useRef, useEffect, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { createStory, type CreateStoryPayload } from '@/services/api/stories';
import { uploadMedia } from '@/services/api/media';

interface CreateStoryDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: -20 }
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

export function CreateStoryDialog({ open, onClose }: CreateStoryDialogProps): ReactElement {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

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

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('Solo se permiten imágenes y videos');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 15MB');
      return;
    }

    setSelectedFile(file);

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
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
      const mediaResult = await uploadMedia(selectedFile);

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

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Verificar que el componente está montado (para SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!mounted) {
    return <></>;
  }

  const modalContent = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-[9999] bg-black/80 dark:bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Contenedor centrado del modal */}
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              pointerEvents: 'none'
            }}
          >
            {/* Modal */}
            <motion.div
              key="modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ 
                type: 'spring', 
                damping: 30, 
                stiffness: 400,
                duration: 0.3
              }}
              className={`
                relative w-full pointer-events-auto
                rounded-3xl border border-slate-200/50 dark:border-white/10
                bg-gradient-to-br from-white dark:from-slate-900/95 via-slate-50 dark:via-slate-800/95 to-white dark:to-slate-900/95
                backdrop-blur-2xl shadow-2xl shadow-black/50
                overflow-hidden
                flex flex-col
                ${selectedFile ? 'max-w-sm' : 'max-w-md'}
                max-h-[90vh]
              `}
              style={{ 
                maxHeight: '90vh'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                {!selectedFile ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col"
                  >
                    {/* Header minimalista */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/50 dark:border-white/5 shrink-0">
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Crear Story</h2>
                      <motion.button
                        type="button"
                        onClick={handleClose}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="rounded-full p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                        aria-label="Cerrar"
                      >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </div>

                    {/* Upload Area - Centrado verticalmente y compacto */}
                    <div className="flex-1 flex items-center justify-center p-5 min-h-0 overflow-y-auto">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="
                          w-full max-w-xs mx-auto
                          flex flex-col items-center gap-4
                          rounded-2xl border-2 border-dashed border-white/10
                          bg-gradient-to-br from-white/5 to-white/[0.02]
                          p-6
                          cursor-pointer
                          transition-all duration-300
                          hover:border-primary-500/40 hover:bg-white/10
                          group
                        "
                      >
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                          className="
                            size-14 rounded-full
                            bg-gradient-to-br from-primary-500/20 via-primary-400/20 to-accent-500/20
                            flex items-center justify-center
                            ring-4 ring-primary-500/10
                            group-hover:ring-primary-500/30
                            transition-all duration-300
                          "
                        >
                          <svg 
                            className="size-7 text-primary-400 group-hover:text-primary-300 transition-colors" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </motion.div>
                        
                        <div className="text-center space-y-1.5">
                          <p className="text-sm font-semibold text-white">Sube una foto o video</p>
                          <p className="text-xs text-slate-400 max-w-[200px]">
                            Las stories duran 24 horas
                          </p>
                        </div>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="
                            rounded-xl
                            bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500
                            px-5 py-2
                            text-sm font-semibold text-white
                            shadow-lg shadow-primary-500/30
                            transition-all duration-300
                            hover:shadow-xl hover:shadow-primary-500/40
                          "
                        >
                          Seleccionar archivo
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col flex-1 min-h-0"
                    style={{ maxHeight: '90vh' }}
                  >
                    {/* Header compacto */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 shrink-0">
                      <h2 className="text-base font-semibold text-white">Vista previa</h2>
                      <div className="flex items-center gap-2">
                        <motion.button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreview(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          disabled={uploading}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="
                            rounded-lg px-3 py-1.5
                            text-xs font-medium text-slate-300
                            bg-white/5 border border-white/10
                            transition-all duration-200
                            hover:bg-white/10 hover:text-white
                            disabled:opacity-50 disabled:cursor-not-allowed
                          "
                        >
                          Cambiar
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={handleClose}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="
                            rounded-full p-1.5
                            text-slate-400
                            hover:text-white hover:bg-white/10
                            transition-colors
                          "
                          aria-label="Cerrar"
                        >
                          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </motion.button>
                      </div>
                    </div>

                    {/* Preview - Aspect ratio 9:16, perfectamente centrado */}
                    <div className="flex-1 flex items-center justify-center p-4 min-h-0 overflow-y-auto">
                      <div 
                        className="
                          relative w-full max-w-[240px]
                          rounded-2xl border border-white/10
                          bg-black/50 shadow-xl
                          overflow-hidden
                        "
                        style={{ 
                          aspectRatio: '9/16',
                          maxHeight: 'calc(90vh - 160px)'
                        }}
                      >
                        {selectedFile.type.startsWith('image/') ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={preview || ''}
                              alt="Preview de story"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <video
                            src={preview || ''}
                            className="w-full h-full object-cover"
                            controls
                            playsInline
                          />
                        )}
                      </div>
                    </div>

                    {/* Actions - Fijas en la parte inferior */}
                    <div className="border-t border-white/5 bg-white/5 px-5 py-3 shrink-0">
                      <motion.button
                        type="button"
                        onClick={handleSubmit}
                        disabled={uploading || createStoryMutation.isPending}
                        whileHover={{ 
                          scale: uploading || createStoryMutation.isPending ? 1 : 1.02 
                        }}
                        whileTap={{ 
                          scale: uploading || createStoryMutation.isPending ? 1 : 0.98 
                        }}
                        className="
                          w-full rounded-xl
                          bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500
                          px-6 py-3
                          text-sm font-semibold text-white
                          shadow-lg shadow-primary-500/30
                          transition-all duration-300
                          hover:shadow-xl hover:shadow-primary-500/40
                          disabled:opacity-50 disabled:cursor-not-allowed
                        "
                      >
                        {uploading || createStoryMutation.isPending ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            {uploading ? 'Subiendo...' : 'Publicando...'}
                          </span>
                        ) : (
                          'Compartir Story'
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            {/* Input oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Seleccionar archivo para story"
            />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
