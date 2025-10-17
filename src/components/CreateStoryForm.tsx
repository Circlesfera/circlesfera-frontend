"use client";

import React, { useState, useRef } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { createStory } from '@/services/storyService';
import logger from '@/utils/logger';

interface CreateStoryFormProps {
  onStoryCreated: () => void;
}

export default function CreateStoryForm({ onStoryCreated }: CreateStoryFormProps) {
  const { user } = useAuth();
  const [storyType, setStoryType] = useState<'image' | 'video' | 'text'>('image');
  const [caption, setCaption] = useState('');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile) {
      // Validar tipo de archivo según el tipo de story
      if (storyType === 'image' && !selectedFile.type.startsWith('image/')) {
        setError('Por favor selecciona una imagen válida');
        return;
      }

      if (storyType === 'video' && !selectedFile.type.startsWith('video/')) {
        setError('Por favor selecciona un video válido');
        return;
      }

      // Validar tamaño (máximo 50MB para stories)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 50MB para stories');
        return;
      }

      setSelectedFile(selectedFile);
      setError('');

      // Crear preview
      const fileUrl = URL.createObjectURL(selectedFile);
      setPreview(fileUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (storyType !== 'text' && !selectedFile) {
      setError('Por favor selecciona un archivo');
      return;
    }

    if (storyType === 'text' && !textContent.trim()) {
      setError('Por favor escribe algo para tu story');
      return;
    }

    if (!user) {
      setError('Debes estar autenticado para crear una story');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();

      if (storyType !== 'text' && selectedFile) {
        formDataToSend.append(storyType, selectedFile);
      }

      formDataToSend.append('type', storyType);
      formDataToSend.append('caption', caption);

      if (storyType === 'text') {
        formDataToSend.append('textContent', textContent);
      }

      const response = await createStory(formDataToSend);

      if (response.success) {
        // Limpiar formulario
        setCaption('');
        setTextContent('');
        setSelectedFile(null);
        setPreview(null);
        onStoryCreated();
      } else {
        throw new Error(response.message || 'Error al crear la story');
      }
    } catch (createStoryError) {
      logger.error('Error creating story:', {
        error: createStoryError instanceof Error ? createStoryError.message : 'Unknown error',
        storyType,
        hasMedia: !!preview
      });
      setError(createStoryError instanceof Error ? createStoryError.message : 'Error al crear la story');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setCaption('');
    setTextContent('');
    setSelectedFile(null);
    setPreview(null);
    setError('');
  };

  return (
    <div>
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          {user?.avatar ? (
            <img src={user.avatar} alt={`Avatar de ${user.username}`} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-white">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Crear Story</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Comparte un momento efímero con tus amigos</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de story */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipo de story
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setStoryType('image')}
                className={`p-3 rounded-lg border-2 transition-all ${storyType === 'image'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                <svg className="w-6 h-6 mx-auto mb-1 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">Imagen</p>
              </button>

              <button
                type="button"
                onClick={() => setStoryType('video')}
                className={`p-3 rounded-lg border-2 transition-all ${storyType === 'video'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                <svg className="w-6 h-6 mx-auto mb-1 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">Video</p>
              </button>

              <button
                type="button"
                onClick={() => setStoryType('text')}
                className={`p-3 rounded-lg border-2 transition-all ${storyType === 'text'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                <svg className="w-6 h-6 mx-auto mb-1 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">Texto</p>
              </button>
            </div>
          </div>

          {/* Contenido */}
          {storyType === 'text' ? (
            <div>
              <label htmlFor="textContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Escribe tu story
              </label>
              <textarea
                id="textContent"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={4}
                maxLength={200}
                placeholder="¿Qué está pasando?"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 dark:text-gray-100"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 text-right">
                {textContent.length}/200
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {storyType === 'image' ? 'Subir imagen (9:16 vertical)' : 'Subir video (9:16 vertical)'}
              </label>

              {!preview ? (
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer aspect-[9/16] max-w-xs mx-auto"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {storyType === 'image' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    )}
                  </svg>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Haz clic para seleccionar
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    {storyType === 'image' ? 'JPG, PNG hasta 10MB' : 'MP4, MOV hasta 50MB'}
                  </p>
                </div>
              ) : (
                <div className="relative aspect-[9/16] max-w-xs mx-auto">
                  {storyType === 'image' ? (
                    <img
                      src={preview}
                      alt="Vista previa de la story"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <video
                      src={preview}
                      className="w-full h-full object-cover rounded-xl"
                      controls
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={storyType === 'image' ? 'image/*' : 'video/*'}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />
            </div>
          )}

          {/* Caption */}
          <div>
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              maxLength={200}
              placeholder="Añade una descripción..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 dark:text-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 text-right">
              {caption.length}/200
            </p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={resetForm}
              disabled={isUploading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={isUploading || (storyType !== 'text' && !selectedFile) || (storyType === 'text' && !textContent.trim())}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Creando...' : 'Crear Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
