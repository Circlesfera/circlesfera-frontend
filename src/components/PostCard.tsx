import React from 'react';
import { Post } from '@/services/postService';
import LikeButton from './LikeButton';
import CommentsSection from './CommentsSection';
import { useAuth } from '@/features/auth/useAuth';

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const likedByUser = post.likes.includes(user?._id || '');

  return (
    <div className="bg-white rounded shadow mb-6">
      {/* Header usuario */}
      <div className="flex items-center gap-3 px-4 py-2">
        {post.user.avatar ? (
          <img src={post.user.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <span className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
            {post.user.username[0].toUpperCase()}
          </span>
        )}
        <span className="font-semibold">{post.user.username}</span>
        <span className="ml-auto text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</span>
      </div>
      {/* Imagen */}
      <div className="w-full bg-gray-100 aspect-square overflow-hidden">
        <img src={post.image} alt="post" className="w-full h-full object-cover" />
      </div>
      {/* Caption, likes y comentarios */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-4 mb-1">
          <LikeButton postId={post._id} initialLiked={likedByUser} initialCount={post.likes.length} />
        </div>
        <div className="font-semibold mb-1">{post.caption}</div>
        <CommentsSection postId={post._id} />
      </div>
    </div>
  );
}
