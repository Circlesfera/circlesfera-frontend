"use client"

/**
 * 👤 AVATAR COMPONENT
 * ===================
 * Avatar reutilizable del design system
 *
 * ✅ WCAG 2.1 AA Compliant
 * ✅ Lazy loading automático
 * ✅ Gradiente fallback consistente
 * ✅ Status indicator opcional
 * ✅ ARIA labels automáticos
 *
 * @see src/design-system/tokens/index.ts
 */

import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import Image from 'next/image'

const avatarVariants = cva(
  // Base styles
  "relative inline-flex items-center justify-center rounded-full object-cover flex-shrink-0 overflow-hidden transition-all duration-200",
  {
    variants: {
      size: {
        xs: "w-6 h-6 text-xs",
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
        xl: "w-16 h-16 text-lg",
        '2xl': "w-20 h-20 text-xl",
        '3xl': "w-24 h-24 text-2xl",
      },
      variant: {
        default: "ring-2 ring-gray-200",
        primary: "ring-2 ring-blue-500",
        gradient: "ring-2 ring-transparent bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500",
        story: "ring-2 ring-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
        none: "ring-0",
      },
      interactive: {
        true: "cursor-pointer hover:ring-blue-300 hover:scale-105",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      interactive: false,
    },
  }
)

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'size'>,
  VariantProps<typeof avatarVariants> {
  src?: string | null
  alt?: string
  fallback?: string
  status?: 'online' | 'offline' | 'busy' | 'away'
  showStatus?: boolean
  loading?: 'lazy' | 'eager'
  priority?: boolean
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({
    className,
    src,
    alt,
    fallback,
    size,
    variant,
    interactive,
    status,
    showStatus = false,
    loading = 'lazy',
    priority = false,
    ...props
  }, ref) => {
    // Generar fallback de iniciales
    const getFallbackText = () => {
      if (fallback) return fallback.substring(0, 2).toUpperCase()
      if (alt) return alt.substring(0, 2).toUpperCase()
      return '?'
    }

    // Color del status indicator
    const getStatusColor = () => {
      switch (status) {
        case 'online': return 'bg-green-500'
        case 'offline': return 'bg-gray-400'
        case 'busy': return 'bg-red-500'
        case 'away': return 'bg-yellow-500'
        default: return 'bg-gray-400'
      }
    }

    // Tamaño del status indicator basado en tamaño del avatar
    const getStatusSize = () => {
      switch (size) {
        case 'xs': return 'w-1.5 h-1.5'
        case 'sm': return 'w-2 h-2'
        case 'md': return 'w-2.5 h-2.5'
        case 'lg': return 'w-3 h-3'
        case 'xl': return 'w-3.5 h-3.5'
        case '2xl': return 'w-4 h-4'
        case '3xl': return 'w-5 h-5'
        default: return 'w-2.5 h-2.5'
      }
    }

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, variant, interactive }), className)}
        role="img"
        aria-label={alt || 'Avatar de usuario'}
        {...props}
      >
        {src ? (
          // Imagen de avatar
          <Image
            src={src}
            alt={alt || 'Avatar'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 200px"
            loading={loading}
            priority={priority}
          />
        ) : (
          // Fallback con gradiente
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">
            {getFallbackText()}
          </div>
        )}

        {/* Status indicator */}
        {showStatus && status && (
          <span
            className={cn(
              "absolute bottom-0 right-0 rounded-full border-2 border-white",
              getStatusColor(),
              getStatusSize()
            )}
            role="status"
            aria-label={`Estado: ${status}`}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = "Avatar"

export { Avatar, avatarVariants }

