"use client";

import React, { useRef, useState, useCallback } from 'react';
import { createImageStory, createVideoStory, createTextStory, Story } from '@/services/storyService';
import { useAuth } from '@/features/auth/useAuth';
import { Button } from '@/design-system/Button';
import { cn } from '@/utils/cn';

// Iconos SVG optimizados
const CameraIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const VideoIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const TextIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
  </svg>
);

const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface CompactCreateStoryFormProps {
  onStoryCreated?: (story: Story) => void;
  onClose?: () => void;
}

type StoryType = 'image' | 'video' | 'text';

export default function CompactCreateStoryForm({ onStoryCreated, onClose }: CompactCreateStoryFormProps) {
  const { user } = useAuth();
  const [storyType, setStoryType] = useState<StoryType>('image');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile) {
      const isImage = selectedFile.type.startsWith('image/');
      const isVideo = selectedFile.type.startsWith('video/');
      
      if (storyType === 'image' && !isImage) {
        setError('Por favor selecciona una imagen válida');
        return;
      }
      
      if (storyType === 'video' && !isVideo) {
        setError('Por favor selecciona un video válido');
        return;
      }

      const maxSize = storyType === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError(`El archivo es demasiado grande. Máximo ${storyType === 'image' ? '5MB' : '50MB'}`);
        return;
      }

      setFile(selectedFile);
      setError('');

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [storyType]);

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
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      let story: Story;

      if (storyType === 'text') {
        if (!text.trim()) {
          setError('Por favor escribe algún texto');
          return;
        }
        story = await createTextStory(text, textColor, backgroundColor);
      } else {
        if (!file) {
          setError(`Por favor selecciona un ${storyType === 'image' ? 'imagen' : 'video'}`);
          return;
        }

        if (storyType === 'image') {
          story = await createImageStory(file, text);
        } else {
          story = await createVideoStory(file, text);
        }
      }

      // Limpiar formulario
      setText('');
      setFile(null);
      setPreview(null);
      setStoryType('image');
      setTextColor('#ffffff');
      setBackgroundColor('#000000');
      
      onStoryCreated?.(story);
      onClose?.();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message || 'Error al crear el story');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setText('');
    setFile(null);
    setPreview(null);
    setStoryType('image');
    setTextColor('#ffffff');
    setBackgroundColor('#000000');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selector de tipo compacto */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setStoryType('image')}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            storyType === 'image' 
              ? 'bg-purple-100 text-purple-700 border border-purple-300' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
          )}
        >
          <CameraIcon className="w-4 h-4" />
          Foto
        </button>
        
        <button
          type="button"
          onClick={() => setStoryType('video')}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            storyType === 'video' 
              ? 'bg-purple-100 text-purple-700 border border-purple-300' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
          )}
        >
          <VideoIcon className="w-4 h-4" />
          Video
        </button>

        <button
          type="button"
          onClick={() => setStoryType('text')}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            storyType === 'text' 
              ? 'bg-purple-100 text-purple-700 border border-purple-300' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
          )}
        >
          <TextIcon className="w-4 h-4" />
          Texto
        </button>
      </div>

      {/* Contenido según el tipo */}
      {storyType === 'text' ? (
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe tu story..."
            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-sm"
            rows={3}
            maxLength={1000}
          />
          
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Color del texto</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-8 rounded border border-gray-200"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Color de fondo</label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-full h-8 rounded border border-gray-200"
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          {!preview ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer",
                isDragOver 
                  ? 'border-purple-400 bg-purple-50' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Arrastra un {storyType === 'image' ? 'imagen' : 'video'} aquí
              </p>
              <p className="text-xs text-gray-500">
                o haz clic para seleccionar
              </p>
            </div>
          ) : (
            <div className="relative">
              {storyType === 'image' ? (
                <img src={preview} alt="preview" className="w-full h-48 object-cover rounded-lg" />
              ) : (
                <video 
                  src={preview} 
                  controls 
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
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
            accept={storyType === 'image' ? 'image/*' : 'video/*'}
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                handleFileSelect(selectedFile);
              }
            }}
            className="hidden"
          />

          {/* Texto opcional para imagen/video */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Añade un texto (opcional)..."
            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-sm mt-3"
            rows={2}
            maxLength={500}
          />
        </div>
      )}

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
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={loading || (storyType !== 'text' && !file) || (storyType === 'text' && !text.trim())}
          loading={loading}
        >
          {loading ? 'Creando...' : 'Crear Story'}
        </Button>
      </div>
    </form>
  );
}
