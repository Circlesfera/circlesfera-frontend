import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/shared/utils/cn';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  fill = false,
  sizes,
  quality = 75,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Cargar cuando esté a 50px de entrar en viewport
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Placeholder mientras carga
  const PlaceholderComponent = () => (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md',
        fill ? 'absolute inset-0' : '',
        className
      )}
      style={!fill ? { width, height } : undefined}
    >
      <div className="w-full h-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );

  // Error component
  const ErrorComponent = () => (
    <div
      className={cn(
        'bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-md',
        fill ? 'absolute inset-0' : '',
        className
      )}
      style={!fill ? { width, height } : undefined}
    >
      <div className="text-center p-4">
        <svg
          className="w-8 h-8 text-gray-400 mx-auto mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Error al cargar imagen
        </p>
      </div>
    </div>
  );

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        fill ? 'w-full h-full' : '',
        className
      )}
      style={!fill ? { width, height } : undefined}
    >
      {hasError ? (
        <ErrorComponent />
      ) : !isInView || !isLoaded ? (
        <PlaceholderComponent />
      ) : null}

      {isInView && !hasError && (
        <Image
          src={src}
          alt={alt}
          {...(fill ? {} : { width: width!, height: height! })}
          fill={fill}
          sizes={sizes}
          quality={quality}
          priority={priority}
          placeholder={placeholder}
          {...(blurDataURL ? { blurDataURL } : {})}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            fill ? 'object-cover' : ''
          )}
        />
      )}
    </div>
  );
};

export default LazyImage;
