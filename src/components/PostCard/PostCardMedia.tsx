/**
 * 🖼️ POST CARD MEDIA
 * ==================
 * Componente para mostrar el contenido del post: imágenes, videos o texto
 * ✅ WCAG 2.1 AA Compliant
 * ✅ Navegación accesible por teclado
 * ✅ Touch targets 44x44px
 * ✅ ARIA labels completos
 */

'use client'

import React, { useState, useRef } from 'react'
import LazyImage from '@/components/LazyImage'
import ImageModal from '@/components/ImageModal'
import { PlayIcon, ChevronLeftIcon, ChevronRightIcon, ZoomIcon } from '@/components/icons/PostIcons'
import { formatDuration } from '@/utils/formatters'
import { ARIA_LABELS, getButtonA11yProps, TOUCH_TARGET_CLASSES } from '@/utils/accessibilityHelpers'
import type { Post } from '@/services/postService'

export interface PostCardMediaProps {
  post: Post
}

export function PostCardMedia({ post }: PostCardMediaProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Determinar aspect ratio
  const getAspectRatioClass = () => {
    const aspectRatio = post.content?.aspectRatio || '1:1'
    switch (aspectRatio) {
      case '1:1':
        return 'aspect-square'
      case '4:5':
        return 'aspect-[4/5]'
      default:
        return 'aspect-square'
    }
  }

  const aspectRatioClass = getAspectRatioClass()

  // Handlers
  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsVideoPlaying(!isVideoPlaying)
    }
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNextImage = () => {
    if (post.content.images) {
      setCurrentImageIndex((prev) => Math.min(post.content.images!.length - 1, prev + 1))
    }
  }

  // Keyboard navigation para imágenes
  const handleImageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      handlePrevImage()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      handleNextImage()
    }
  }

  // Renderizado según tipo de contenido
  switch (post.type) {
    case 'image':
      // Múltiples imágenes con navegación
      if (post.content.images && post.content.images.length > 1) {
        const totalImages = post.content.images.length
        const hasPrev = currentImageIndex > 0
        const hasNext = currentImageIndex < totalImages - 1

        return (
          <div
            className="relative overflow-hidden"
            role="region"
            aria-label={`Galería de imágenes, ${totalImages} imágenes`}
            onKeyDown={handleImageKeyDown}
          >
            <div className={`relative ${aspectRatioClass} bg-black`}>
              {/* Imagen actual */}
              <LazyImage
                src={post.content.images[currentImageIndex]?.url || ''}
                alt={post.content.images[currentImageIndex]?.alt || `Imagen ${currentImageIndex + 1} de ${totalImages}`}
                className="w-full h-full object-contain"
              />

              {/* Indicadores de posición */}
              <div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2"
                role="tablist"
                aria-label="Indicadores de imagen"
              >
                {post.content.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`${TOUCH_TARGET_CLASSES.small} p-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    role="tab"
                    aria-selected={index === currentImageIndex}
                    aria-label={`Ir a imagen ${index + 1} de ${totalImages}`}
                    tabIndex={index === currentImageIndex ? 0 : -1}
                  >
                    <span className="sr-only">
                      {index === currentImageIndex ? 'Imagen actual' : ''}
                    </span>
                  </button>
                ))}
              </div>

              {/* Botón anterior */}
              {hasPrev && (
                <button
                  onClick={handlePrevImage}
                  className={`${TOUCH_TARGET_CLASSES.min} absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black`}
                  {...getButtonA11yProps(ARIA_LABELS.media.prevImage)}
                >
                  <ChevronLeftIcon aria-hidden="true" />
                </button>
              )}

              {/* Botón siguiente */}
              {hasNext && (
                <button
                  onClick={handleNextImage}
                  className={`${TOUCH_TARGET_CLASSES.min} absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black`}
                  {...getButtonA11yProps(ARIA_LABELS.media.nextImage)}
                >
                  <ChevronRightIcon aria-hidden="true" />
                </button>
              )}

              {/* Contador (para screen readers) */}
              <div className="sr-only" role="status" aria-live="polite">
                Imagen {currentImageIndex + 1} de {totalImages}
              </div>
            </div>
          </div>
        )
      }

      // Imagen única con zoom
      return (
        <>
          <button
            onClick={() => setShowImageModal(true)}
            className={`relative overflow-hidden ${aspectRatioClass} bg-black w-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
            {...getButtonA11yProps(ARIA_LABELS.media.zoom)}
          >
            <LazyImage
              src={post.content.images?.[0]?.url || ''}
              alt={post.content.images?.[0]?.alt || 'Imagen del post'}
              className="w-full h-full object-contain transition-opacity group-hover:opacity-90"
            />

            {/* Indicador de zoom en hover/focus */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity bg-black/10">
              <div className="bg-white/90 rounded-full p-3 backdrop-blur-sm">
                <ZoomIcon aria-hidden="true" className="text-gray-900" />
              </div>
            </div>
          </button>

          {/* Modal de imagen ampliada */}
          {post.content.images && post.content.images.length > 0 && (
            <ImageModal
              isOpen={showImageModal}
              onClose={() => setShowImageModal(false)}
              imageUrl={post.content.images[0]?.url || ''}
              alt={post.content.images[0]?.alt || 'Imagen del post'}
            />
          )}
        </>
      )

    case 'video':
      return (
        <div
          className={`relative overflow-hidden ${aspectRatioClass} bg-black`}
          role="region"
          aria-label="Reproductor de video"
        >
          <video
            ref={videoRef}
            src={post.content.video?.url}
            poster={post.content.video?.thumbnail}
            className="w-full h-full object-contain"
            preload="metadata"
            onPlay={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
            aria-label="Video del post"
            controls={isVideoPlaying}
          />

          {/* Botón de play overlay (solo cuando está pausado) */}
          {!isVideoPlaying && (
            <button
              onClick={handleVideoPlay}
              className={`${TOUCH_TARGET_CLASSES.recommended} absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black`}
              {...getButtonA11yProps(ARIA_LABELS.media.video)}
            >
              <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                <PlayIcon aria-hidden="true" className="text-white" />
              </div>
            </button>
          )}

          {/* Duración del video */}
          {post.content.video?.duration && !isVideoPlaying && (
            <div
              className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm"
              aria-label={`Duración: ${formatDuration(post.content.video.duration)}`}
            >
              {formatDuration(post.content.video.duration)}
            </div>
          )}
        </div>
      )

    case 'text':
      return (
        <div
          className="px-6 py-8 bg-gradient-to-r from-blue-50 to-purple-50"
          role="article"
        >
          <p className="text-gray-900 text-base leading-relaxed whitespace-pre-wrap">
            {post.content.text}
          </p>
        </div>
      )

    default:
      return null
  }
}

