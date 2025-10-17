import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/design-system/Button'

interface ImageCropEditorProps {
  imageUrl: string
  onCrop: (croppedImageUrl: string) => void
  onCancel: () => void
  aspectRatio?: number
}

export const ImageCropEditor: React.FC<ImageCropEditorProps> = ({
  imageUrl,
  onCrop,
  onCancel,
  aspectRatio = 1
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleCrop = useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current

    if (!canvas || !image) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar canvas con las dimensiones del crop
    canvas.width = crop.width
    canvas.height = crop.height

    // Dibujar la porción recortada de la imagen
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    )

    // Convertir a blob y generar URL
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedUrl = URL.createObjectURL(blob)
        onCrop(croppedUrl)
      }
    }, 'image/jpeg', 0.9)
  }, [crop, onCrop])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Recortar Imagen</h3>

        <div className="relative mb-4">
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Imagen a recortar"
            className="max-w-full h-auto"
            style={{ aspectRatio }}
            onLoad={() => {
              // Inicializar crop con las dimensiones de la imagen
              if (imageRef.current) {
                const { naturalWidth, naturalHeight } = imageRef.current
                const size = Math.min(naturalWidth, naturalHeight)
                setCrop({
                  x: (naturalWidth - size) / 2,
                  y: (naturalHeight - size) / 2,
                  width: size,
                  height: size
                })
              }
            }}
          />
        </div>

        <canvas
          ref={canvasRef}
          className="hidden"
        />

        <div className="flex space-x-3">
          <Button
            onClick={handleCrop}
            variant="primary"
            className="flex-1"
          >
            Recortar
          </Button>
          <Button
            onClick={onCancel}
            variant="secondary"
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ImageCropEditor
