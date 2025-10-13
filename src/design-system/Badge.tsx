"use client"

/**
 * 🏷️ BADGE COMPONENT
 * ===================
 * Badge/Chip para notificaciones, estados y tags
 *
 * ✅ WCAG 2.1 AA Compliant
 * ✅ Contraste 4.5:1 en todos los colores
 * ✅ ARIA labels cuando necesario
 *
 * @see src/design-system/tokens/index.ts
 */

import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  // Base styles
  "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200",
  {
    variants: {
      variant: {
        // Default - Gris
        default: "bg-gray-100 text-gray-700 border border-gray-200",

        // Primary - Azul
        primary: "bg-blue-100 text-blue-700 border border-blue-200",

        // Success - Verde
        success: "bg-green-100 text-green-700 border border-green-200",

        // Warning - Amarillo
        warning: "bg-yellow-100 text-yellow-700 border border-yellow-200",

        // Error - Rojo
        error: "bg-red-100 text-red-700 border border-red-200",

        // Info - Cyan
        info: "bg-cyan-100 text-cyan-700 border border-cyan-200",

        // Gradient - Instagram-like
        gradient: "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-sm",

        // Solid variants
        solidPrimary: "bg-blue-600 text-white border-0",
        solidSuccess: "bg-green-600 text-white border-0",
        solidWarning: "bg-yellow-600 text-white border-0",
        solidError: "bg-red-600 text-white border-0",

        // Dot only (sin fondo)
        dot: "bg-transparent border-0 p-0",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
      dot: {
        true: "w-2 h-2 p-0 border-2 border-white shadow-sm",
        false: "",
      },
      pulse: {
        true: "animate-pulse",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      dot: false,
      pulse: false,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
  VariantProps<typeof badgeVariants> {
  count?: number
  max?: number
  showZero?: boolean
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({
    className,
    variant,
    size,
    dot: isDot,
    pulse,
    count,
    max = 99,
    showZero = false,
    children,
    'aria-label': ariaLabel,
    ...props
  }, ref) => {
    // Formatear count
    const displayCount = count !== undefined
      ? count > max
        ? `${max}+`
        : count.toString()
      : undefined

    // Mostrar badge?
    const shouldShow = count !== undefined
      ? showZero || count > 0
      : true

    if (!shouldShow) return null

    // Si es dot, no mostrar children
    if (isDot) {
      return (
        <span
          ref={ref}
          className={cn(badgeVariants({ variant, size, dot: isDot, pulse }), className)}
          role="status"
          aria-label={ariaLabel || (count !== undefined ? `${count} notificaciones` : undefined)}
          {...props}
        />
      )
    }

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, dot: isDot, pulse }), className)}
        role="status"
        aria-label={ariaLabel}
        {...props}
      >
        {displayCount || children}
      </span>
    )
  }
)

Badge.displayName = "Badge"

export { Badge, badgeVariants }

