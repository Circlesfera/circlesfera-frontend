'use client';

import React, { forwardRef, type ReactElement } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 focus-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden',
  {
    variants: {
      intent: {
        primary:
          'bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white hover:from-primary-500 hover:via-accent-500 hover:to-primary-600 active:scale-[0.98] shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300',
        secondary:
          'glass-dark text-slate-100 hover:bg-black/30 hover:border-white/10 active:scale-[0.98] shadow-elegant hover:shadow-elegant-lg transition-all duration-300',
        ghost:
          'bg-transparent text-slate-200 hover:bg-white/5 hover:text-white active:scale-[0.98] backdrop-blur-sm transition-all duration-300',
        danger:
          'bg-gradient-to-r from-danger-600 to-danger-500 text-white hover:from-danger-500 hover:to-danger-400 active:scale-[0.98] shadow-lg shadow-danger-500/30 hover:shadow-xl hover:shadow-danger-500/40 transition-all duration-300',
        success:
          'bg-gradient-to-r from-success-600 to-success-500 text-white hover:from-success-500 hover:to-success-400 active:scale-[0.98] shadow-lg shadow-success-500/30 hover:shadow-xl hover:shadow-success-500/40 transition-all duration-300',
        outline:
          'bg-transparent text-primary-400 border-2 border-primary-500/50 hover:bg-primary-500/10 hover:border-primary-400 hover:text-primary-300 active:scale-[0.98] backdrop-blur-sm transition-all duration-300'
      },
      size: {
        sm: 'px-3 py-1.5 text-xs rounded-lg',
        md: 'px-4 py-2.5 text-sm rounded-xl',
        lg: 'px-6 py-3 text-base rounded-xl',
        xl: 'px-8 py-4 text-lg rounded-xl'
      },
      fullWidth: {
        true: 'w-full',
        false: ''
      },
      loading: {
        true: 'cursor-wait opacity-70',
        false: ''
      }
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
      fullWidth: false,
      loading: false
    }
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
  disabled?: boolean;
}

/**
 * Botón estilizado reutilizable con diseño profesional nivel Meta.
 * Soporta múltiples variantes, tamaños, estados de carga y iconos.
 *
 * @example
 * ```tsx
 * <Button intent="primary" size="lg">Click me</Button>
 * <Button intent="secondary" loading leftIcon={<Icon />}>Loading</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, fullWidth, loading, leftIcon, rightIcon, children, disabled, asChild, ...props }, ref) => {
    const buttonClasses = twMerge(buttonVariants({ intent, size, fullWidth, loading }), className);
    const content = (
      <>
        {loading && (
          <svg
            className="animate-spin-slow h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children && <span>{children}</span>}
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </>
    );

    if (asChild && React.isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        className: twMerge(buttonClasses, child.props?.className),
        ...(disabled || loading ? { 'aria-disabled': true } : {}),
        ...props
      } as Partial<{ className?: string; 'aria-disabled'?: boolean }>);
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
