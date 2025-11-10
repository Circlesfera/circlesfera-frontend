'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 ease-out focus-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
  {
    variants: {
      intent: {
        primary: 'bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/50 hover:scale-[1.02] hover:from-primary-500 hover:via-primary-400 hover:to-accent-400',
        secondary: 'bg-surface text-foreground border border-border shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:bg-surface-strong hover:border-border-strong hover:shadow-[0_16px_32px_rgba(15,23,42,0.12)] hover:scale-[1.02] backdrop-blur-sm',
        ghost: 'bg-transparent text-foreground hover:bg-surface-muted hover:backdrop-blur-sm hover:scale-[1.02]'
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3.5 text-base'
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
          <span className="flex items-center gap-2 opacity-75">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="transition-opacity duration-200">{children}</span>
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

