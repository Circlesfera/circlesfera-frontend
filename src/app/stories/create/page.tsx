"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@/design-system';
import { useAuth } from '@/features/auth/useAuth';
import { createStory } from '@/services/storyService';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowLeft, Camera, Image, Type, MapPin } from 'lucide-react';
import logger from '@/utils/logger';

export default function CreateStoryPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [storyType, setStoryType] = useState<'image' | 'video' | 'text'>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    caption: '',
    location: '',
    textContent: '',
    textStyle: 'default'
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storyTypes = [
    {
      type: 'image' as const,
      icon: Image,
      label: 'Imagen',
      description: 'Comparte una foto'
    },
    {
      type: 'video' as const,
      icon: Camera,
      label: 'Video',
      description: 'Comparte un video'
    },
    {
      type: 'text' as const,
      icon: Type,
      label: 'Texto',
      description: 'Escribe algo'
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo según el tipo de story
      if (storyType === 'image' && !file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }

      if (storyType === 'video' && !file.type.startsWith('video/')) {
        alert('Por favor selecciona un video válido');
        return;
      }

      // Validar tamaño (máximo 50MB para stories)
      if (file.size > 50 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 50MB para stories');
        return;
      }

      setSelectedFile(file);

      // Crear preview
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);

      // Preparar FormData
      const submitFormData = new FormData();

      if (storyType !== 'text' && selectedFile) {
        submitFormData.append(storyType, selectedFile);
      }

      submitFormData.append('type', storyType);
      submitFormData.append('caption', formData.caption);
      submitFormData.append('location', formData.location);

      if (storyType === 'text') {
        submitFormData.append('textContent', formData.textContent);
        submitFormData.append('textStyle', formData.textStyle);
      }

      // Crear la story usando el servicio
      const response = await createStory(submitFormData);

      if (!response.success) {
        throw new Error(response.message || 'Error al crear la story');
      }

      // Limpiar estado
      setSelectedFile(null);
      setPreview(null);
      setFormData({
        caption: '',
        location: '',
        textContent: '',
        textStyle: 'default'
      });

      // Redirigir a stories
      router.push('/stories');
    } catch (error) {
      logger.error('Error in story creation process:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        storyType,
        hasMedia: !!preview
      });

      alert('Error al crear la story. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setFormData({
      caption: '',
      location: '',
      textContent: '',
      textStyle: 'default'
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (uploading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="mr-4"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Volver
                </Button>
                <h1 className="text-xl font-semibold text-gray-900">
                  Crear Story
                </h1>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmit}
                  loading={uploading}
                  disabled={storyType !== 'text' && !selectedFile}
                >
                  {uploading ? 'Subiendo...' : 'Publicar'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Story Type Selection & Preview */}
            <div className="space-y-6">
              {/* Story Type Selection */}
              {!preview && storyType !== 'text' && (
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Tipo de story</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {storyTypes.map((type) => (
                      <button
                        key={type.type}
                        onClick={() => setStoryType(type.type)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          storyType === type.type
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <type.icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                        <p className="font-medium text-gray-900">{type.label}</p>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {/* File Upload or Text Input */}
              <Card className="p-6">
                {storyType === 'text' ? (
                  /* Text Story */
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Escribe tu story</h3>
                    <Input
                      value={formData.textContent}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('textContent', e.target.value)}
                      placeholder="¿Qué está pasando?"
                      className="w-full resize-none"
                    />
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estilo de texto
                      </label>
                      <select
                        value={formData.textStyle}
                        onChange={(e) => handleInputChange('textStyle', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="default">Por defecto</option>
                        <option value="bold">Negrita</option>
                        <option value="italic">Cursiva</option>
                        <option value="gradient">Gradiente</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  /* Image/Video Upload */
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      {storyType === 'image' ? 'Subir imagen' : 'Subir video'}
                    </h3>

                    {!preview ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={storyType === 'image' ? 'image/*' : 'video/*'}
                          onChange={handleFileSelect}
                          className="hidden"
                        />

                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          {storyType === 'image' ? (
                            <Image className="w-8 h-8 text-gray-400" />
                          ) : (
                            <Camera className="w-8 h-8 text-gray-400" />
                          )}
                        </div>

                        <p className="text-gray-600 mb-4">
                          {storyType === 'image'
                            ? 'Toca para seleccionar una imagen'
                            : 'Toca para seleccionar un video'
                          }
                        </p>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Seleccionar archivo
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        {storyType === 'image' ? (
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-lg"
                          />
                        ) : (
                          <video
                            src={preview}
                            className="w-full h-64 object-cover rounded-lg"
                            controls
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetForm}
                          className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                        >
                          Cambiar
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Right Side - Story Details */}
            <div>
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-6">Detalles de la story</h3>

                <div className="space-y-6">
                  {/* Caption */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción (opcional)
                    </label>
                    <Input
                      value={formData.caption}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('caption', e.target.value)}
                      placeholder="Añade una descripción..."
                      maxLength={500}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.caption.length}/500 caracteres
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ubicación (opcional)
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="¿Dónde estás?"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Story Preview */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Vista previa</h4>
                    <div className="aspect-[9/16] bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                      {storyType === 'text' && formData.textContent ? (
                        <p className="text-center p-4">{formData.textContent}</p>
                      ) : preview ? (
                        storyType === 'image' ? (
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <video
                            src={preview}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )
                      ) : (
                        <div className="text-center">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Camera className="w-6 h-6" />
                          </div>
                          <p className="text-sm">Tu story aparecerá aquí</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tip:</strong> Las stories desaparecen después de 24 horas.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
