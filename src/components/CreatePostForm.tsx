"use client";

import React, { useState, useRef } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { createImagePost, createVideoPost } from '@/services/postService';
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

      // Crear preview
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

      // Combinar texto y caption
      const fullCaption = text.trim() ? `${text.trim()}\n\n${caption}` : caption;

      if (postType === 'image') {
        await createImagePost([file], fullCaption);
      } else {
        await createVideoPost(file, fullCaption);
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
            <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
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
        <div className="flex space-x-2 mb-6">
          <button
            type="button"
            onClick={() => setPostType('image')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              postType === 'image'
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
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              postType === 'video'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <VideoIcon />
            <span className="font-medium">Video</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Área de upload de archivo */}
          <div className="mb-4">
            {!preview ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <UploadIcon />
                <p className="text-gray-600 mb-2">
                  Arrastra un {postType === 'image' ? 'imagen' : 'video'} aquí o
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                >
                  Seleccionar {postType === 'image' ? 'imagen' : 'video'}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  {postType === 'image'
                    ? 'PNG, JPG, GIF, WebP hasta 5MB'
                    : 'MP4, AVI, MOV, WebM hasta 100MB'
                  }
                </p>
              </div>
            ) : (
              <div className="relative">
                {postType === 'image' ? (
                  <img src={preview} alt="preview" className="w-full h-64 object-cover rounded-lg" />
                ) : (
                  <video
                    src={preview}
                    controls
                    className="w-full h-64 object-cover rounded-lg"
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
              className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-gray-900"
              rows={3}
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {text.length}/5000 caracteres
            </div>
          </div>

          {/* Caption adicional */}
          <div className="mb-4">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Añade una descripción adicional (opcional)"
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-gray-900"
              rows={2}
              maxLength={2200}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
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
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
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
    </div>
  );
}
