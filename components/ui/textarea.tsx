'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const textareaVariants = cva(
  'input-base w-full resize-none transition-all duration-300 focus-ring',
  {
    variants: {
      variant: {
        default: '',
        error: 'input-error',
        success: 'input-success'
      },
      size: {
        sm: 'px-3 py-2 text-sm min-h-[80px]',
        md: 'px-4 py-3 min-h-[100px]',
        lg: 'px-5 py-4 text-lg min-h-[120px]'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
}

/**
 * Componente Textarea estilizado con diseño profesional.
 * Soporta estados de error, éxito, contador de caracteres y texto de ayuda.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, variant, size, label, error, helperText, maxLength, showCount, id, ...props },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = error || variant === 'error';
    const hasSuccess = variant === 'success' && !hasError;
    const currentLength = (props.value?.toString() || props.defaultValue?.toString() || '').length;
    const remaining = maxLength ? maxLength - currentLength : null;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-foreground mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            maxLength={maxLength}
            className={twMerge(
              textareaVariants({
                variant: hasError ? 'error' : hasSuccess ? 'success' : variant,
                size
              }),
              className
            )}
            {...props}
          />
          {showCount && maxLength && (
            <div className="absolute bottom-3 right-3 text-xs text-foreground-muted pointer-events-none">
              <span className={remaining !== null && remaining < 20 ? 'text-warning-400' : ''}>
                {currentLength}
              </span>
              {maxLength && ` / ${maxLength}`}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-danger-400 flex items-center gap-1">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-foreground-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

