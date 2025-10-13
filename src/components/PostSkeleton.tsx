import React from 'react';

interface PostSkeletonProps {
  aspectRatio?: '1:1' | '4:5';
}

export default function PostSkeleton({ aspectRatio = '1:1' }: PostSkeletonProps) {
  const aspectClass = aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-square';

  return (
    <div className="bg-white dark:bg-gray-900 rounded shadow mb-6 animate-pulse">
      {/* Header usuario */}
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600 dark:bg-gray-700" />
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 dark:bg-gray-700 rounded" />
        <div className="ml-auto h-3 w-16 bg-gray-200 dark:bg-gray-600 dark:bg-gray-700 rounded" />
      </div>
      {/* Imagen con aspect ratio dinámico */}
      <div className={`w-full bg-gray-200 dark:bg-gray-600 dark:bg-gray-700 ${aspectClass}`} />
      {/* Caption y likes */}
      <div className="px-4 py-2">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 dark:bg-gray-700 rounded mb-2" />
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-600 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}
