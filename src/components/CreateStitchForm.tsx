'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Scissors, Music, Hash, MapPin } from 'lucide-react';
import { createStitch } from '@/services/reelService';
import { useToast } from './Toast';
import type { Reel } from '@/types';

interface CreateStitchFormProps {
  originalReel: Reel;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateStitchForm({ originalReel, onClose, onSuccess }: CreateStitchFormProps) {
  const toast = useToast();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const originalVideoRef = useRef<HTMLVideoElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [stitchStartTime, setStitchStartTime] = useState(0);
  const [stitchDuration, setStitchDuration] = useState(5);
  const [formData, setFormData] = useState({
    caption: `Stitch con @${originalReel.user.username}`,
    hashtags: '',
    location: '',
    audioTitle: originalReel.audio?.title || '',
    audioArtist: originalReel.audio?.artist || '',
    allowComments: true,
    allowDuets: true,
    allowStitches: true,
  });

  // Utilidad para formatear tiempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Obtener duración del video original
  useEffect(() => {
    if (originalVideoRef.current) {
      const video = originalVideoRef.current;
      video.addEventListener('loadedmetadata', () => {
        setVideoDuration(video.duration);
      });
    }
  }, []);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('video/')) {
      toast.error('Por favor selecciona un archivo de video');
      return;
    }

    // Validar tamaño (máximo 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('El video no puede exceder 100MB');
      return;
    }

    setVideoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      toast.error('Por favor selecciona un video');
      return;
    }

    if (stitchStartTime + stitchDuration > videoDuration) {
      toast.error('El clip seleccionado excede la duración del video');
      return;
    }

    setUploading(true);

    try {
      const stitchFormData = new FormData();
      stitchFormData.append('video', videoFile);
      stitchFormData.append('caption', formData.caption);
      stitchFormData.append('stitchStartTime', stitchStartTime.toString());
      stitchFormData.append('stitchDuration', stitchDuration.toString());
      if (formData.hashtags) stitchFormData.append('hashtags', formData.hashtags);
      if (formData.location) stitchFormData.append('location', formData.location);
      if (formData.audioTitle) stitchFormData.append('audioTitle', formData.audioTitle);
      if (formData.audioArtist) stitchFormData.append('audioArtist', formData.audioArtist);
      stitchFormData.append('allowComments', formData.allowComments.toString());
      stitchFormData.append('allowDuets', formData.allowDuets.toString());
      stitchFormData.append('allowStitches', formData.allowStitches.toString());

      const response = await createStitch(originalReel._id, stitchFormData);

      if (response.success) {
        toast.success('¡Stitch creado exitosamente!');
        onSuccess?.();
        onClose();
      }
    } catch {
      toast.error('Error al crear el stitch. Intenta de nuevo.');
      // Error ya logueado por el interceptor de axios
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Crear Stitch</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">
                Usa un clip de @{originalReel.user.username} y agrega tu reacción
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Reel con Selector de Clip */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
                  <Scissors className="w-5 h-5 text-purple-600" />
                  <span>Selecciona el Clip</span>
                </h3>
                <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden relative mb-4">
                  <video
                    ref={originalVideoRef}
                    src={originalReel.video.url}
                    poster={originalReel.video.thumbnail}
                    className="w-full h-full object-cover"
                    controls
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-sm font-medium">
                      @{originalReel.user.username}
                    </p>
                  </div>
                </div>

                {/* Selector de Tiempo */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tiempo de Inicio: {formatTime(stitchStartTime)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, videoDuration - stitchDuration)}
                      step="0.1"
                      value={stitchStartTime}
                      onChange={(e) => setStitchStartTime(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duración del Clip: {formatTime(stitchDuration)} (max 15s)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="0.5"
                      value={stitchDuration}
                      onChange={(e) => setStitchDuration(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>

                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      <strong>Clip seleccionado:</strong> {formatTime(stitchStartTime)} - {formatTime(stitchStartTime + stitchDuration)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tu Video */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Tu Reacción</h3>
                {preview ? (
                  <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden relative">
                    <video
                      src={preview}
                      className="w-full h-full object-cover"
                      controls
                    />
                    <button
                      onClick={() => {
                        setPreview(null);
                        setVideoFile(null);
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="aspect-[9/16] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors"
                  >
                    <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 dark:text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 font-medium">Sube tu reacción</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-2">El clip se mostrará primero</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-1">Máx. 100MB</p>
                  </div>
                )}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Escribe una descripción..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                  maxLength={2200}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    Hashtags
                  </label>
                  <input
                    type="text"
                    value={formData.hashtags}
                    onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                    placeholder="#stitch #reaction"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ciudad, País"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Audio Info */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Music className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">Audio Original</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {formData.audioTitle || 'Sin título'} - {formData.audioArtist || 'Artista desconocido'}
                </p>
              </div>

              {/* Opciones */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowComments}
                    onChange={(e) => setFormData({ ...formData, allowComments: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Permitir comentarios</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowDuets}
                    onChange={(e) => setFormData({ ...formData, allowDuets: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Permitir duets en este video</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowStitches}
                    onChange={(e) => setFormData({ ...formData, allowStitches: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Permitir stitches en este video</span>
                </label>
              </div>

              {/* Preview del Stitch */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Vista previa:</strong> Se mostrará el clip de {formatTime(stitchDuration)} segundos
                  (desde {formatTime(stitchStartTime)}) seguido de tu video.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!videoFile || uploading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {uploading ? 'Creando Stitch...' : 'Publicar Stitch'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

