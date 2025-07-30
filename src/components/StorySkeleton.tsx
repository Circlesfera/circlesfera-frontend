import React from 'react';

export default function StorySkeleton() {
  return (
    <div className="flex flex-col items-center min-w-[70px] animate-pulse">
      <div className="w-14 h-14 rounded-full bg-gray-200 mb-1" />
      <div className="h-3 w-12 bg-gray-200 rounded" />
    </div>
  );
}
