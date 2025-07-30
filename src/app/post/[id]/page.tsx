import { getPostById } from '@/services/postService';
import PostCard from '@/components/PostCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { notFound } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default async function PostDetailPage({ params }: Props) {
  let post = null;
  try {
    post = await getPostById(params.id);
  } catch {
    return notFound();
  }

  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto mt-8">
        <PostCard post={post} />
      </div>
    </ProtectedRoute>
  );
}
