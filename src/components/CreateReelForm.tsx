"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { createReel } from '@/services/reelService';
import logger from '@/utils/logger';

interface CreateReelFormProps {
  onReelCreated: () => void;
  onClose: () => void;
}

interface ReelFormData {
  caption: string;
  hashtags: string;
  location: string;
  audioTitle: string;
  audioArtist: string;
  allowComments: boolean;
  allowDuets: boolean;
  allowStitches: boolean;
}

export default function CreateReelForm({ onReelCreated, onClose }: CreateReelFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ReelFormData>({
    caption: '',
    hashtags: '',
    location: '',
    audioTitle: '',
    audioArtist: '',
    allowComments: true,
    allowDuets: true,
    allowStitches: true
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Manejar selección de video
  const handleVideoSelect = useCallback((file: File) => {
    // Validar tipo de archivo
    if (!file.type.startsWith('video/')) {
      setError('Por favor selecciona un archivo de video válido');
      return;
    }

    // Validar tamaño (máximo 100MB para reels)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setError('El video es demasiado grande. Máximo 100MB');
      return;
    }

    setVideoFile(file);
    setError(null);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setVideoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Manejar drop de archivos
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0]) {
      handleVideoSelect(files[0]);
    }
  }, [handleVideoSelect]);

  // Manejar drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Abrir selector de archivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Crear el reel
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
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('video', videoFile);
      formDataToSend.append('caption', formData.caption);
      formDataToSend.append('hashtags', formData.hashtags);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('audioTitle', formData.audioTitle);
      formDataToSend.append('audioArtist', formData.audioArtist);
      formDataToSend.append('allowComments', formData.allowComments.toString());
      formDataToSend.append('allowDuets', formData.allowDuets.toString());
      formDataToSend.append('allowStitches', formData.allowStitches.toString());

      // Simular progreso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await createReel(formDataToSend);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        // Esperar un momento para mostrar el progreso completo
        setTimeout(() => {
          onReelCreated();
        }, 500);
      } else {
        throw new Error(response.message || 'Error al crear el reel');
      }

    } catch (createReelError) {
      logger.error('Error creating reel:', {
        error: createReelError instanceof Error ? createReelError.message : 'Unknown error',
        videoSize: videoFile?.size,
        caption: formData.caption.substring(0, 50)
      });
      setError(createReelError instanceof Error ? createReelError.message : 'Error al crear el reel');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Limpiar formulario
  const handleReset = () => {
    setFormData({
      caption: '',
      hashtags: '',
      location: '',
      audioTitle: '',
      audioArtist: '',
      allowComments: true,
      allowDuets: true,
      allowStitches: true
    });
    setVideoFile(null);
    setVideoPreview(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Crear Reel</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500 dark:text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Área de video */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Video (Proporción 9:16 recomendada)
            </label>

            {!videoPreview ? (
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={openFileSelector}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M4 7h16M4 4h16M4 16h16" />
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
              <div className="relative">
                <video
                  ref={videoRef}
                  src={videoPreview}
                  className="w-full h-64 object-cover rounded-xl"
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
                if (file) handleVideoSelect(file);
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
              name="caption"
              value={formData.caption}
              onChange={handleInputChange}
              rows={3}
              maxLength={2200}
              placeholder="Cuenta tu historia..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 dark:text-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 text-right">
              {formData.caption.length}/2200
            </p>
          </div>

          {/* Hashtags */}
          <div>
            <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hashtags
            </label>
            <input
              type="text"
              id="hashtags"
              name="hashtags"
              value={formData.hashtags}
              onChange={handleInputChange}
              placeholder="hashtag1, hashtag2, hashtag3..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
              Separa los hashtags con comas
            </p>
          </div>

          {/* Ubicación */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ubicación
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="¿Dónde estás?"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Información de audio */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="audioTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título del audio
              </label>
              <input
                type="text"
                id="audioTitle"
                name="audioTitle"
                value={formData.audioTitle}
                onChange={handleInputChange}
                placeholder="Nombre de la canción"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="audioArtist" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Artista
              </label>
              <input
                type="text"
                id="audioArtist"
                name="audioArtist"
                value={formData.audioArtist}
                onChange={handleInputChange}
                placeholder="Nombre del artista"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Configuraciones */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Configuraciones
            </label>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="allowComments"
                  checked={formData.allowComments}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Permitir comentarios</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="allowDuets"
                  checked={formData.allowDuets}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Permitir duets</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="allowStitches"
                  checked={formData.allowStitches}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Permitir stitches</span>
              </label>
            </div>
          </div>

          {/* Barra de progreso */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                <span>Subiendo video...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

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
              onClick={handleReset}
              disabled={isUploading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 transition-colors disabled:opacity-50"
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
