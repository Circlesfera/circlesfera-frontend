import React, { useState } from 'react';
import { toggleLike } from '@/services/postService';
import { useAuth } from '@/features/auth/useAuth';

// Icono SVG simple para like
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg 
    className="w-6 h-6" 
    fill={filled ? "currentColor" : "none"} 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={filled ? 0 : 2} 
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
    />
  </svg>
);

export default function LikeButton({ postId, initialLiked, initialCount }: { postId: string; initialLiked: boolean; initialCount: number }) {
  const { token } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await toggleLike(postId, token!);
      setLiked(res.liked);
      setCount(res.likesCount);
      if (res.liked) {
        setAnimate(true);
        setTimeout(() => setAnimate(false), 300);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`p-2 rounded-lg transition-all duration-200 ${
        liked 
          ? 'text-red-500 hover:bg-red-50' 
          : 'text-gray-600 hover:bg-gray-100'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <HeartIcon filled={liked} />
    </button>
  );
}
