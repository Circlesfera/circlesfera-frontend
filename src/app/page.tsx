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
      <div className="flex flex-col md:flex-row md:items-start gap-8 max-w-6xl mx-auto mt-8 px-2">
        <div className="flex-1 max-w-xl w-full mx-auto">
          <StoriesBar />
          <h1 className="text-2xl font-bold mb-4">¡Bienvenido, {user?.username}!</h1>
          <CreatePostForm onPostCreated={handlePostCreated} />
          {loading && (
            <div className="text-center py-8">
              {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
            </div>
          )}
          {!loading && posts.length === 0 && (
            <div className="text-center py-8 text-gray-500">No hay publicaciones aún.</div>
          )}
          {posts.map((post, idx) => {
            const isLast = idx === posts.length - 1;
            return (
              <div key={post._id} ref={isLast ? lastPostRef : undefined}>
                <PostCard post={post} />
              </div>
            );
          })}
          {fetchingMore && (
            <div className="text-center py-4">
              <PostSkeleton />
            </div>
          )}
          {/* Sugerencias en móvil */}
          <div className="block md:hidden mt-8">
            <UserSuggestions />
          </div>
        </div>
        {/* Sugerencias en lateral derecho (desktop) */}
        <div className="hidden md:block w-80 flex-shrink-0">
          <UserSuggestions />
        </div>
      </div>
    </ProtectedRoute>
  );
}
