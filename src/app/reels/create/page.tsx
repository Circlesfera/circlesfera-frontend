"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@/design-system';
import { useAuth } from '@/features/auth/useAuth';
import { createReel } from '@/services/reelService';
import ProtectedRoute from '@/components/ProtectedRoute';
// import CreateReelForm from '@/components/CreateReelForm';
import { ArrowLeft, Video, Upload } from 'lucide-react';
import logger from '@/utils/logger';
import { useToast } from '@/components/Toast';

export default function CreateReelPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState<'upload' | 'edit'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    caption: '',
    hashtags: '',
    location: '',
    allowComments: true,
    allowDuets: true,
    allowStitches: true
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar que sea un video
      if (!file.type.startsWith('video/')) {
        showToast('error', 'Por favor selecciona un archivo de video válido');
        return;
      }

      // Validar tamaño (máximo 100MB)
      if (file.size > 100 * 1024 * 1024) {
        showToast('error', 'El archivo es demasiado grande. Máximo 100MB');
        return;
      }

      setSelectedFile(file);

      // Crear preview del video
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
      setStep('edit');
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      showToast('error', 'Por favor selecciona un video');
      return;
    }

    try {
      setUploading(true);

      // Preparar FormData
      const submitFormData = new FormData();
      submitFormData.append('video', selectedFile);
      submitFormData.append('caption', formData.caption);
      submitFormData.append('hashtags', formData.hashtags);
      submitFormData.append('location', formData.location);
      submitFormData.append('allowComments', formData.allowComments.toString());
      submitFormData.append('allowDuets', formData.allowDuets.toString());
      submitFormData.append('allowStitches', formData.allowStitches.toString());

      // Crear reel
      const response = await createReel(submitFormData);

      if (response.success) {
        // Limpiar estado
        setSelectedFile(null);
        setVideoPreview(null);
        setFormData({
          caption: '',
          hashtags: '',
          location: '',
          allowComments: true,
          allowDuets: true,
          allowStitches: true
        });
        setStep('upload');

        // Redirigir al reel creado o al feed
        if (response.reel) {
          router.push(`/reels/${response.reel._id}`);
        } else {
          router.push('/reels');
        }
      } else {
        showToast('error', 'Error al crear el reel. Inténtalo de nuevo.');
      }
    } catch (error) {
      logger.error('Error creating reel:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        hasVideo: !!selectedFile,
        hasCaption: !!formData.caption
      });
      showToast('error', 'Error al crear el reel. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setVideoPreview(null);
    setStep('upload');
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
                  Crear Reel
                </h1>
              </div>

              {step === 'edit' && (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetUpload}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSubmit}
                    loading={uploading}
                    disabled={!selectedFile}
                  >
                    {uploading ? 'Subiendo...' : 'Publicar'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {step === 'upload' ? (
            /* Upload Step */
            <div className="max-w-2xl mx-auto">
              <Card className="p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Video className="w-12 h-12 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Sube tu video
                </h2>

                <p className="text-gray-600 mb-8">
                  Selecciona un video de tu dispositivo para crear un reel.
                  Los videos pueden tener hasta 100MB.
                </p>

                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <Button
                    variant="primary"
                    gradient
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<Upload className="w-5 h-5" />}
                    className="w-full"
                  >
                    Seleccionar Video
                  </Button>

                  <p className="text-sm text-gray-500">
                    Formatos soportados: MP4, WebM, MOV
                  </p>
                </div>
              </Card>

              {/* Tips */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Videos Cortos</h3>
                  <p className="text-sm text-gray-600">
                    Los reels funcionan mejor con videos de 15-60 segundos
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold">#</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Hashtags</h3>
                  <p className="text-sm text-gray-600">
                    Usa hashtags relevantes para llegar a más personas
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Calidad</h3>
                  <p className="text-sm text-gray-600">
                    Sube videos en alta calidad para mejor experiencia
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Step */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Video Preview */}
              <div>
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Vista previa</h3>
                  <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden">
                    {videoPreview && (
                      <video
                        className="w-full h-full object-cover"
                        src={videoPreview}
                        controls
                      />
                    )}
                  </div>
                </Card>
              </div>

              {/* Edit Form */}
              <div>
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-6">Detalles del reel</h3>

                  <div className="space-y-6">
                    {/* Caption */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      <Input
                        value={formData.caption}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('caption', e.target.value)}
                        placeholder="Describe tu reel..."
                        maxLength={2200}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {formData.caption.length}/2200 caracteres
                      </p>
                    </div>

                    {/* Hashtags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hashtags
                      </label>
                      <Input
                        value={formData.hashtags}
                        onChange={(e) => handleInputChange('hashtags', e.target.value)}
                        placeholder="#ejemplo #hashtag"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Separa los hashtags con espacios
                      </p>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubicación (opcional)
                      </label>
                      <Input
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="¿Dónde estás?"
                      />
                    </div>

                    {/* Privacy Settings */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Configuración de privacidad</h4>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.allowComments}
                            onChange={(e) => handleInputChange('allowComments', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Permitir comentarios
                          </span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.allowDuets}
                            onChange={(e) => handleInputChange('allowDuets', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Permitir duets
                          </span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.allowStitches}
                            onChange={(e) => handleInputChange('allowStitches', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Permitir stitches
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
