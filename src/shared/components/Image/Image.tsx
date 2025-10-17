/**
 * Image Component - Frontend
 * Componente unificado para manejo de imágenes con lazy loading, optimización y error handling
 * Reemplaza LazyImage, OptimizedImage y SimpleImage
 */

import React, { useState, useRef, useEffect, forwardRef } from 'react'
import NextImage from 'next/image'
import { cn } from '@/shared/utils/cn'

interface ImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  lazy?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  quality?: number
  sizes?: string
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
  showSkeleton?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
  // Props adicionales para compatibilidad
  onClick?: () => void
  style?: React.CSSProperties
  loading?: 'lazy' | 'eager'
}

interface ImageState {
  isLoaded: boolean
  isInView: boolean
  hasError: boolean
  currentSrc: string
}

export const Image = forwardRef<HTMLDivElement, ImageProps>(({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  lazy = true,
  placeholder = 'empty',
  blurDataURL,
  quality = 75,
  sizes,
  onLoad,
  onError,
  fallbackSrc = '/default-avatar.png',
  showSkeleton = true,
  objectFit = 'cover',
  objectPosition = 'center',
  onClick,
  style,
  loading,
  ...props
}, ref) => {
  const [state, setState] = useState<ImageState>({
    isLoaded: false,
    isInView: !lazy,
    hasError: false,
    currentSrc: src
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!lazy || !containerRef.current || state.isInView) {
      return
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setState(prev => ({ ...prev, isInView: true }))
            observerRef.current?.disconnect()
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    observerRef.current.observe(containerRef.current)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [lazy, state.isInView])

  // Manejar errores de carga
  const handleError = () => {
    setState(prev => ({
      ...prev,
      hasError: true,
      currentSrc: fallbackSrc
    }))
    onError?.()
  }

  // Manejar carga exitosa
  const handleLoad = () => {
    setState(prev => ({ ...prev, isLoaded: true }))
    onLoad?.()
  }

  // Resetear estado cuando cambia la fuente
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isLoaded: false,
      hasError: false,
      currentSrc: src
    }))
  }, [src])

  // Renderizar skeleton mientras carga
  if (showSkeleton && !state.isLoaded && state.isInView) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'bg-gray-200 dark:bg-gray-700 animate-pulse',
          fill ? 'w-full h-full' : '',
          className
        )}
        style={{
          width: fill ? undefined : width,
          height: fill ? undefined : height,
          ...style
        }}
        {...props}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar placeholder si no está en vista (lazy loading)
  if (lazy && !state.isInView) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'bg-gray-100 dark:bg-gray-800 flex items-center justify-center',
          fill ? 'w-full h-full' : '',
          className
        )}
        style={{
          width: fill ? undefined : width,
          height: fill ? undefined : height,
          ...style
        }}
        {...props}
      >
        <div className="w-6 h-6 text-gray-400 animate-pulse">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    )
  }

  // Renderizar imagen con Next.js Image
  return (
    <div
      ref={ref || containerRef}
      className={cn(
        'relative overflow-hidden',
        fill ? 'w-full h-full' : '',
        className
      )}
      style={style}
      onClick={onClick}
      {...props}
    >
      <NextImage
        src={state.currentSrc}
        alt={alt}
        {...(fill ? {} : { width: width!, height: height! })}
        fill={fill}
        priority={priority || loading === 'eager'}
        placeholder={placeholder}
        {...(blurDataURL ? { blurDataURL } : {})}
        quality={quality}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          state.isLoaded ? 'opacity-100' : 'opacity-0',
          objectFit !== 'cover' && `object-${objectFit}`,
          objectPosition !== 'center' && `object-${objectPosition.replace(' ', '-')}`
        )}
        style={{
          objectFit: objectFit === 'cover' ? undefined : objectFit,
          objectPosition: objectPosition === 'center' ? undefined : objectPosition
        }}
      />
    </div>
  )
})

Image.displayName = 'Image'

// Componentes especializados para casos específicos
export const Avatar = forwardRef<HTMLDivElement, Omit<ImageProps, 'fallbackSrc' | 'objectFit'>>(({
  width = 40,
  height = 40,
  className,
  alt = "Avatar",
  ...props
}, ref) => (
  <Image
    ref={ref}
    width={width}
    height={height}
    alt={alt}
    fallbackSrc="/default-avatar.png"
    objectFit="cover"
    className={cn('rounded-full', className)}
    {...props}
  />
))

Avatar.displayName = 'Avatar'

export const PostImage = forwardRef<HTMLDivElement, Omit<ImageProps, 'objectFit'>>(({
  className,
  alt = "Post image",
  ...props
}, ref) => (
  <Image
    ref={ref}
    alt={alt}
    objectFit="cover"
    className={cn('w-full h-auto', className)}
    {...props}
  />
))

PostImage.displayName = 'PostImage'

export const StoryImage = forwardRef<HTMLDivElement, Omit<ImageProps, 'objectFit' | 'fill'>>(({
  width = 80,
  height = 80,
  className,
  alt = "Story image",
  ...props
}, ref) => (
  <Image
    ref={ref}
    width={width}
    height={height}
    alt={alt}
    objectFit="cover"
    className={cn('rounded-full border-2 border-white shadow-lg', className)}
    {...props}
  />
))

StoryImage.displayName = 'StoryImage'

export default Image
