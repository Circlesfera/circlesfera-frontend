'use client';

import { type ReactElement } from 'react';

interface VerifiedBadgeProps {
  readonly className?: string;
  readonly size?: 'sm' | 'md' | 'lg';
}

export function VerifiedBadge({ className = '', size = 'md' }: VerifiedBadgeProps): ReactElement {
  const sizeClasses = {
    sm: 'size-3',
    md: 'size-4',
    lg: 'size-5'
  };

  return (
    <svg
      className={`${sizeClasses[size]} ${className} text-blue-500`}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-label="Verificado"
    >
      <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-10.5 7.77l-2.58-2.59-1.69 1.7L11.5 20l4.27-4.27-1.69-1.7-2.58 2.59z" />
    </svg>
  );
}

