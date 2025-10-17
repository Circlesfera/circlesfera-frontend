import React, { useState, useCallback, memo } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/design-system/Button'
import { Input } from '@/design-system/Input'
import { Textarea } from '@/design-system/Textarea'
import { Label } from '@/design-system/Label'
import { Progress } from '@/design-system/Progress'
import { Switch } from '@/design-system/Switch'
import { X, UploadCloud, Image, Video, Type, Palette } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/features/auth/AuthContext'
import { createStory } from '@/features/stories/services/storyService'
import { CreateStoryData } from '@/features/stories/types'
import logger from '@/utils/logger'

interface CreateStoryFormProps {
  onStoryCreated: () => void
  onClose: () => void
}

interface StoryFormData {
  type: 'image' | 'video'
  text: string
  backgroundColor: string
  fontColor: string
  duration: number
  media: File | null
}

const CreateStoryForm = memo(({ onClose, onStoryCreated }: CreateStoryFormProps) => {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [storyData, setStoryData] = useState<StoryFormData>({
    type: 'image',
    text: '',
    backgroundColor: '#000000',
    fontColor: '#ffffff',
    duration: 5,
    media: null
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')

      if (!isImage && !isVideo) {
        toast.error('Solo se permiten archivos de imagen y video')
        return
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB
        toast.error('El archivo es demasiado grande (máximo 50MB)')
        return
      }

      setStoryData(prev => ({
        ...prev,
        type: isImage ? 'image' : 'video',
        media: file
      }))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    maxFiles: 1
  })

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) {
      toast.error('Debes iniciar sesión para crear una story')
      return
    }

    if (!storyData.media) {
      toast.error('Debes subir una imagen o video')
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      const createData: CreateStoryData = {
        type: storyData.type,
        media: storyData.media,
        text: storyData.text || undefined,
        backgroundColor: storyData.backgroundColor,
        fontColor: storyData.fontColor,
        duration: storyData.duration
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      await createStory(createData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      toast.success('¡Story creada exitosamente!')
      logger.info('Story created successfully', { userId: user.id, type: storyData.type })

      onStoryCreated()
      onClose()
    } catch (error) {
      logger.error('Error creating story', error)
      toast.error('Error al crear la story')
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }, [storyData, user, onStoryCreated, onClose])

  const removeMedia = () => {
    setStoryData(prev => ({ ...prev, media: null }))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Crear Story
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Media Upload */}
        <div>
          <Label>Contenido de la Story</Label>
          {!storyData.media ? (
            <div
              {...getRootProps()}
              className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Arrastra una imagen o video aquí, o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                JPG, PNG, GIF, MP4, MOV (máximo 50MB)
              </p>
            </div>
          ) : (
            <div className="mt-2 relative">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {storyData.type === 'image' ? (
                  <Image className="w-8 h-8 text-blue-500" />
                ) : (
                  <Video className="w-8 h-8 text-red-500" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {storyData.media.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(storyData.media.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeMedia}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Text Overlay */}
        <div>
          <Label>Texto (opcional)</Label>
          <Textarea
            value={storyData.text}
            onChange={(e) => setStoryData(prev => ({ ...prev, text: e.target.value }))}
            placeholder="Agrega texto a tu story..."
            className="mt-2"
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            {storyData.text.length}/100 caracteres
          </p>
        </div>

        {/* Text Styling */}
        {storyData.text && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Color de fondo</Label>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="color"
                  value={storyData.backgroundColor}
                  onChange={(e) => setStoryData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                />
                <Input
                  value={storyData.backgroundColor}
                  onChange={(e) => setStoryData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label>Color del texto</Label>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="color"
                  value={storyData.fontColor}
                  onChange={(e) => setStoryData(prev => ({ ...prev, fontColor: e.target.value }))}
                  className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                />
                <Input
                  value={storyData.fontColor}
                  onChange={(e) => setStoryData(prev => ({ ...prev, fontColor: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Duration (for videos) */}
        {storyData.type === 'video' && (
          <div>
            <Label>Duración de visualización (segundos)</Label>
            <Input
              type="number"
              min="3"
              max="15"
              value={storyData.duration}
              onChange={(e) => setStoryData(prev => ({ ...prev, duration: parseInt(e.target.value) || 5 }))}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Entre 3 y 15 segundos
            </p>
          </div>
        )}

        {/* Upload Progress */}
        {isSubmitting && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Subiendo story...
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {uploadProgress}%
              </span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!storyData.media || isSubmitting}
          >
            {isSubmitting ? 'Creando...' : 'Crear Story'}
          </Button>
        </div>
      </form>
    </div>
  )
})

CreateStoryForm.displayName = 'CreateStoryForm'

export default CreateStoryForm
