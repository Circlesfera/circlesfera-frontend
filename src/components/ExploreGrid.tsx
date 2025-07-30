"use client";

import React, { useEffect, useState } from 'react';
import { getRecentPosts } from '@/services/exploreService';
import { Post } from '@/services/postService';
import PostCard from './PostCard';

export default function ExploreGrid() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentPosts().then(data => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-8">
      <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">Explorar publicaciones</h2>
      {loading ? (
        <div className="text-gray-400 text-sm">Cargando publicaciones...</div>
      ) : posts.length === 0 ? (
        <div className="text-gray-400 text-sm">No hay publicaciones para mostrar.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map(post => <PostCard key={post._id} post={post} />)}
        </div>
      )}
    </div>
  );
}
