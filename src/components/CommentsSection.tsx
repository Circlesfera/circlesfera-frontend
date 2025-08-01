"use client";

import React, { useEffect, useState } from 'react';
import { getComments, createComment, Comment } from '@/services/postService';
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
    setError('');
    getComments(postId).then(data => {
      if (data && data.comments) {
        setComments(data.comments);
      } else {
        console.error('getComments no devolvió datos válidos:', data);
        setError('Error al cargar comentarios');
        setComments([]);
      }
      setLoading(false);
    }).catch(err => {
      console.error('Error al obtener comentarios:', err);
      setError('Error al cargar comentarios');
      setComments([]);
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
      await createComment(postId, text, token!, undefined);
      setText('');
      fetchComments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error?.response?.data?.message || 'Error al comentar';
      setError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* Mostrar algunos comentarios */}
      {!loading && comments.length > 0 && (
        <div className="mb-2">
          {comments.slice(0, 2).map(c => (
            <div key={c._id} className="mb-1">
              <span className="font-semibold text-gray-900 text-sm mr-2">
                {c.user.username}
              </span>
              <span className="text-gray-900 text-sm">{c.content}</span>
            </div>
          ))}
          {comments.length > 2 && (
            <button className="text-gray-400 text-xs hover:opacity-70 transition-opacity">
              Ver los {comments.length} comentarios
            </button>
          )}
        </div>
      )}

      {/* Formulario de comentario */}
      <form onSubmit={handleSubmit} className="flex items-center border-t border-gray-200 pt-3">
        <input
          type="text"
          placeholder="Añade un comentario..."
          className="flex-1 text-gray-900 text-sm bg-transparent border-none outline-none"
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={sending}
          maxLength={500}
        />
        <button 
          type="submit" 
          className={`text-blue-500 font-semibold text-sm hover:opacity-70 transition-opacity ${!text.trim() || sending ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={sending || !text.trim()}
        >
          {sending ? '...' : 'Publicar'}
        </button>
      </form>
      
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
}
