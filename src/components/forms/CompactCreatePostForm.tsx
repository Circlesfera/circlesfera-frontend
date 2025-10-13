"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/features/auth/useAuth';
import { createImagePost, createVideoPost } from '@/services/postService';
import { Button } from '@/design-system/Button';
import { cn } from '@/utils/cn';

// Iconos SVG optimizados
const ImageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const VideoIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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

interface CompactCreatePostFormProps {
  onPostCreated: () => void;
}

export default function CompactCreatePostForm({ onPostCreated }: CompactCreatePostFormProps) {
  const { token } = useAuth();
  const [postType, setPostType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile) {
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

      const maxSize = postType === 'image' ? 5 * 1024 * 1024 : 100 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError(`El archivo es demasiado grande. Máximo ${postType === 'image' ? '5MB' : '100MB'}`);
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

      if (postType === 'image') {
        await createImagePost([file], caption);
      } else {
        await createVideoPost(file, caption);
      }

      setCaption('');
      setFile(null);
      setPreview(null);
      setPostType('image');

      onPostCreated();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message || 'Error al crear la publicación');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCaption('');
    setFile(null);
    setPreview(null);
    setPostType('image');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selector de tipo compacto */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPostType('image')}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            postType === 'image'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
          )}
        >
          <ImageIcon className="w-4 h-4" />
          Foto
        </button>

        <button
          type="button"
          onClick={() => setPostType('video')}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            postType === 'video'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
          )}
        >
          <VideoIcon className="w-4 h-4" />
          Video
        </button>
      </div>

      {/* Área de upload compacta */}
      <div>
        {!preview ? (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer",
              isDragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Arrastra un {postType === 'image' ? 'imagen' : 'video'} aquí
            </p>
            <p className="text-xs text-gray-500">
              o haz clic para seleccionar
            </p>
          </div>
        ) : (
          <div className="relative">
            {postType === 'image' ? (
              <Image src={preview} alt="Vista previa del post" width={400} height={192} className="w-full h-48 object-cover rounded-lg" />
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

      {/* Caption compacta */}
      <div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Escribe una descripción..."
          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-sm text-gray-900"
          rows={2}
          maxLength={2200}
        />
        <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
          {caption.length}/2200
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
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={loading || !file}
          loading={loading}
        >
          {loading ? 'Publicando...' : 'Publicar'}
        </Button>
      </div>
    </form>
  );
}
