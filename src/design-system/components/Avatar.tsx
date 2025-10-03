"use client";

import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fallback?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  ring?: boolean;
  ringColor?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  interactive?: boolean;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({
    className,
    src,
    alt = '',
    size = 'md',
    fallback,
    status,
    ring = false,
    ringColor = 'blue',
    interactive = false,
    ...props
  }, ref) => {
    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
      '2xl': 'w-20 h-20 text-2xl',
    };

    const ringColors = {
      blue: 'ring-blue-500',
      green: 'ring-green-500',
      yellow: 'ring-yellow-500',
      red: 'ring-red-500',
      purple: 'ring-purple-500',
      gray: 'ring-gray-500',
    };

    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
    };

    const baseClasses = `
      relative inline-flex items-center justify-center
      rounded-full overflow-hidden
      bg-gray-200 text-gray-600 font-medium
      select-none
    `;

    const ringClasses = ring
      ? `ring-2 ${ringColors[ringColor]}`
      : '';

    const interactiveClasses = interactive
      ? 'cursor-pointer hover:scale-105 transition-transform duration-200'
      : '';

    // Generar iniciales del fallback
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          sizes[size],
          ringClasses,
          interactiveClasses,
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallbackElement = target.nextElementSibling as HTMLElement;
              if (fallbackElement) {
                fallbackElement.style.display = 'flex';
              }
            }}
          />
        ) : null}
        
        <div
          className={cn(
            'w-full h-full flex items-center justify-center',
            src ? 'hidden' : 'flex'
          )}
        >
          {fallback ? getInitials(fallback) : '?'}
        </div>

        {status && (
          <div
            className={cn(
              'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
              statusColors[status]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Componente para grupo de avatares
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 3, size = 'md', children, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const visibleAvatars = childrenArray.slice(0, max);
    const remainingCount = childrenArray.length - max;

    return (
      <div
        ref={ref}
        className={cn('flex -space-x-2', className)}
        {...props}
      >
        {visibleAvatars.map((child, index) => (
          <div key={index} className="relative">
            {React.cloneElement(child as React.ReactElement, {
              size,
              className: cn(
                (child as React.ReactElement).props.className,
                'ring-2 ring-white'
              ),
            })}
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div
            className={cn(
              'relative inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium border-2 border-white',
              size === 'xs' && 'w-6 h-6 text-xs',
              size === 'sm' && 'w-8 h-8 text-sm',
              size === 'md' && 'w-10 h-10 text-base',
              size === 'lg' && 'w-12 h-12 text-lg',
              size === 'xl' && 'w-16 h-16 text-xl',
              size === '2xl' && 'w-20 h-20 text-2xl'
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export default Avatar;
