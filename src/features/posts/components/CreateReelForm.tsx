"use client";

import React, { useState, useRef } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { createReel } from '@/services/reelService';
import logger from '@/utils/logger';

interface CreateReelFormProps {
  onReelCreated: () => void;
}

export default function CreateReelForm({ onReelCreated }: CreateReelFormProps) {
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile) {
      // Validar tipo de archivo
      if (!selectedFile.type.startsWith('video/')) {
        setError('Por favor selecciona un video válido');
        return;
      }

      // Validar tamaño (máximo 100MB para reels)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('El video es demasiado grande. Máximo 100MB');
        return;
      }

      setVideoFile(selectedFile);
      setError('');

      // Crear preview
      const fileUrl = URL.createObjectURL(selectedFile);
      setVideoPreview(fileUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      setError('Por favor selecciona un video');
      return;
    }

    if (!user) {
      setError('Debes estar autenticado para crear un reel');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('video', videoFile);
      formDataToSend.append('caption', caption);

      const response = await createReel(formDataToSend);

      if (response.success) {
        // Limpiar formulario
        setCaption('');
        setVideoFile(null);
        setVideoPreview(null);
        onReelCreated();
      } else {
        throw new Error(response.message || 'Error al crear el reel');
      }
    } catch (createReelError) {
      logger.error('Error creating reel:', {
        error: createReelError instanceof Error ? createReelError.message : 'Unknown error',
        videoSize: videoFile?.size,
        caption: caption.substring(0, 50)
      });
      setError(createReelError instanceof Error ? createReelError.message : 'Error al crear el reel');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setCaption('');
    setVideoFile(null);
    setVideoPreview(null);
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
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Crear Reel</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Comparte un video corto con tus amigos</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Área de video */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video (Proporción 9:16 vertical)
            </label>

            {!videoPreview ? (
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer aspect-[9/16] max-w-xs mx-auto"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Haz clic para seleccionar
                  </span>{' '}
                  o arrastra y suelta
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  MP4, MOV, AVI hasta 100MB
                </p>
              </div>
            ) : (
              <div className="relative aspect-[9/16] max-w-xs mx-auto">
                <video
                  src={videoPreview}
                  className="w-full h-full object-cover rounded-xl"
                  controls
                />
                <button
                  type="button"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreview(null);
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
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
            />
          </div>

          {/* Caption */}
          <div>
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              maxLength={2200}
              placeholder="Cuenta tu historia..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 dark:text-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 text-right">
              {caption.length}/2200
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
              disabled={!videoFile || isUploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Creando...' : 'Crear Reel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
