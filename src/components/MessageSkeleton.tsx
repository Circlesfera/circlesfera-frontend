import React from 'react';

export default function MessageSkeleton({ align = 'left' }: { align?: 'left' | 'right' }) {
  return (
    <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'} animate-pulse`}>
      <div className="px-3 py-2 rounded-lg max-w-xs bg-gray-200 dark:bg-gray-600 dark:bg-gray-700 w-32 h-6" />
    </div>
  );
}
