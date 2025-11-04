'use client';

import { forwardRef, type ReactElement } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-60',
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
    VariantProps<typeof buttonVariants> {
  readonly loading?: boolean;
  readonly leftIcon?: ReactElement;
  readonly rightIcon?: ReactElement;
}

/**
 * Botón estilizado reutilizable. Soporta variantes de intención y tamaño.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, loading, leftIcon, rightIcon, children, ...props }, ref) => {
    // Filtrar props que no son válidos para elementos HTML nativos
    const htmlProps = { ...props };
    if (loading !== undefined) {
      // El prop loading se usa solo para mostrar estado visual, no como atributo HTML
      delete (htmlProps as { loading?: boolean }).loading;
    }
    if (leftIcon !== undefined) {
      delete (htmlProps as { leftIcon?: ReactElement }).leftIcon;
    }
    if (rightIcon !== undefined) {
      delete (htmlProps as { rightIcon?: ReactElement }).rightIcon;
    }

    return (
      <button
        ref={ref}
        className={twMerge(buttonVariants({ intent, size }), className)}
        disabled={loading || props.disabled}
        {...htmlProps}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </span>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

