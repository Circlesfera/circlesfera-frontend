import React, { useState } from 'react';
import { toggleLike } from '@/services/postService';
import { useAuth } from '@/features/auth/useAuth';

export default function LikeButton({ postId, initialLiked, initialCount }: { postId: string; initialLiked: boolean; initialCount: number }) {
  const { token } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await toggleLike(postId, token!);
      setLiked(res.liked);
      setCount(res.likesCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleLike} disabled={loading} className={`flex items-center gap-1 text-lg ${liked ? 'text-red-500' : 'text-gray-500'} hover:scale-110 transition`}>
      {liked ? '❤️' : '🤍'}
      <span className="text-base">{count}</span>
    </button>
  );
}
