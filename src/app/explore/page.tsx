"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import UserSearch from '@/components/UserSearch';
import ExploreGrid from '@/components/ExploreGrid';
import { useState } from 'react';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explorar</h1>
          <p className="text-gray-600">Descubre contenido increíble y conoce nuevas personas</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <UserSearch 
            query={searchQuery} 
            onResultClick={() => setSearchQuery('')} 
          />
        </div>
        
        <ExploreGrid />
      </div>
    </ProtectedRoute>
  );
}
