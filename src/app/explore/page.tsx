"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import UserSearch from '@/components/UserSearch';
import ExploreGrid from '@/components/ExploreGrid';
import { useState } from 'react';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto mt-8">
        <UserSearch 
          query={searchQuery} 
          onResultClick={() => setSearchQuery('')} 
        />
        <ExploreGrid />
      </div>
    </ProtectedRoute>
  );
}
