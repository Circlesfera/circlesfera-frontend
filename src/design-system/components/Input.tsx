"use client";

import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    variant = 'default',
    id,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseClasses = `
      w-full px-4 py-3 text-base
      border-2 rounded-xl
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-4
      placeholder:text-gray-400 dark:text-gray-500 dark:text-gray-400
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variants = {
      default: `
        bg-white dark:bg-gray-900 dark:bg-gray-900 border-gray-200 dark:border-gray-700 dark:border-gray-700 
        focus:border-blue-500 focus:ring-blue-100
        hover:border-gray-300 dark:border-gray-600 dark:border-gray-600
      `,
      filled: `
        bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 border-gray-200 dark:border-gray-700 dark:border-gray-700 
        focus:border-blue-500 focus:ring-blue-100 focus:bg-white dark:bg-gray-900 dark:bg-gray-900
        hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800
      `,
      outlined: `
        bg-transparent border-2 border-gray-300 dark:border-gray-600 dark:border-gray-600 
        focus:border-blue-500 focus:ring-blue-100
        hover:border-gray-400 dark:border-gray-500
      `,
    };

    const errorClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
      : '';

    const iconPadding = leftIcon ? 'pl-12' : '';
    const rightIconPadding = rightIcon ? 'pr-12' : '';

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 dark:text-gray-500 dark:text-gray-400">
                {leftIcon}
              </span>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              baseClasses,
              variants[variant],
              errorClasses,
              iconPadding,
              rightIconPadding,
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-gray-400 dark:text-gray-500 dark:text-gray-400">
                {rightIcon}
              </span>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
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
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
