"use client";

import React, { useEffect, useState } from 'react';
import { getComments, addComment, Comment } from '@/services/postService';
import { useAuth } from '@/features/auth/useAuth';

export default function CommentsSection({ postId }: { postId: string }) {
  const { token, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = () => {
    setLoading(true);
    getComments(postId).then(data => {
      setComments(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!text.trim()) return;
    setSending(true);
    try {
      await addComment(postId, text, token!);
      setText('');
      fetchComments();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al comentar');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-2">
      <div className="mb-2 text-sm font-semibold">Comentarios</div>
      {loading ? (
        <div className="text-gray-400 text-sm">Cargando comentarios...</div>
      ) : comments.length === 0 ? (
        <div className="text-gray-400 text-sm">Sé el primero en comentar.</div>
      ) : (
        <ul className="mb-2 max-h-32 overflow-y-auto">
          {comments.map(c => (
            <li key={c._id} className="mb-1 flex items-center gap-2">
              {c.user.avatar ? (
                <img src={c.user.avatar} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">
                  {c.user.username[0].toUpperCase()}
                </span>
              )}
              <span className="font-semibold text-xs">{c.user.username}:</span>
              <span className="text-xs">{c.text}</span>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
        <input
          type="text"
          placeholder="Añade un comentario..."
          className="flex-1 px-2 py-1 border rounded text-sm"
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={sending}
          maxLength={500}
        />
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-700 transition" disabled={sending || !text.trim()}>
          {sending ? '...' : 'Comentar'}
        </button>
      </form>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
}
