"use client";

import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  gradient?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    gradient = false,
    children,
    disabled,
    ...props
  }, ref) => {
    const baseClasses = `
      inline-flex items-center justify-center
      font-medium rounded-xl
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-4
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-95 hover:scale-105
    `;

    const variants = {
      primary: gradient
        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl focus:ring-blue-300'
        : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl focus:ring-blue-300',
      secondary: 'bg-white dark:bg-gray-900 dark:bg-gray-900 text-gray-700 dark:text-gray-300 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 dark:border-gray-700 hover:border-gray-300 dark:border-gray-600 dark:border-gray-600 hover:shadow-lg focus:ring-gray-200',
      ghost: 'text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 focus:ring-gray-200',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl focus:ring-red-300',
      success: 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl focus:ring-green-300',
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const widthClasses = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          widthClasses,
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && (
          <span className="mr-2 flex items-center">
            {leftIcon}
          </span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="ml-2 flex items-center">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
