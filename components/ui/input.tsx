'use client';

import { forwardRef } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const inputVariants = cva(
  'input-base w-full transition-all duration-200 ease-out focus-ring',
  {
    variants: {
      variant: {
        default: '',
        error: 'input-error',
        success: 'input-success'
      },
      size: {
        sm: 'px-3 py-2 text-sm leading-relaxed',
        md: 'px-4 py-3 leading-relaxed',
        lg: 'px-5 py-4 text-lg leading-relaxed'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Componente Input estilizado con diseño profesional.
 * Soporta estados de error, éxito, iconos y texto de ayuda.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, variant, size, label, error, helperText, leftIcon, rightIcon, id, ...props },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = error || variant === 'error';
    const hasSuccess = variant === 'success' && !hasError;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-200 mb-2 transition-colors duration-200"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors duration-200 z-10">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={twMerge(
              inputVariants({
                variant: hasError ? 'error' : hasSuccess ? 'success' : variant || 'default',
                size: size || 'md'
              }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              'leading-relaxed',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors duration-200 z-10">
              {rightIcon}
            </div>
          )}
          {hasSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <svg 
                className="h-5 w-5 text-success-500 animate-in fade-in duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-danger-400 flex items-center gap-1.5 animate-in fade-in duration-200">
            <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-400 transition-colors duration-200">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

