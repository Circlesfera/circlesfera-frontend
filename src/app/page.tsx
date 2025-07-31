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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Feed principal - 8 columnas en desktop */}
            <div className="lg:col-span-8">
              <div className="space-y-6">
                {/* Mensaje de bienvenida mejorado */}
                {!loading && posts.length === 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">¡Bienvenido a CircleSfera!</h2>
                          <p className="text-blue-100">Comienza tu viaje compartiendo momentos especiales</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Comparte tu primera foto</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Conecta con amigos, comparte tus momentos más especiales y descubre historias increíbles
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <button 
                            onClick={() => document.querySelector('[data-create-post]')?.scrollIntoView({ behavior: 'smooth' })}
                            className="btn-primary px-8 py-3 text-base font-semibold"
                          >
                            Crear mi primera publicación
                          </button>
                          <button className="btn-secondary px-8 py-3 text-base font-semibold">
                            Explorar contenido
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Stories con diseño mejorado */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <StoriesBar />
                </div>
                
                {/* Formulario de crear post con diseño mejorado */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden" data-create-post>
                  <CreatePostForm onPostCreated={handlePostCreated} />
                </div>
                
                {/* Posts con mejor espaciado */}
                {loading && (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <PostSkeleton />
                      </div>
                    ))}
                  </div>
                )}
                
                {posts.map((post, idx) => {
                  const isLast = idx === posts.length - 1;
                  return (
                    <div 
                      key={post._id} 
                      ref={isLast ? lastPostRef : undefined}
                      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                      <PostCard post={post} />
                    </div>
                  );
                })}
                
                {/* Loading mejorado */}
                {fetchingMore && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <div className="text-center">
                      <div className="inline-flex items-center space-x-3">
                        <div className="spinner"></div>
                        <span className="text-gray-600 font-medium">Cargando más publicaciones...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Mensaje de fin de feed mejorado */}
                {!hasMore && posts.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Has visto todo!</h3>
                      <p className="text-gray-600">Has llegado al final del feed. ¡Vuelve más tarde para ver nuevo contenido!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar derecha - 4 columnas en desktop */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                <UserSuggestions />
                
                {/* Información adicional */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Acerca de CircleSfera</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>Una plataforma para compartir momentos especiales y conectar con amigos.</p>
                    <div className="flex items-center space-x-2 text-blue-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Más información</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
