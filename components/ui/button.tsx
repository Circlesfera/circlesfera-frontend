'use client';

import { forwardRef } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      intent: {
        primary: 'bg-primary-500 text-white hover:bg-primary-400',
        secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700',
        ghost: 'bg-transparent text-slate-200 hover:bg-slate-800/70'
      },
      size: {
        sm: 'px-3 py-1 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
      }
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

/**
 * Botón estilizado reutilizable. Soporta variantes de intención y tamaño.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, ...props }, ref) => {
    return (
      <button ref={ref} className={twMerge(buttonVariants({ intent, size }), className)} {...props} />
    );
  }
);

Button.displayName = 'Button';

