'use client'

import React, { useState, useCallback, memo } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '@/features/auth/AuthContext'
import { uploadFile } from '@/services/axios'
import { Button } from '@/design-system/Button'
import { Textarea } from '@/design-system/Textarea'
import { Input } from '@/design-system/Input'
import { Label } from '@/design-system/Label'
import { Card } from '@/design-system/Card'
import { Progress } from '@/design-system/Progress'
import { Badge } from '@/design-system/Badge'
import { X, Upload, Video, Music, MapPin, Hash, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface CreateReelFormProps {
  onClose: () => void
  onReelCreated?: () => void
}

interface ReelData {
  caption: string
  hashtags: string[]
  location?: {
    name: string
    coordinates: [number, number]
  }
  audioTitle?: string
  video: File | null
}

const CreateReelForm = memo(({ onClose, onReelCreated }: CreateReelFormProps) => {
  // const { user } = useAuth() // TODO: Usar para validaciones de usuario
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [reelData, setReelData] = useState<ReelData>({
    caption: '',
    hashtags: [],
    audioTitle: '',
    video: null
  })

  // Dropzone para video
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('video/')) {
        toast.error('Por favor selecciona un archivo de video válido')
        return
      }

      // Validar tamaño (máximo 100MB)
      const maxSize = 100 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error('El video no puede ser mayor a 100MB')
        return
      }

      setReelData(prev => ({ ...prev, video: file }))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    multiple: false
  })

  // Extraer hashtags del caption
  const extractHashtags = useCallback((text: string): string[] => {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g
    return text.match(hashtagRegex) || []
  }, [])

  // Manejar cambio de caption
  const handleCaptionChange = useCallback((value: string) => {
    const hashtags = extractHashtags(value)
    setReelData(prev => ({
      ...prev,
      caption: value,
      hashtags
    }))
  }, [extractHashtags])

  // Remover hashtag
  const removeHashtag = useCallback((hashtag: string) => {
    setReelData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(h => h !== hashtag),
      caption: prev.caption.replace(hashtag, '').replace(/\s+/g, ' ').trim()
    }))
  }, [])

  // Remover video
  const removeVideo = useCallback(() => {
    setReelData(prev => ({ ...prev, video: null }))
  }, [])

  // Obtener ubicación actual
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('La geolocalización no está disponible en tu navegador')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Aquí podrías usar una API de geocodificación inversa
          // Por ahora, solo guardamos las coordenadas
          setReelData(prev => ({
            ...prev,
            location: {
              name: 'Ubicación actual',
              coordinates: [position.coords.longitude, position.coords.latitude]
            }
          }))
          toast.success('Ubicación agregada')
        } catch (error) {
          console.error('Error getting location:', error)
          toast.error('Error al obtener la ubicación')
        }
      },
      (error) => {
        toast.error('No se pudo obtener la ubicación')
      }
    )
  }, [])

  // Enviar reel
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!reelData.video) {
      toast.error('Por favor selecciona un video')
      return
    }

    if (!reelData.caption.trim()) {
      toast.error('Por favor agrega una descripción')
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      // Subir video
      const videoResponse = await uploadFile(
        '/reels/upload',
        reelData.video,
        (progress) => setUploadProgress(progress)
      )

      // Crear reel
      const reelPayload = {
        caption: reelData.caption,
        videoUrl: videoResponse.data.data.url,
        hashtags: reelData.hashtags,
        location: reelData.location,
        audioTitle: reelData.audioTitle || undefined
      }

      const response = await fetch('/api/reels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('circlesfera_token')}`
        },
        body: JSON.stringify(reelPayload)
      })

      if (!response.ok) {
        throw new Error('Error al crear el reel')
      }

      toast.success('¡Reel creado exitosamente!')
      onReelCreated?.()
      onClose()
    } catch (error: any) {
      console.error('Error creating reel:', error)
      toast.error(error.message || 'Error al crear el reel')
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }, [reelData, onClose, onReelCreated])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Crear Reel</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video Upload */}
            <div>
              <Label htmlFor="video">Video</Label>
              {reelData.video ? (
                <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Video className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium">{reelData.video.name}</p>
                        <p className="text-sm text-gray-500">
                          {(reelData.video.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeVideo}
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {isSubmitting && uploadProgress > 0 && (
                    <div className="mt-3">
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-sm text-gray-600 mt-1">
                        Subiendo... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`mt-2 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium mb-2">
                    {isDragActive ? 'Suelta el video aquí' : 'Arrastra tu video aquí'}
                  </p>
                  <p className="text-gray-500">
                    o haz clic para seleccionar un archivo
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    MP4, MOV, AVI, WebM hasta 100MB
                  </p>
                </div>
              )}
            </div>

            {/* Caption */}
            <div>
              <Label htmlFor="caption">Descripción</Label>
              <Textarea
                id="caption"
                value={reelData.caption}
                onChange={(e) => handleCaptionChange(e.target.value)}
                placeholder="Describe tu reel... #hashtag"
                className="mt-2"
                rows={4}
                maxLength={2200}
                disabled={isSubmitting}
              />
              <p className="text-sm text-gray-500 mt-1">
                {reelData.caption.length}/2200 caracteres
              </p>
            </div>

            {/* Hashtags */}
            {reelData.hashtags.length > 0 && (
              <div>
                <Label>Hashtags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {reelData.hashtags.map((hashtag) => (
                    <Badge
                      key={hashtag}
                      variant="default"
                      className="flex items-center space-x-1"
                    >
                      <Hash className="w-3 h-3" />
                      <span>{hashtag}</span>
                      <button
                        type="button"
                        onClick={() => removeHashtag(hashtag)}
                        className="ml-1 hover:text-red-500"
                        disabled={isSubmitting}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Audio Title */}
            <div>
              <Label htmlFor="audioTitle">Título del Audio (opcional)</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Music className="w-4 h-4 text-gray-400" />
                <Input
                  id="audioTitle"
                  value={reelData.audioTitle}
                  onChange={(e) => setReelData(prev => ({ ...prev, audioTitle: e.target.value }))}
                  placeholder="Título del audio usado"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <Label>Ubicación (opcional)</Label>
              <div className="flex items-center space-x-2 mt-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <Input
                  value={reelData.location?.name || ''}
                  placeholder="Agregar ubicación"
                  disabled
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={isSubmitting}
                >
                  Usar ubicación actual
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !reelData.video || !reelData.caption.trim()}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Reel'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
})

CreateReelForm.displayName = 'CreateReelForm'

export default CreateReelForm
