'use client';

import Image from 'next/image';
import { useState, useMemo, type ReactElement, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useSessionStore } from '@/store/session';

import { fadeUpVariants } from '@/lib/motion-config';

import { createPost } from '@/services/api/feed';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { getAvatarUrl, isLocalImage } from '@/lib/image-utils';

type ContentType = 'post' | 'reel';

interface CreatePostFormProps {
  readonly onSuccess?: () => void;
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps): ReactElement {
  const queryClient = useQueryClient();
  const user = useSessionStore((state) => state.user);
  const [contentType, setContentType] = useState<ContentType>('post');
  const [caption, setCaption] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed', 'home'] });
      if (contentType === 'reel') {
        queryClient.invalidateQueries({ queryKey: ['feed', 'reels'] });
      }
      // Revocar ObjectURLs antes de limpiar
      previews.forEach((preview) => {
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
      setCaption('');
      setFiles([]);
      setPreviews([]);
      setCurrentPreviewIndex(0);
      setIsExpanded(false);
      toast.success(contentType === 'reel' ? 'Reel creado exitosamente' : 'Publicación creada exitosamente');
      onSuccess?.();
    },
    onError: (error: unknown) => {
      // Extraer información del error de Axios de manera más robusta
      let status: number | undefined;
      let code: string | undefined;
      let message: string | undefined;
      let statusText: string | undefined;
      let errorMessage: string | undefined;
      let errorCode: string | undefined;
      let responseData: unknown;

      try {
        // Intentar extraer información del error de Axios
        const axiosError = error as {
          response?: { 
            status?: number; 
            data?: { code?: string; message?: string; [key: string]: unknown };
            statusText?: string;
          };
          request?: unknown;
          message?: string;
          code?: string;
        };
        
        status = axiosError.response?.status;
        code = axiosError.response?.data?.code;
        message = axiosError.response?.data?.message || axiosError.message;
        statusText = axiosError.response?.statusText;
        errorMessage = axiosError.message;
        errorCode = axiosError.code;
        responseData = axiosError.response?.data;
      } catch (e) {
        // Si hay error al extraer, usar el error original
        errorMessage = String(error);
      }

      // Loggear información útil del error de forma serializable
      const errorInfo = {
        status: status ?? null,
        code: code ?? null,
        message: message ?? null,
        statusText: statusText ?? null,
        errorMessage: errorMessage ?? null,
        errorCode: errorCode ?? null,
        hasResponse: status !== undefined,
        responseData: responseData ? JSON.stringify(responseData, null, 2) : null,
        errorType: error?.constructor?.name ?? typeof error
      };
      
      // Usar JSON.stringify para asegurar que se muestre correctamente
      logger.error('Error al crear publicación', JSON.stringify(errorInfo, null, 2));

      // Mostrar mensaje de error apropiado al usuario
      if (status === 503 || code === 'STORAGE_SERVICE_UNAVAILABLE') {
        toast.error('El servicio de almacenamiento no está disponible. Por favor, verifica que MinIO esté corriendo.', {
          duration: 5000
        });
      } else if (status === 503 && (code === 'STORAGE_AUTH_ERROR' || code === 'STORAGE_ACCESS_DENIED')) {
        toast.error('Credenciales de almacenamiento inválidas. Verifica S3_ACCESS_KEY y S3_SECRET_KEY en tu archivo .env del backend.', {
          duration: 7000
        });
      } else if (status === 503 && code === 'STORAGE_BUCKET_NOT_FOUND') {
        toast.error('El bucket de almacenamiento no existe. Verifica S3_BUCKET_MEDIA en tu archivo .env del backend.', {
          duration: 7000
        });
      } else if (status === 400 && code === 'INVALID_FILE_TYPE') {
        toast.error('Tipo de archivo no permitido. Por favor, sube imágenes (JPEG, PNG, WebP, GIF) o videos (MP4, WebM).', {
          duration: 5000
        });
      } else if (status === 413 || code === 'LIMIT_FILE_SIZE') {
        toast.error('El archivo es demasiado grande. El tamaño máximo permitido es 200MB.', {
          duration: 5000
        });
      } else if (status === 400) {
        toast.error(message || 'Datos inválidos. Por favor, verifica la información del post.');
      } else if (status === 401) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      } else if (status === 500) {
        toast.error('Error del servidor. Por favor, intenta nuevamente más tarde.');
      } else if (!status) {
        toast.error('No se pudo conectar al servidor. Verifica tu conexión a internet.');
      } else {
        toast.error(message || 'No se pudo crear la publicación. Por favor, intenta nuevamente.');
      }
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) {
      return;
    }

    // Si es reel, solo permitir videos y un solo archivo
    if (contentType === 'reel') {
      const videoFiles = selectedFiles.filter((file) => file.type.startsWith('video/'));
      if (videoFiles.length === 0) {
        toast.error('Los reels solo pueden contener videos');
        return;
      }
      if (videoFiles.length > 1) {
        toast.error('Los reels solo pueden tener un video');
        return;
      }
      const videoFile = videoFiles[0];
      if (!videoFile) {
        return;
      }
      const newFiles = [videoFile];
      setFiles(newFiles);
      setCurrentPreviewIndex(0);
      
      // Generar preview del video usando ObjectURL (más eficiente para videos)
      const objectUrl = URL.createObjectURL(videoFile);
      setPreviews([objectUrl]);
      return;
    }

    // Para posts, permitir imágenes y videos
    const validFiles = selectedFiles.filter((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });

    if (validFiles.length !== selectedFiles.length) {
      toast.error('Algunos archivos no son válidos (solo imágenes y videos)');
    }

    if (validFiles.length === 0) {
      return;
    }

    const newFiles = [...files, ...validFiles].slice(0, 10);
    setFiles(newFiles);
    
    // Si es el primer archivo, establecerlo como preview actual
    if (files.length === 0) {
      setCurrentPreviewIndex(0);
    }

    // Generar previews para todas las imágenes y videos
    const currentFilesLength = files.length;
    const newPreviews: string[] = [...previews];
    
    // Agregar placeholders para los nuevos archivos
    for (let i = 0; i < validFiles.length; i++) {
      newPreviews[currentFilesLength + i] = '';
    }
    
    setPreviews(newPreviews);

    // Generar previews de forma asíncrona
    validFiles.forEach((file, fileIndex) => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      // Para videos, usar ObjectURL (más eficiente y evita problemas con data URLs largos)
      if (isVideo) {
        const objectUrl = URL.createObjectURL(file);
        setPreviews((prev) => {
          const updated = [...prev];
          const targetIndex = currentFilesLength + fileIndex;
          while (updated.length <= targetIndex) {
            updated.push('');
          }
          updated[targetIndex] = objectUrl;
          return updated;
        });
      } else if (isImage) {
        // Para imágenes, usar FileReader con data URL (más eficiente para imágenes)
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result && typeof result === 'string' && result.length > 0) {
            setPreviews((prev) => {
              const updated = [...prev];
              const targetIndex = currentFilesLength + fileIndex;
              // Asegurar que el array tenga el tamaño correcto
              while (updated.length <= targetIndex) {
                updated.push('');
              }
              updated[targetIndex] = result;
              return updated;
            });
          }
        };
        reader.onerror = (error) => {
          console.error('Error al leer archivo:', error);
          toast.error(`Error al cargar el preview del archivo ${file.name}`);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFile = (index: number): void => {
    // Revocar ObjectURL si existe antes de eliminar
    const previewToRemove = previews[index];
    if (previewToRemove && previewToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRemove);
    }
    
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    
    // Ajustar el índice del preview actual si es necesario
    if (currentPreviewIndex >= newFiles.length && newFiles.length > 0) {
      setCurrentPreviewIndex(newFiles.length - 1);
    } else if (newFiles.length === 0) {
      setCurrentPreviewIndex(0);
    }
  };
  
  const currentPreview = previews[currentPreviewIndex] || '';
  const currentFile = files[currentPreviewIndex];
  const hasMultipleFiles = files.length > 1;

  // Debug: verificar estado de previews
  useEffect(() => {
    if (files.length > 0) {
      console.log('Files:', files.map(f => ({ name: f.name, type: f.type, size: f.size })));
      console.log('Previews:', previews.map((p, i) => ({ 
        index: i, 
        hasPreview: !!p, 
        length: p?.length || 0,
        previewStart: p?.substring(0, 50) || 'N/A'
      })));
      console.log('Current preview index:', currentPreviewIndex);
      console.log('Current preview exists:', !!currentPreview);
      console.log('Current preview length:', currentPreview?.length || 0);
      console.log('Current file:', currentFile?.name, currentFile?.type);
      console.log('Current preview starts with:', currentPreview?.substring(0, 30) || 'N/A');
    }
  }, [files, previews, currentPreviewIndex, currentPreview, currentFile]);

  const handleContentTypeChange = (type: ContentType): void => {
    // Limpiar archivos al cambiar tipo y revocar ObjectURLs
    previews.forEach((preview) => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });
    setFiles([]);
    setPreviews([]);
    setCurrentPreviewIndex(0);
    setCaption('');
    // Resetear el input de archivos para permitir seleccionar los mismos archivos de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Cambiar el tipo de contenido después de limpiar
    setContentType(type);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    // Validaciones específicas para reels
    if (contentType === 'reel') {
      if (files.length === 0) {
        toast.error('Debes subir un video para crear un reel');
        return;
      }
      if (files.length > 1) {
        toast.error('Los reels solo pueden tener un video');
        return;
      }
      if (!files[0]?.type.startsWith('video/')) {
        toast.error('Los reels solo pueden contener videos');
        return;
      }
    } else {
      // Validaciones para posts
      if (caption.trim().length === 0 && files.length === 0) {
        toast.error('Debes añadir un texto o al menos un archivo');
        return;
      }
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
        {/* Selector de tipo de contenido */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleContentTypeChange('post')}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              contentType === 'post'
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
            }`}
          >
            Post
          </button>
          <button
            type="button"
            onClick={() => handleContentTypeChange('reel')}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              contentType === 'reel'
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
            }`}
          >
            Reel
          </button>
        </div>

        <div className="flex gap-4">
          {/* Avatar */}
          <div className="relative shrink-0 group/avatar">
            <div className="relative size-12 rounded-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 transition-all duration-300 ease-out group-hover/avatar:ring-2 group-hover/avatar:ring-primary-500/40 group-hover/avatar:scale-105">
              {user && avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={user.displayName ?? 'Usuario'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                  unoptimized={isLocalImage(avatarUrl)}
                  key={`${user.id}-${user.avatarUrl ?? 'no-avatar'}`}
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <span className="text-lg font-bold text-primary-400 transition-colors duration-300 group-hover/avatar:text-primary-300">
                    {user?.displayName?.charAt(0).toUpperCase() ?? 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Input y controles */}
          <div className="flex-1 space-y-4 min-w-0">
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
              placeholder={contentType === 'reel' ? 'Escribe una descripción para tu reel...' : '¿Qué estás pensando?'}
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

            {/* Preview principal estilo Instagram */}
            <AnimatePresence mode="wait">
              {files.length > 0 && (
                <motion.div
                  key={currentPreviewIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative w-full rounded-xl overflow-hidden bg-black/20"
                  style={{
                    aspectRatio: contentType === 'reel' ? '9 / 16' : '4 / 5',
                    maxHeight: '600px',
                    minHeight: '300px',
                    borderRadius: '0.75rem'
                  }}
                >
                  {currentPreview && currentPreview.length > 0 ? (
                    <>
                      {currentFile?.type.startsWith('video/') ? (
                        <video
                          key={currentPreviewIndex}
                          src={currentPreview}
                          className="absolute inset-0 w-full h-full object-contain rounded-xl"
                          style={{ borderRadius: '0.75rem' }}
                          muted
                          playsInline
                          loop
                          autoPlay
                          onError={(e) => {
                            const target = e.target as HTMLVideoElement;
                            console.error('Error al cargar video:', {
                              error: target.error?.message || 'Unknown error',
                              code: target.error?.code,
                              srcLength: currentPreview?.length || 0,
                              fileType: currentFile?.type
                            });
                          }}
                          onLoadStart={() => {
                            console.log('Video iniciando carga');
                          }}
                          onLoadedData={() => {
                            console.log('Video cargado correctamente');
                          }}
                        />
                      ) : currentFile?.type.startsWith('image/') ? (
                        <div className="absolute inset-0 rounded-xl overflow-hidden">
                          <img
                            key={currentPreviewIndex}
                            src={currentPreview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                            style={{ 
                              borderRadius: '0.75rem',
                              display: 'block'
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              console.error('Error al cargar imagen:', {
                                error: 'Failed to load image',
                                srcLength: currentPreview?.length || 0,
                                fileType: currentFile?.type
                              });
                            }}
                            onLoad={() => {
                              console.log('Imagen cargada correctamente');
                            }}
                          />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white/40">Tipo de archivo no reconocido</span>
                        </div>
                      )}
                      
                      {/* Botón para eliminar */}
                      <button
                        type="button"
                        onClick={() => removeFile(currentPreviewIndex)}
                        className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-sm p-2 text-white hover:bg-black/80 transition-all z-10"
                      >
                        <svg
                          className="size-5"
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
                      
                      {/* Indicador de múltiples archivos */}
                      {hasMultipleFiles && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                          {files.map((_, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setCurrentPreviewIndex(index)}
                              className={`h-1.5 rounded-full transition-all ${
                                index === currentPreviewIndex
                                  ? 'bg-white w-8'
                                  : 'bg-white/40 w-1.5 hover:bg-white/60'
                              }`}
                              aria-label={`Ver preview ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex flex-col items-center gap-3 text-white/40">
                        <span className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
                        <span className="text-sm">Cargando preview...</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Thumbnails pequeños si hay múltiples archivos */}
            {hasMultipleFiles && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
              >
                {files.map((file, index) => {
                  const preview = previews[index];
                  const isActive = index === currentPreviewIndex;
                  const isVideo = file.type.startsWith('video/');
                  
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentPreviewIndex(index)}
                      className={`relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        isActive
                          ? 'border-white scale-105'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      style={{
                        aspectRatio: contentType === 'reel' ? '9 / 16' : '4 / 5',
                        width: '60px'
                      }}
                    >
                      {preview ? (
                        <>
                          {isVideo ? (
                            <video
                              src={preview}
                              className="w-full h-full object-cover rounded-lg"
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={preview}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          )}
                          {isVideo && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center">
                          <span className="size-3 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}

            {/* Acciones del formulario */}
            <AnimatePresence>
              {(isExpanded || files.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-end gap-3 pt-3 border-t border-white/5 pr-0"
                >
                  <motion.button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:border-primary-500/30 hover:text-white hover:shadow-sm"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {contentType === 'reel' ? 'Video' : 'Fotos/Videos'}
                  </motion.button>

                  <motion.button
                    type="submit"
                    disabled={caption.trim().length === 0 && files.length === 0 || createPostMutation.isPending}
                    whileHover={{ scale: createPostMutation.isPending ? 1 : 1.02, y: -1 }}
                    whileTap={{ scale: createPostMutation.isPending ? 1 : 0.98 }}
                    className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary-500/10 transition-all duration-200 hover:shadow-md hover:shadow-primary-500/20 hover:from-primary-500 hover:via-primary-400 hover:to-accent-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-sm disabled:hover:scale-100 disabled:hover:y-0"
                  >
                    {createPostMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {contentType === 'reel' ? 'Publicando reel...' : 'Publicando...'}
                      </span>
                    ) : (
                      contentType === 'reel' ? 'Publicar Reel' : 'Publicar'
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
          multiple={contentType === 'post'}
          accept={contentType === 'reel' ? 'video/*' : 'image/*,video/*'}
          onChange={handleFileChange}
          className="hidden"
        />
      </form>
    </motion.div>
  );
}
