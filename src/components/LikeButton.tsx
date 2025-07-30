import React, { useState } from 'react';
import { toggleLike } from '@/services/postService';
import { useAuth } from '@/features/auth/useAuth';

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
        setTimeout(() => setAnimate(false), 350);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-1 text-lg transition-transform ${liked ? 'text-red-500' : 'text-gray-500'} ${animate ? 'scale-125' : 'scale-100'} hover:scale-110`}
      style={{ transition: 'transform 0.2s cubic-bezier(.4,2,.6,1)' }}
    >
      {liked ? '❤️' : '🤍'}
      <span className="text-base">{count}</span>
    </button>
  );
}
