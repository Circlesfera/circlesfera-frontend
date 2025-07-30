import React from 'react';
import { Post } from '@/services/postService';
import LikeButton from './LikeButton';
import CommentsSection from './CommentsSection';
import { useAuth } from '@/features/auth/useAuth';
import Link from 'next/link';

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const likedByUser = post.likes.includes(user?._id || '');

  return (
    <div className="bg-white rounded-2xl shadow-md mb-8 transition-transform duration-200 hover:scale-[1.015] hover:shadow-xl border border-gray-100">
      {/* Header usuario */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
        {post.user.avatar ? (
          <img src={post.user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[var(--accent)] shadow-sm" />
        ) : (
          <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--accent)] to-blue-400 flex items-center justify-center font-bold text-white text-lg border-2 border-white shadow-sm">
            {post.user.username[0].toUpperCase()}
          </span>
        )}
        <span className="font-semibold text-gray-800 text-base">{post.user.username}</span>
        <span className="ml-auto text-xs text-gray-400 font-medium">{new Date(post.createdAt).toLocaleString()}</span>
      </div>
      {/* Imagen */}
      <Link href={`/post/${post._id}`} prefetch={false} className="block w-full bg-gray-100 aspect-square overflow-hidden cursor-pointer rounded-b-none rounded-t-none">
        <img src={post.image} alt="post" className="w-full h-full object-cover transition-transform duration-200 hover:scale-105" />
      </Link>
      {/* Caption, likes y comentarios */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-4 mb-2">
          <LikeButton postId={post._id} initialLiked={likedByUser} initialCount={post.likes.length} />
        </div>
        <div className="font-medium mb-2 text-gray-700 break-words">{post.caption}</div>
        <CommentsSection postId={post._id} />
      </div>
    </div>
  );
}
