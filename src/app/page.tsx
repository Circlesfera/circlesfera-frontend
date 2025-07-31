"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/features/auth/useAuth';
import { useEffect, useState, useRef, useCallback } from 'react';
import { getFeed, Post } from '@/services/postService';
import PostCard from '@/components/PostCard';
import CreatePostForm from '@/components/CreatePostForm';
import StoriesBar from '@/components/StoriesBar';
import PostSkeleton from '@/components/PostSkeleton';
import UserSuggestions from '@/components/UserSuggestions';

export default function FeedPage() {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement | null>(null);

  const fetchFeed = useCallback(async (reset = false) => {
    if (!token) return;
    if (reset) {
      setLoading(true);
      setPage(1);
    }
    const res = await getFeed(token, reset ? 1 : page, 10);
    if (reset) {
      setPosts(res.posts);
    } else {
      setPosts(prev => [...prev, ...res.posts]);
    }
    setHasMore(page < res.pages);
    setLoading(false);
    setFetchingMore(false);
  }, [token, page]);

  useEffect(() => {
    fetchFeed(true);
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    if (!hasMore || loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setFetchingMore(true);
        setPage(prev => prev + 1);
      }
    });
    if (lastPostRef.current) observer.current.observe(lastPostRef.current);
  }, [hasMore, loading, posts]);

  useEffect(() => {
    if (page === 1) return;
    fetchFeed();
    // eslint-disable-next-line
  }, [page]);

  const handlePostCreated = () => {
    setPage(1);
    fetchFeed(true);
  };

  return (
    <ProtectedRoute>
      <div className="py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Feed principal */}
          <div className="flex-1 max-w-2xl mx-auto w-full">
            {/* Stories */}
            <StoriesBar />
            
            {/* Formulario de crear post */}
            <CreatePostForm onPostCreated={handlePostCreated} />
            
            {/* Posts */}
            {loading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <PostSkeleton key={i} />
                ))}
              </div>
            )}
            
            {!loading && posts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Bienvenido a CircleSfera!</h3>
                <p className="text-gray-500 mb-4">Comparte tu primera foto y conecta con amigos</p>
                <button 
                  onClick={() => document.querySelector('[data-create-post]')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-primary"
                >
                  Crear tu primera publicación
                </button>
              </div>
            )}
            
            {posts.map((post, idx) => {
              const isLast = idx === posts.length - 1;
              return (
                <div 
                  key={post._id} 
                  ref={isLast ? lastPostRef : undefined}
                >
                  <PostCard post={post} />
                </div>
              );
            })}
            
            {fetchingMore && (
              <div className="text-center py-8">
                <div className="inline-flex items-center space-x-2">
                  <div className="spinner"></div>
                  <span className="text-gray-500 text-sm">Cargando más publicaciones...</span>
                </div>
              </div>
            )}
            
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Has visto todas las publicaciones</p>
              </div>
            )}
          </div>

          {/* Sidebar derecha - Solo en desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0 sticky top-20">
            <UserSuggestions />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
