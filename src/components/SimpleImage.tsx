"use client";

import React, { useState } from 'react';
import { cn } from '@/utils/cn';

interface SimpleImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export default function SimpleImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  onLoad,
  onError,
}: SimpleImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    console.error('Error loading image:', src);
    onError?.();
  };

  if (hasError) {
    return (
      <div className={cn(
        'bg-gray-100 dark:bg-gray-700 flex items-center justify-center',
        fill ? 'w-full h-full' : '',
        className
      )}>
        <div className="text-center text-gray-400 dark:text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Error al cargar imagen</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', fill ? 'w-full h-full' : '', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={cn(
          'object-cover transition-opacity duration-300',
          fill ? 'w-full h-full' : '',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        style={fill ? { width: '100%', height: '100%' } : undefined}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}
