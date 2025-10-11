"use client";

import React, { useEffect, useState } from 'react';
import { getRecentPosts } from '@/services/exploreService';
import { Post } from '@/services/postService';
import PostCard from './PostCard';
import logger from '@/utils/logger';

export default function ExploreGrid() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getRecentPosts()
      .then(data => {

        setPosts(data);
        setLoading(false);
      })
      .catch(error => {
        logger.error('Error loading recent posts in ExploreGrid:', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Publicaciones recientes</h2>
        <p className="text-gray-600 text-sm mt-1">Descubre el contenido más reciente de la comunidad</p>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando publicaciones...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16h4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay publicaciones aún</h3>
            <p className="text-gray-600">Cuando los usuarios compartan contenido, aparecerá aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => <PostCard key={post._id} post={post} />)}
          </div>
        )}
      </div>
    </div>
  );
}
