"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/features/auth/useAuth';
import { createImagePost, createVideoPost } from '@/services/postService';
import ImageCropEditor from './ImageCropEditor';
import logger from '@/utils/logger';

// Iconos SVG
const ImageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const VideoIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TextIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

interface CreatePostFormProps {
  onPostCreated: () => void;
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const { user, token } = useAuth();
  const [postType, setPostType] = useState<'image' | 'video'>('image');
  const [text, setText] = useState('');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5'>('1:1');
  const [originalAspectRatio, setOriginalAspectRatio] = useState<number>(1);
  const [showCropEditor, setShowCropEditor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile) {
      // Validar tipo de archivo
      const isImage = selectedFile.type.startsWith('image/');
      const isVideo = selectedFile.type.startsWith('video/');

      if (postType === 'image' && !isImage) {
        setError('Por favor selecciona una imagen válida');
        return;
      }

      if (postType === 'video' && !isVideo) {
        setError('Por favor selecciona un video válido');
        return;
      }

      // Validar tamaño
      const maxSize = postType === 'image' ? 5 * 1024 * 1024 : 100 * 1024 * 1024; // 5MB para imágenes, 100MB para videos
      if (selectedFile.size > maxSize) {
        setError(`El archivo es demasiado grande. Máximo ${postType === 'image' ? '5MB' : '100MB'}`);
        return;
      }

      setFile(selectedFile);
      setError('');

      // Crear preview y detectar aspect ratio
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);

        // Detectar aspect ratio de la imagen
        if (postType === 'image') {
          const img = document.createElement('img');
          img.onload = () => {
            const ratio = img.width / img.height;

            // Guardar el aspect ratio original real (con precisión decimal)
            setOriginalAspectRatio(ratio);

            // Determinar el aspect ratio más cercano para display
            if (Math.abs(ratio - 1) < 0.1) {
              setAspectRatio('1:1'); // Cuadrado
            } else if (Math.abs(ratio - 0.8) < 0.1) {
              setAspectRatio('4:5'); // Vertical
            } else if (ratio < 1) {
              setAspectRatio('4:5'); // Por defecto vertical
            } else {
              setAspectRatio('1:1'); // Por defecto cuadrado
            }

            logger.debug('Aspect ratio detectado:', {
              original: ratio.toFixed(3),
              category: ratio < 1 ? '4:5' : '1:1'
            });
          };
          img.src = result;
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      if (!file) {
        setError(`Por favor selecciona un ${postType === 'image' ? 'imagen' : 'video'}`);
        return;
      }

      // Combinar texto y caption
      const fullCaption = text.trim() ? `${text.trim()}\n\n${caption}` : caption;

      if (postType === 'image') {
        await createImagePost([file], fullCaption, aspectRatio, originalAspectRatio);
      } else {
        await createVideoPost(file, fullCaption, aspectRatio, originalAspectRatio);
      }

      // Limpiar formulario
      setText('');
      setCaption('');
      setFile(null);
      setPreview(null);
      setPostType('image');

      onPostCreated();
    } catch (createPostError: unknown) {
      logger.error('Error creating post:', {
        error: createPostError instanceof Error ? createPostError.message : 'Unknown error',
        postType,
        hasFile: !!file
      });
      const err = createPostError as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message || 'Error al crear la publicación');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setText('');
    setCaption('');
    setFile(null);
    setPreview(null);
    setPostType('image');
    setError('');
  };

  return (
    <div>
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          {user?.avatar ? (
            <Image src={user.avatar} alt={`Avatar de ${user.username}`} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-white">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Crear publicación</h3>
            <p className="text-sm text-gray-500">Comparte fotos y videos con tus amigos</p>
          </div>
        </div>

        {/* Selector de tipo de publicación */}
        <div className="flex space-x-2 mb-4">
          <button
            type="button"
            onClick={() => setPostType('image')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${postType === 'image'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <ImageIcon />
            <span className="font-medium">Foto</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType('video')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${postType === 'video'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <VideoIcon />
            <span className="font-medium">Video</span>
          </button>
        </div>

        {/* Selector visual de aspect ratio - Solo para imágenes */}
        {postType === 'image' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Formato de la publicación
            </label>
            <div className="flex space-x-4">
              {/* Opción 1:1 (Cuadrado) */}
              <motion.button
                type="button"
                onClick={() => setAspectRatio('1:1')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${aspectRatio === '1:1'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  {/* Icono visual cuadrado */}
                  <motion.div
                    animate={{
                      scale: aspectRatio === '1:1' ? 1.05 : 1
                    }}
                    transition={{ duration: 0.2 }}
                    className={`w-16 h-16 rounded border-2 ${aspectRatio === '1:1' ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-gray-50'
                      }`}
                  />
                  <div className="text-center">
                    <div className={`font-semibold ${aspectRatio === '1:1' ? 'text-blue-700' : 'text-gray-700'}`}>
                      Cuadrado
                    </div>
                    <div className="text-xs text-gray-500">1:1</div>
                  </div>
                  <AnimatePresence>
                    {aspectRatio === '1:1' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center text-blue-600 text-sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Seleccionado
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>

              {/* Opción 4:5 (Vertical) */}
              <motion.button
                type="button"
                onClick={() => setAspectRatio('4:5')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${aspectRatio === '4:5'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  {/* Icono visual vertical */}
                  <motion.div
                    animate={{
                      scale: aspectRatio === '4:5' ? 1.05 : 1
                    }}
                    transition={{ duration: 0.2 }}
                    className={`w-12 h-16 rounded border-2 ${aspectRatio === '4:5' ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-gray-50'
                      }`}
                  />
                  <div className="text-center">
                    <div className={`font-semibold ${aspectRatio === '4:5' ? 'text-blue-700' : 'text-gray-700'}`}>
                      Vertical
                    </div>
                    <div className="text-xs text-gray-500">4:5</div>
                  </div>
                  <AnimatePresence>
                    {aspectRatio === '4:5' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center text-blue-600 text-sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Seleccionado
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {aspectRatio === '1:1'
                ? '📷 Formato clásico de Instagram - Foto cuadrada balanceada'
                : '📱 Ocupa más espacio en el feed - Ideal para retratos y productos'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Área de upload de archivo */}
          <div className="mb-4">
            {!preview ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <UploadIcon />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Arrastra un {postType === 'image' ? 'imagen' : 'video'} aquí o
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                >
                  Seleccionar {postType === 'image' ? 'imagen' : 'video'}
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {postType === 'image'
                    ? 'PNG, JPG, GIF, WebP hasta 5MB'
                    : 'MP4, AVI, MOV, WebM hasta 100MB'
                  }
                </p>
              </div>
            ) : (
              <div className="relative">
                {postType === 'image' ? (
                  <div className="space-y-4">
                    <div className={`relative mx-auto ${aspectRatio === '1:1' ? 'aspect-square max-w-md' : 'aspect-[4/5] max-w-sm'} bg-black rounded-lg overflow-hidden`}>
                      <Image
                        src={preview}
                        alt="Vista previa de la publicación"
                        width={600}
                        height={aspectRatio === '1:1' ? 600 : 750}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Botón de editar */}
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setShowCropEditor(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Editar Imagen</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative mx-auto max-w-md bg-black rounded-lg overflow-hidden">
                    <video
                      src={preview}
                      controls
                      className="w-full max-h-96 object-contain"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <CloseIcon />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={postType === 'image' ? 'image/*' : 'video/*'}
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  handleFileSelect(selectedFile);
                }
              }}
              className="hidden"
            />
          </div>

          {/* Texto principal */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <TextIcon />
              <span className="text-sm font-medium text-gray-700">¿Qué quieres compartir?</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-gray-900"
              rows={3}
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
              {text.length}/5000 caracteres
            </div>
          </div>

          {/* Caption adicional */}
          <div className="mb-4">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Añade una descripción adicional (opcional)"
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-gray-900"
              rows={2}
              maxLength={2200}
            />
            <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
              {caption.length}/2200 caracteres
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !file}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="spinner"></div>
                  <span>Publicando...</span>
                </div>
              ) : (
                'Publicar'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Crop Editor Modal */}
      {showCropEditor && preview && postType === 'image' && (
        <ImageCropEditor
          imageUrl={preview}
          aspectRatio={aspectRatio}
          onAspectRatioChange={(newRatio) => {
            setAspectRatio(newRatio);
          }}
          onClose={() => setShowCropEditor(false)}
        />
      )}
    </div>
  );
}
