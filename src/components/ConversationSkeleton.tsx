import React from 'react';

export default function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-2 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-gray-200" />
      <div className="h-4 w-24 bg-gray-200 rounded" />
    </div>
  );
}
