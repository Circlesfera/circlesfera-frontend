'use client';

import { forwardRef } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const badgeVariants = cva('badge-base', {
  variants: {
    variant: {
      primary: 'badge-primary',
      success: 'badge-success',
      warning: 'badge-warning',
      danger: 'badge-danger',
      neutral: 'badge-neutral'
    },
    size: {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-xs px-2.5 py-1',
      lg: 'text-sm px-3 py-1.5'
    }
  },
  defaultVariants: {
    variant: 'neutral',
    size: 'md'
  }
} as const);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

/**
 * Componente Badge estilizado con diseño profesional.
 * Soporta múltiples variantes de color y tamaños.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={twMerge(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {dot && (
          <span
            className={twMerge(
              'mr-1.5 h-1.5 w-1.5 rounded-full',
              variant === 'primary' && 'bg-primary-400',
              variant === 'success' && 'bg-success-400',
              variant === 'warning' && 'bg-warning-400',
              variant === 'danger' && 'bg-danger-400',
              variant === 'neutral' && 'bg-slate-400'
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
