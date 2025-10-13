"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { createReel } from '@/services/reelService';
import { Button } from '@/design-system/Button';
import { cn } from '@/utils/cn';

// Iconos SVG optimizados
const VideoIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const HashtagIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
  </svg>
);

const LocationIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const MusicIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
  </svg>
);

interface CompactCreateReelFormProps {
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

export default function CompactCreateReelForm({ onReelCreated, onClose }: CompactCreateReelFormProps) {
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
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile) {
      if (!selectedFile.type.startsWith('video/')) {
        setError('Por favor selecciona un archivo de video válido');
        return;
      }

      const maxSize = 100 * 1024 * 1024; // 100MB
      if (selectedFile.size > maxSize) {
        setError('El video es demasiado grande. Máximo 100MB');
        return;
      }

      setVideoFile(selectedFile);
      setError('');

      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

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
    if (!user || !videoFile) return;

    setIsUploading(true);
    setError(null);

    try {
      // Crear FormData para el reel
      const reelFormData = new FormData();
      reelFormData.append('video', videoFile);
      reelFormData.append('caption', formData.caption);
      reelFormData.append('hashtags', formData.hashtags);
      reelFormData.append('location', formData.location);
      reelFormData.append('audioTitle', formData.audioTitle);
      reelFormData.append('audioArtist', formData.audioArtist);
      reelFormData.append('allowComments', formData.allowComments.toString());
      reelFormData.append('allowDuets', formData.allowDuets.toString());
      reelFormData.append('allowStitches', formData.allowStitches.toString());

      await createReel(reelFormData);

      // Limpiar formulario
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

      onReelCreated();
      // Cerrar el modal después de crear el reel
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message || 'Error al crear el reel');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Área de upload de video */}
      <div>
        {!videoPreview ? (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer",
              isDragOver
                ? 'border-pink-400 bg-pink-50'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:bg-gray-50 dark:bg-gray-800'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <VideoIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-1">
              Arrastra un video aquí
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
              o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              MP4, AVI, MOV hasta 100MB
            </p>
          </div>
        ) : (
          <div className="relative">
            <video
              src={videoPreview}
              controls
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => {
                setVideoFile(null);
                setVideoPreview(null);
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) {
              handleFileSelect(selectedFile);
            }
          }}
          className="hidden"
        />
      </div>

      {/* Caption */}
      <div>
        <textarea
          name="caption"
          value={formData.caption}
          onChange={handleInputChange}
          placeholder="Escribe una descripción para tu reel..."
          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 text-sm"
          rows={2}
          maxLength={2200}
        />
        <div className="text-right text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
          {formData.caption.length}/2200
        </div>
      </div>

      {/* Hashtags */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <HashtagIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 dark:text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hashtags</span>
        </div>
        <input
          name="hashtags"
          value={formData.hashtags}
          onChange={handleInputChange}
          placeholder="#hashtag1 #hashtag2 #hashtag3"
          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 text-sm"
        />
      </div>

      {/* Ubicación */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <LocationIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 dark:text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación</span>
        </div>
        <input
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="¿Dónde estás?"
          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 text-sm"
        />
      </div>

      {/* Audio */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MusicIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Canción</span>
          </div>
          <input
            name="audioTitle"
            value={formData.audioTitle}
            onChange={handleInputChange}
            placeholder="Título de la canción"
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 text-sm"
          />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Artista</span>
          </div>
          <input
            name="audioArtist"
            value={formData.audioArtist}
            onChange={handleInputChange}
            placeholder="Nombre del artista"
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 text-sm"
          />
        </div>
      </div>

      {/* Configuraciones */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Configuraciones</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="allowComments"
              checked={formData.allowComments}
              onChange={handleInputChange}
              className="rounded border-gray-300 dark:border-gray-600 text-pink-600 focus:ring-pink-500"
            />
            Permitir comentarios
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="allowDuets"
              checked={formData.allowDuets}
              onChange={handleInputChange}
              className="rounded border-gray-300 dark:border-gray-600 text-pink-600 focus:ring-pink-500"
            />
            Permitir duetos
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="allowStitches"
              checked={formData.allowStitches}
              onChange={handleInputChange}
              className="rounded border-gray-300 dark:border-gray-600 text-pink-600 focus:ring-pink-500"
            />
            Permitir stitches
          </label>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Botones compactos */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetForm}
          disabled={isUploading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isUploading || !videoFile}
          loading={isUploading}
        >
          {isUploading ? 'Creando...' : 'Crear Reel'}
        </Button>
      </div>
    </form>
  );
}
