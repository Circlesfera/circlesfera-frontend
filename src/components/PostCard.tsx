import React, { useState } from 'react';
import { Post } from '@/services/postService';
import LikeButton from './LikeButton';
import CommentsSection from './CommentsSection';
import { useAuth } from '@/features/auth/useAuth';
import Link from 'next/link';

// Iconos SVG simples
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg className="w-6 h-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={filled ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CommentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <svg className="w-6 h-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={filled ? 0 : 2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const MoreIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const likedByUser = post.likes.includes(user?._id || '');
  const [isSaved, setIsSaved] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'ahora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    return postDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="card mb-4">
      {/* Header del usuario */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <Link href={`/${post.user.username}`}>
            {post.user.avatar ? (
              <img 
                src={post.user.avatar} 
                alt="avatar" 
                className="w-8 h-8 rounded-full object-cover" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-white text-xs">
                {post.user.username[0].toUpperCase()}
              </div>
            )}
          </Link>
          <div className="flex flex-col">
            <Link href={`/${post.user.username}`} className="font-semibold text-gray-900 text-sm hover:text-gray-700">
              {post.user.username}
            </Link>
            <span className="text-gray-500 text-xs">
              {formatTimeAgo(post.createdAt)}
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => setShowMore(!showMore)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreIcon />
        </button>
      </div>

      {/* Imagen */}
      <Link href={`/post/${post._id}`} prefetch={false}>
        <img 
          src={post.image} 
          alt="post" 
          className="w-full h-auto object-cover" 
        />
      </Link>

      {/* Acciones */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <LikeButton postId={post._id} initialLiked={likedByUser} initialCount={post.likes.length} />
            
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <CommentIcon />
            </button>
            
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ShareIcon />
            </button>
          </div>
          
          <button 
            onClick={() => setIsSaved(!isSaved)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <BookmarkIcon filled={isSaved} />
          </button>
        </div>

        {/* Likes */}
        {post.likes.length > 0 && (
          <div className="font-semibold text-gray-900 text-sm mb-2">
            {post.likes.length} me gusta
          </div>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="mb-2">
            <span className="font-semibold text-gray-900 text-sm mr-2">
              {post.user.username}
            </span>
            <span className="text-gray-900 text-sm">
              {post.caption.length > 100 ? (
                <>
                  {post.caption.substring(0, 100)}...
                  <button className="text-gray-500 hover:text-gray-700 ml-1 font-medium">
                    más
                  </button>
                </>
              ) : (
                post.caption
              )}
            </span>
          </div>
        )}

        {/* Comentarios */}
        <CommentsSection postId={post._id} />
      </div>
    </div>
  );
}
