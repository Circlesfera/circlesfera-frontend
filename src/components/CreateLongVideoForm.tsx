"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { createLongVideo } from '@/services/longVideoService';

interface CreateLongVideoFormProps {
  onVideoCreated: () => void;
  onClose: () => void;
}

interface LongVideoFormData {
  title: string;
  description: string;
  category: string;
  tags: string;
  location: string;
  allowComments: boolean;
  allowDownloads: boolean;
  isMonetized: boolean;
}

const CATEGORIES = [
  'general',
  'entretenimiento',
  'educativo',
  'música',
  'deportes',
  'cocina',
  'viajes',
  'tecnología',
  'moda',
  'belleza',
  'fitness',
  'arte',
  'negocios',
  'política',
  'noticias',
  'documental',
  'tutorial',
  'review',
  'podcast',
  'other'
];

export default function CreateLongVideoForm({ onVideoCreated, onClose }: CreateLongVideoFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<LongVideoFormData>({
    title: '',
    description: '',
    category: 'general',
    tags: '',
    location: '',
    allowComments: true,
    allowDownloads: true,
    isMonetized: false
  });
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    // Validar tamaño (máximo 2GB para videos largos)
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > maxSize) {
      setError('El video es demasiado grande. Máximo 2GB');
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
    if (files.length > 0) {
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

  // Crear el video largo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      setError('Por favor selecciona un video');
      return;
    }

    if (!formData.title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    if (!user) {
      setError('Debes estar autenticado para crear un video');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('video', videoFile);
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('allowComments', formData.allowComments.toString());
      formDataToSend.append('allowDownloads', formData.allowDownloads.toString());
      formDataToSend.append('isMonetized', formData.isMonetized.toString());

      // Simular progreso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 300);

      const response = await createLongVideo(formDataToSend);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        // Esperar un momento para mostrar el progreso completo
        setTimeout(() => {
          onVideoCreated();
        }, 500);
      } else {
        throw new Error(response.message || 'Error al crear el video');
      }

    } catch (error) {
      console.error('Error creando video largo:', error);
      setError(error instanceof Error ? error.message : 'Error al crear el video');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Limpiar formulario
  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      category: 'general',
      tags: '',
      location: '',
      allowComments: true,
      allowDownloads: true,
      isMonetized: false
    });
    setVideoFile(null);
    setVideoPreview(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Crear Video Largo (IGTV)</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Área de video */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Video (Proporción 16:9 recomendada)
            </label>
            
            {!videoPreview ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={openFileSelector}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M4 7h16M4 4h16M4 16h16" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Haz clic para seleccionar
                  </span>{' '}
                  o arrastra y suelta
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  MP4, MOV, AVI hasta 2GB
                </p>
              </div>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  src={videoPreview}
                  className="w-full h-48 object-cover rounded-xl"
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

          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              maxLength={100}
              placeholder="Título atractivo para tu video..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-xs text-gray-500 text-right">
              {formData.title.length}/100
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              maxLength={2000}
              placeholder="Describe tu video, agrega contexto, enlaces relevantes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="mt-1 text-xs text-gray-500 text-right">
              {formData.description.length}/2000
            </p>
          </div>

          {/* Categoría y Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="tag1, tag2, tag3..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separa los tags con comas
              </p>
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="¿Dónde se grabó este video?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Configuraciones */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Configuraciones
            </label>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="allowComments"
                  checked={formData.allowComments}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Permitir comentarios</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="allowDownloads"
                  checked={formData.allowDownloads}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Permitir descargas</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isMonetized"
                  checked={formData.isMonetized}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Video monetizado</span>
              </label>
            </div>
          </div>

          {/* Barra de progreso */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subiendo video...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
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
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={!videoFile || !formData.title.trim() || isUploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Creando...' : 'Crear Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
