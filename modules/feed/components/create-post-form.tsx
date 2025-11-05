'use client';

import Image from 'next/image';
import { useState, useMemo, type ReactElement, useRef, useEffect, useCallback } from 'react';
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

// Componente para el preview de media - aislado para evitar re-renders del formulario
// Definido como función nombrada para mejor compatibilidad con React 19/Turbopack
function MediaPreview({ 
  previews, 
  files, 
  currentPreviewIndex, 
  contentType, 
  onRemove,
  onIndexChange 
}: {
  previews: string[];
  files: File[];
  currentPreviewIndex: number;
  contentType: ContentType;
  onRemove: (index: number) => void;
  onIndexChange: (index: number) => void;
}) {
  const currentPreview = previews[currentPreviewIndex] || '';
  const currentFile = files[currentPreviewIndex];
  const hasMultipleFiles = files.length > 1;
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (files.length === 0) return null;

  // Detectar aspect ratio real de la imagen - verificar tanto en useEffect como en onLoad
  useEffect(() => {
    if (currentFile?.type.startsWith('image/') && imgRef.current) {
      const img = imgRef.current;
      // Verificar si la imagen ya está cargada
      if (img.complete && img.naturalWidth && img.naturalHeight) {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        setImageAspectRatio(aspectRatio);
      } else {
        // Si no está cargada, esperar a que se cargue
        const handleLoad = () => {
          if (img.naturalWidth && img.naturalHeight) {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            setImageAspectRatio(aspectRatio);
          }
        };
        img.addEventListener('load', handleLoad);
        return () => {
          img.removeEventListener('load', handleLoad);
        };
      }
    }
  }, [currentPreview, currentFile?.type]);

  // Detectar aspect ratio real del video
  useEffect(() => {
    if (currentFile?.type.startsWith('video/') && videoRef.current) {
      const video = videoRef.current;
      const handleLoadedMetadata = () => {
        if (video.videoWidth && video.videoHeight) {
          const aspectRatio = video.videoWidth / video.videoHeight;
          setVideoAspectRatio(aspectRatio);
        }
      };
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      if (video.readyState >= 1) {
        handleLoadedMetadata();
      }
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [currentPreview, currentFile?.type]);

  // Calcular aspect ratio a usar: priorizar el real de la imagen/video, sino usar el default
  // Usar el aspect ratio real del archivo para que el contenedor se adapte y no haya márgenes
  // Asegurar formato correcto para CSS aspect-ratio (puede ser número o string "width / height")
  const aspectRatio = useMemo(() => {
    if (currentFile?.type.startsWith('video/')) {
      if (videoAspectRatio) {
        // Para videos, usar el aspect ratio detectado directamente
        return videoAspectRatio.toString();
      }
      return contentType === 'reel' ? '9 / 16' : '4 / 5';
    }
    if (currentFile?.type.startsWith('image/')) {
      if (imageAspectRatio) {
        // Para imágenes, usar el aspect ratio detectado directamente
        // Si es 1:1, devolver '1' o '1 / 1' (ambos funcionan en CSS)
        return imageAspectRatio.toString();
      }
      return '4 / 5';
    }
    return contentType === 'reel' ? '9 / 16' : '4 / 5';
  }, [currentFile?.type, videoAspectRatio, imageAspectRatio, contentType]);

  // Debug: Log cuando cambian los previews
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('[MediaPreview] Preview state updated', {
        currentPreviewIndex,
        currentPreviewExists: !!currentPreview,
        currentPreviewLength: currentPreview?.length || 0,
        totalPreviews: previews.length,
        totalFiles: files.length,
        imageAspectRatio,
        videoAspectRatio,
        calculatedAspectRatio: aspectRatio
      });
    }
  }, [currentPreviewIndex, currentPreview, previews.length, files.length, imageAspectRatio, videoAspectRatio, aspectRatio]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPreviewIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative w-full rounded-lg overflow-hidden bg-black/20 isolate"
        style={{
          aspectRatio: aspectRatio,
          maxHeight: '280px',
          minHeight: '180px',
          maxWidth: '100%',
          borderRadius: '0.5rem',
          transform: 'translateZ(0)',
          contain: 'layout style paint',
          willChange: 'auto',
          backfaceVisibility: 'hidden',
          perspective: '1000px'
        }}
      >
        {currentPreview && currentPreview.length > 0 ? (
          <>
            {currentFile?.type.startsWith('video/') ? (
              <video
                ref={videoRef}
                key={currentPreviewIndex}
                src={currentPreview}
                className="absolute inset-0 w-full h-full rounded-lg"
                style={{ 
                  borderRadius: '0.5rem',
                  objectFit: videoAspectRatio ? 'cover' : 'contain',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  contain: 'layout style paint'
                }}
                muted
                playsInline
                loop
                autoPlay
                preload="metadata"
                onError={(e) => {
                  const target = e.target as HTMLVideoElement;
                  logger.error('[CreatePostForm] Error al cargar video preview', {
                    error: target.error?.message || 'Unknown error',
                    code: target.error?.code,
                    srcLength: currentPreview?.length || 0,
                    fileType: currentFile?.type
                  });
                }}
                onLoadStart={() => {
                  if (process.env.NODE_ENV === 'development') {
                    logger.debug('[CreatePostForm] Video preview iniciando carga');
                  }
                }}
                onLoadedData={() => {
                  if (process.env.NODE_ENV === 'development') {
                    logger.debug('[CreatePostForm] Video preview cargado correctamente');
                  }
                }}
              />
            ) : currentFile?.type.startsWith('image/') ? (
              <img
                ref={imgRef}
                key={currentPreviewIndex}
                src={currentPreview}
                alt="Preview"
                className="absolute inset-0 w-full h-full rounded-lg"
                style={{ 
                  borderRadius: '0.5rem',
                  display: 'block',
                  objectFit: imageAspectRatio ? 'cover' : 'contain',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  imageRendering: 'auto',
                  WebkitBackfaceVisibility: 'hidden'
                }}
                loading="eager"
                decoding="sync"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  logger.error('[CreatePostForm] Error al cargar imagen preview', {
                    error: 'Failed to load image',
                    srcLength: currentPreview?.length || 0,
                    fileType: currentFile?.type
                  });
                }}
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (img.naturalWidth && img.naturalHeight) {
                    const aspectRatio = img.naturalWidth / img.naturalHeight;
                    setImageAspectRatio(aspectRatio);
                  }
                  if (process.env.NODE_ENV === 'development') {
                    logger.debug('[CreatePostForm] Imagen preview cargada correctamente', {
                      width: img.naturalWidth,
                      height: img.naturalHeight,
                      aspectRatio: img.naturalWidth / img.naturalHeight
                    });
                  }
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/40">Tipo de archivo no reconocido</span>
              </div>
            )}
            
            {/* Botón para eliminar */}
            <button
              type="button"
              onClick={() => onRemove(currentPreviewIndex)}
              className="absolute top-1.5 right-1.5 rounded-full bg-black/80 backdrop-blur-sm p-1 text-white hover:bg-red-500/90 transition-all z-10 shadow-lg"
              style={{ 
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            >
              <svg
                className="size-3.5"
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
              <div 
                className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-10"
                style={{ 
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden'
                }}
              >
                {files.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => onIndexChange(index)}
                    className={`h-1 rounded-full transition-all ${
                      index === currentPreviewIndex
                        ? 'bg-white w-6'
                        : 'bg-white/40 w-1 hover:bg-white/60'
                    }`}
                    aria-label={`Ver preview ${index + 1}`}
                    style={{ 
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden'
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div 
            className="flex items-center justify-center h-full"
            style={{ 
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            <div className="flex flex-col items-center gap-3 text-white/40">
              <span className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              <span className="text-sm">Cargando preview...</span>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function CreatePostForm({ onSuccess }: CreatePostFormProps): ReactElement {
  const queryClient = useQueryClient();
  const user = useSessionStore((state) => state.user);
  const [contentType, setContentType] = useState<ContentType>('post');
  const [caption, setCaption] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Trackear si alguna vez tuvimos preview para mantener clase fija
  const hasEverHadPreviewRef = useRef(false);

  // Batch updates de previews para evitar múltiples re-renders
  const previewUpdateQueueRef = useRef<Map<number, string>>(new Map());
  const previewUpdateTimeoutRef = useRef<number | null>(null);

  const batchUpdatePreviews = useCallback((index: number, preview: string) => {
    previewUpdateQueueRef.current.set(index, preview);

    // Limpiar animationFrame anterior
    if (previewUpdateTimeoutRef.current !== null) {
      cancelAnimationFrame(previewUpdateTimeoutRef.current);
    }

    // Usar requestAnimationFrame para asegurar que se ejecute en el siguiente frame
    previewUpdateTimeoutRef.current = requestAnimationFrame(() => {
      setPreviews((prev) => {
        const updated = [...prev];
        previewUpdateQueueRef.current.forEach((value, key) => {
          while (updated.length <= key) {
            updated.push('');
          }
          updated[key] = value;
        });
        
        if (process.env.NODE_ENV === 'development') {
          logger.debug('[CreatePostForm] Batch update previews executed', {
            queueSize: previewUpdateQueueRef.current.size,
            updatedIndices: Array.from(previewUpdateQueueRef.current.keys()),
            previewsLength: updated.length,
            previewAtIndex: updated[index]?.substring(0, 50) || 'empty'
          });
        }
        
        previewUpdateQueueRef.current.clear();
        previewUpdateTimeoutRef.current = null;
        return updated;
      });
    });
  }, []);

  // Cleanup del batch update
  useEffect(() => {
    return () => {
      if (previewUpdateTimeoutRef.current !== null) {
        cancelAnimationFrame(previewUpdateTimeoutRef.current);
      }
      previewUpdateQueueRef.current.clear();
    };
  }, []);

  // Memoizar callback de success para evitar re-renders
  const handleSuccess = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('[CreatePostForm] Post created successfully', {
        contentType
      });
    }

    // Revocar ObjectURLs antes de limpiar
    previews.forEach((preview) => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });

    // Limpiar estado local
    setCaption('');
    setFiles([]);
    setPreviews([]);
    setCurrentPreviewIndex(0);
    setIsExpanded(false);
    setHasPreviewState(false);
    hasEverHadPreviewRef.current = false;
    
    toast.success(contentType === 'reel' ? 'Reel creado exitosamente' : 'Publicación creada exitosamente');

    // Invalidar queries sin refetch inmediato para evitar re-renders durante scroll
    const invalidateQueries = () => {
      queryClient.invalidateQueries({ 
        queryKey: ['feed', 'home'],
        refetchType: 'none'
      });
      if (contentType === 'reel') {
        queryClient.invalidateQueries({ 
          queryKey: ['feed', 'reels'],
          refetchType: 'none'
        });
      }
      if (process.env.NODE_ENV === 'development') {
        logger.debug('[CreatePostForm] Queries invalidated (stale marked, no immediate refetch)');
      }
      onSuccess?.();
    };

    // Invalidar inmediatamente pero sin refetch
    invalidateQueries();
  }, [contentType, previews, onSuccess, queryClient]);

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: handleSuccess,
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
      hasEverHadPreviewRef.current = true;
      
      // Generar preview del video usando ObjectURL
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
    hasEverHadPreviewRef.current = true;
    
    // Si es el primer archivo, establecerlo como preview actual
    if (files.length === 0) {
      setCurrentPreviewIndex(0);
    }

    // Preparar array de previews con placeholders
    const currentFilesLength = files.length;
    const newPreviews: string[] = [...previews];
    for (let i = 0; i < validFiles.length; i++) {
      if (newPreviews.length <= currentFilesLength + i) {
        newPreviews.push('');
      }
    }
    setPreviews(newPreviews);

    // Generar previews de forma asíncrona
    // Para el primer archivo, actualizar inmediatamente para feedback instantáneo
    // Para múltiples archivos, usar batch updates
    validFiles.forEach((file, fileIndex) => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      const targetIndex = currentFilesLength + fileIndex;
      const isFirstFile = fileIndex === 0 && currentFilesLength === 0;
      
      if (isVideo) {
        const objectUrl = URL.createObjectURL(file);
        
        // Si es el primer archivo, actualizar inmediatamente
        if (isFirstFile) {
          setPreviews((prev) => {
            const updated = [...prev];
            updated[targetIndex] = objectUrl;
            if (process.env.NODE_ENV === 'development') {
              logger.debug('[CreatePostForm] Immediate preview update for first file (video)', {
                index: targetIndex,
                previewLength: objectUrl.length
              });
            }
            return updated;
          });
        } else {
          // Para múltiples archivos, usar batch update
          batchUpdatePreviews(targetIndex, objectUrl);
        }
      } else if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result && typeof result === 'string' && result.length > 0) {
            // Si es el primer archivo, actualizar inmediatamente
            if (isFirstFile) {
              setPreviews((prev) => {
                const updated = [...prev];
                updated[targetIndex] = result;
                if (process.env.NODE_ENV === 'development') {
                  logger.debug('[CreatePostForm] Immediate preview update for first file (image)', {
                    index: targetIndex,
                    previewLength: result.length
                  });
                }
                return updated;
              });
            } else {
              // Para múltiples archivos, usar batch update
              batchUpdatePreviews(targetIndex, result);
            }
          }
        };
        reader.onerror = (error) => {
          logger.error('[CreatePostForm] Error al leer archivo para preview', error);
          toast.error(`Error al cargar el preview del archivo ${file.name}`);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFile = useCallback((index: number): void => {
    // Revocar ObjectURL si existe antes de eliminar
    const previewToRemove = previews[index];
    if (previewToRemove && previewToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRemove);
    }
    
    setFiles((prevFiles) => {
      const newFiles = prevFiles.filter((_, i) => i !== index);
      setPreviews((prevPreviews) => {
        const newPreviews = prevPreviews.filter((_, i) => i !== index);
        
        // Ajustar el índice del preview actual si es necesario
        setCurrentPreviewIndex((prevIndex) => {
          if (prevIndex >= newFiles.length && newFiles.length > 0) {
            return newFiles.length - 1;
          } else if (newFiles.length === 0) {
            hasEverHadPreviewRef.current = false;
            return 0;
          }
          return prevIndex;
        });
        
        return newPreviews;
      });
      return newFiles;
    });
  }, [previews]);
  
  const handleIndexChange = useCallback((index: number): void => {
    setCurrentPreviewIndex(index);
  }, []);

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
    setHasPreviewState(false);
    hasEverHadPreviewRef.current = false;
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

  // Obtener avatar sincronizado del usuario actual
  const avatarUrl = useMemo(() => {
    if (!user) return null;
    return getAvatarUrl(user.avatarUrl ?? null, user.handle);
  }, [user?.avatarUrl, user?.handle]);

  // Logging para debug visual
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && createPostMutation.isPending) {
      logger.debug('[CreatePostForm] Upload started', {
        filesCount: files.length,
        contentType
      });
    }
  }, [createPostMutation.isPending, files.length, contentType]);

  // Clase fija cuando hay preview - sin cambios dinámicos durante scroll
  // Usar estado para trackear si debemos usar fondo sólido (evita re-renders por ref)
  const [hasPreviewState, setHasPreviewState] = useState(false);
  
  // Actualizar estado cuando files cambia, pero solo una vez
  useEffect(() => {
    if (files.length > 0 && !hasPreviewState) {
      setHasPreviewState(true);
      hasEverHadPreviewRef.current = true;
    } else if (files.length === 0 && hasPreviewState && !hasEverHadPreviewRef.current) {
      // Solo resetear si no había preview antes (evitar reset durante scroll)
      setHasPreviewState(false);
    }
  }, [files.length, hasPreviewState]);

  const containerClassName = useMemo(() => {
    // Si hay preview o alguna vez lo hubo, usar fondo sólido permanentemente
    if (hasPreviewState || hasEverHadPreviewRef.current) {
      return "rounded-3xl p-4 md:p-5 mb-6 border border-white/5 shadow-elegant-lg bg-slate-900/95";
    }
    return "rounded-3xl glass-card p-4 md:p-5 mb-6 border border-white/5 shadow-elegant-lg";
  }, [hasPreviewState]); // Solo depende del estado, no del ref directamente

  // Estilos completamente estáticos - sin cambios durante scroll
  const containerStyle = useMemo(() => ({
    transform: 'translateZ(0)',
    isolation: 'isolate' as const,
    contain: 'layout style paint' as const,
    willChange: 'auto' as const,
    // Si hay preview, siempre desactivar backdrop-filter
    ...((hasPreviewState || hasEverHadPreviewRef.current) && {
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      background: 'rgba(15, 23, 42, 0.95)'
    })
  }), [hasPreviewState]); // Solo depende del estado

  const hasMultipleFiles = files.length > 1;

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className={containerClassName}
      style={containerStyle}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Selector de tipo de contenido */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleContentTypeChange('post')}
            className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
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
            className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
              contentType === 'reel'
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
            }`}
          >
            Reel
          </button>
        </div>

        {/* Layout principal: Grid cuando hay media, flex cuando no */}
        <div className={`${files.length > 0 ? 'grid grid-cols-1 lg:grid-cols-3 gap-3' : 'flex gap-3'}`}>
          {/* Columna izquierda: Avatar + Textarea */}
          <div className={`${files.length > 0 ? 'lg:col-span-2' : 'flex-1'} flex gap-3`}>
            {/* Avatar */}
            <div className="relative shrink-0 group/avatar">
              <div className="relative size-9 rounded-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 transition-all duration-300 ease-out group-hover/avatar:ring-2 group-hover/avatar:ring-primary-500/40 group-hover/avatar:scale-105">
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
                    <span className="text-sm font-bold text-primary-400 transition-colors duration-300 group-hover/avatar:text-primary-300">
                      {user?.displayName?.charAt(0).toUpperCase() ?? 'U'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Textarea y controles */}
            <div className="flex-1 space-y-2 min-w-0">
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
                rows={isExpanded ? 2 : 1}
                className="w-full resize-none rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:border-primary-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />

              {/* Contador de caracteres */}
              {isExpanded && (
                <div className="flex justify-end">
                  <span className={`text-xs ${caption.length > 2100 ? 'text-red-400' : 'text-white/40'}`}>
                    {caption.length}/2200
                  </span>
                </div>
              )}

              {/* Thumbnails pequeños si hay múltiples archivos - solo cuando NO hay preview grande */}
              {hasMultipleFiles && files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
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
                            ? 'border-primary-500 scale-105'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                        style={{
                          aspectRatio: contentType === 'reel' ? '9 / 16' : '4 / 5',
                          width: '45px'
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
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <svg className="size-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full bg-white/10 flex items-center justify-center">
                            <span className="size-2.5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
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
                    className="flex items-center justify-end gap-2 pt-2 border-t border-white/5"
                  >
                    <motion.button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:border-primary-500/30 hover:text-white"
                    >
                      <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {contentType === 'reel' ? 'Video' : 'Media'}
                    </motion.button>

                    <motion.button
                      type="submit"
                      disabled={caption.trim().length === 0 && files.length === 0 || createPostMutation.isPending}
                      whileHover={{ scale: createPostMutation.isPending ? 1 : 1.02 }}
                      whileTap={{ scale: createPostMutation.isPending ? 1 : 0.98 }}
                      className="rounded-lg bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-primary-500/10 transition-all duration-200 hover:shadow-md hover:shadow-primary-500/20 hover:from-primary-500 hover:via-primary-400 hover:to-accent-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-sm disabled:hover:scale-100"
                    >
                      {createPostMutation.isPending ? (
                        <span className="flex items-center gap-1.5">
                          <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          {contentType === 'reel' ? 'Publicando...' : 'Publicando...'}
                        </span>
                      ) : (
                        contentType === 'reel' ? 'Publicar' : 'Publicar'
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Columna derecha: Preview principal cuando hay media */}
          {files.length > 0 && (
            <div className="lg:col-span-1">
              <MediaPreview
                previews={previews}
                files={files}
                currentPreviewIndex={currentPreviewIndex}
                contentType={contentType}
                onRemove={removeFile}
                onIndexChange={handleIndexChange}
              />
            </div>
          )}
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

// Exportar componente - memo removido temporalmente para compatibilidad con React 19/Turbopack
// El componente ya tiene optimizaciones internas (useMemo, useCallback) que previenen re-renders innecesarios
export { CreatePostForm };
export default CreatePostForm;
