import React, { useRef, useState } from 'react';
import { createPost } from '@/services/postService';
import { useAuth } from '@/features/auth/useAuth';

// Iconos SVG modernos
const ImageIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function CreatePostForm({ onPostCreated }: { onPostCreated: () => void }) {
  const { token, user } = useAuth();
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
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
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageChange(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!image) {
      setError('Selecciona una imagen');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', caption);
      await createPost(formData, token!);
      setCaption('');
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onPostCreated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al crear el post');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="card-modern mb-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt="avatar" 
              className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200" 
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
              {user?.username[0].toUpperCase()}
            </div>
          )}
          <span className="font-semibold text-gray-900 text-sm">Crear publicación</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        
        {/* Área de upload de imagen */}
        <div className="mb-4">
          {!imagePreview ? (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <ImageIcon />
              <p className="mt-2 text-gray-600 font-medium">Arrastra una imagen aquí o</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 btn-primary"
              >
                <UploadIcon />
                <span className="ml-2">Seleccionar imagen</span>
              </button>
              <p className="mt-2 text-gray-500 text-xs">PNG, JPG hasta 10MB</p>
            </div>
          ) : (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="preview" 
                className="w-full h-64 object-cover rounded-lg shadow-lg" 
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>
          )}
          
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={e => handleImageChange(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>
        
        {/* Textarea para caption */}
        <div className="mb-4">
          <textarea
            placeholder="¿Qué quieres compartir?"
            className="input-modern w-full resize-none"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            rows={4}
            maxLength={2200}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-500 text-xs">
              {caption.length}/2200 caracteres
            </span>
            {caption.length > 2000 && (
              <span className="text-orange-500 text-xs">
                Casi llegaste al límite
              </span>
            )}
          </div>
        </div>
        
        {/* Botón de publicación */}
        <button 
          type="submit" 
          className={`w-full btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading || !image}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="spinner mr-2"></div>
              Publicando...
            </div>
          ) : (
            'Compartir publicación'
          )}
        </button>
      </form>
    </div>
  );
}
