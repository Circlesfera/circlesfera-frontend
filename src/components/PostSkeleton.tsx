import React from 'react';

export default function PostSkeleton() {
  return (
    <div className="bg-white rounded shadow mb-6 animate-pulse">
      {/* Header usuario */}
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="w-9 h-9 rounded-full bg-gray-200" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="ml-auto h-3 w-16 bg-gray-200 rounded" />
      </div>
      {/* Imagen */}
      <div className="w-full bg-gray-200 aspect-square" />
      {/* Caption y likes */}
      <div className="px-4 py-2">
        <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-16 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
