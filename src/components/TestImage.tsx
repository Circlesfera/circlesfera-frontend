"use client";

import React from 'react';
import { cn } from '@/utils/cn';

interface TestImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
}

export default function TestImage({ src, alt, className, fill = false }: TestImageProps) {
  return (
    <div className={cn('relative', fill ? 'w-full h-full' : '', className)}>
      <img
        src={src}
        alt={alt}
        className={cn(
          'object-cover transition-opacity duration-300',
          fill ? 'w-full h-full' : '',
          className
        )}
        style={fill ? { width: '100%', height: '100%' } : undefined}
        onLoad={() => console.log('✅ Image loaded successfully:', src)}
        onError={(e) => console.error('❌ Image failed to load:', src, e)}
      />
    </div>
  );
}
