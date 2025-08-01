import React, { useRef, useState, useCallback } from 'react';
import { createImageStory, createVideoStory, createTextStory, Story } from '@/services/storyService';
import { useAuth } from '@/features/auth/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

// Iconos SVG
const CameraIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const VideoIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const TextIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface CreateStoryFormProps {
  onStoryCreated?: (story: Story) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

type StoryType = 'image' | 'video' | 'text';

export default function CreateStoryForm({ onStoryCreated, onClose, isOpen = false }: CreateStoryFormProps) {
  const { token } = useAuth();
  const [storyType, setStoryType] = useState<StoryType>('image');
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');

    // Crear preview para imagen/video
    if (storyType === 'image' || storyType === 'video') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [storyType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('No estás autenticado');
      return;
    }

    if (storyType === 'image' && !file) {
      setError('Selecciona una imagen');
      return;
    }

    if (storyType === 'video' && !file) {
      setError('Selecciona un video');
      return;
    }

    if (storyType === 'text' && !textContent.trim()) {
      setError('Escribe algún contenido');
      return;
    }

    setLoading(true);

    try {
      let storyResponse;

      switch (storyType) {
        case 'image':
          if (!file) throw new Error('No se seleccionó archivo');
          storyResponse = await createImageStory(file, token, caption, location);
          break;
        case 'video':
          if (!file) throw new Error('No se seleccionó archivo');
          storyResponse = await createVideoStory(file, token, caption, location);
          break;
        case 'text':
          storyResponse = await createTextStory(textContent, token, caption, location);
          break;
        default:
          throw new Error('Tipo de story no válido');
      }

      const story = storyResponse.story;

      // Limpiar formulario
      setFile(null);
      setTextContent('');
      setCaption('');
      setLocation('');
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      onStoryCreated?.(story);
      onClose?.();
    } catch (err: unknown) {
      console.error('Error creating story:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la story');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: StoryType) => {
    setStoryType(type);
    setFile(null);
    setTextContent('');
    setPreview(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    setFile(null);
    setTextContent('');
    setCaption('');
    setLocation('');
    setPreview(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Crear Story</h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6">
              {/* Selector de tipo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Story
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: 'image' as const, icon: CameraIcon, label: 'Imagen' },
                    { type: 'video' as const, icon: VideoIcon, label: 'Video' },
                    { type: 'text' as const, icon: TextIcon, label: 'Texto' }
                  ].map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeChange(type)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        storyType === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon />
                      <span className="block text-sm font-medium mt-2">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Área de contenido */}
                {storyType === 'text' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenido
                    </label>
                    <textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Escribe tu story..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={6}
                      maxLength={500}
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {textContent.length}/500
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {storyType === 'image' ? 'Imagen' : 'Video'}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                      {preview ? (
                        <div className="space-y-4">
                          {storyType === 'image' ? (
                            <img
                              src={preview}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg mx-auto"
                            />
                          ) : (
                            <video
                              src={preview}
                              controls
                              className="w-full h-48 object-cover rounded-lg mx-auto"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setFile(null);
                              setPreview(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="text-red-500 text-sm hover:text-red-700"
                          >
                            Cambiar archivo
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            {storyType === 'image' ? <CameraIcon /> : <VideoIcon />}
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">
                              {storyType === 'image' ? 'Sube una imagen' : 'Sube un video'}
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                              {storyType === 'image' 
                                ? 'JPG, PNG hasta 10MB' 
                                : 'MP4 hasta 50MB'
                              }
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Seleccionar archivo
                          </button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={storyType === 'image' ? 'image/*' : 'video/*'}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}

                {/* Caption */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Añade una descripción..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    maxLength={200}
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {caption.length}/200
                  </div>
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación (opcional)
                  </label>
                  <div className="relative">
                    <LocationIcon />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="¿Dónde estás?"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={100}
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Botones */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (!file && storyType !== 'text') || (storyType === 'text' && !textContent.trim())}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? 'Creando...' : 'Crear Story'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
