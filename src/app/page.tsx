import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/features/auth/useAuth';
import { useEffect, useState } from 'react';
import { getPosts, Post } from '@/services/postService';
import PostCard from '@/components/PostCard';
import CreatePostForm from '@/components/CreatePostForm';
import StoriesBar from '@/components/StoriesBar';
import PostSkeleton from '@/components/PostSkeleton';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = () => {
    setLoading(true);
    getPosts().then(data => {
      setPosts(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto mt-8">
        <StoriesBar />
        <h1 className="text-2xl font-bold mb-4">¡Bienvenido, {user?.username}!</h1>
        <CreatePostForm onPostCreated={fetchPosts} />
        {loading ? (
          <div className="text-center py-8">
            {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No hay publicaciones aún.</div>
        ) : (
          posts.map(post => <PostCard key={post._id} post={post} />)
        )}
      </div>
    </ProtectedRoute>
  );
}
