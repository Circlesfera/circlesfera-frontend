"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { getComments, createComment, Comment } from '@/services/postService';
import { useAuth } from '@/features/auth/useAuth';
import logger from '@/utils/logger';

export default function CommentsSection({ postId }: { postId: string }) {
  const { user, token, loading: authLoading } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = useCallback(() => {
    setLoading(true);
    setError('');

    // Validar que postId existe y no está vacío
    if (!postId || postId.trim() === '') {

      setError('ID de publicación inválido');
      setLoading(false);
      return;
    }

    // Solo cargar comentarios si el usuario está autenticado
    if (!user || !token || authLoading) {

      setLoading(false);
      return;
    }

    getComments(postId).then(data => {

      // Verificar si la respuesta es válida
      if (data && typeof data === 'object') {
        if (data.success && Array.isArray(data.data)) {
          setComments(data.data);
        } else if (Array.isArray(data)) {
          // Si devuelve directamente un array de comentarios
          setComments(data);
        } else {

          setError('Error al cargar comentarios');
          setComments([]);
        }
      } else {

        setError('Error al cargar comentarios');
        setComments([]);
      }
      setLoading(false);
    }).catch(err => {
      logger.error('Error loading comments in CommentsSection:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        postId
      });
      setError('Error al cargar comentarios');
      setComments([]);
      setLoading(false);
    });
  }, [postId, user, token, authLoading]);

  useEffect(() => {
    // Solo cargar comentarios cuando el usuario esté autenticado
    if (user && token && !authLoading) {
      fetchComments();
    }
  }, [user, token, authLoading, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!text.trim()) return;

    // Validar que postId existe y no está vacío
    if (!postId || postId.trim() === '') {
      setError('ID de publicación inválido');
      return;
    }

    // Solo permitir comentar si el usuario está autenticado
    if (!user || !token) {
      setError('Debes iniciar sesión para comentar');
      return;
    }

    setSending(true);
    try {
      await createComment(postId, text);
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
          {comments.slice(0, 1).map(c => (
            <div key={c._id} className="mb-1">
              <span className="font-semibold text-gray-900 text-base mr-2">
                {c.user.username}
              </span>
              <span className="text-gray-900 text-base">{c.content}</span>
            </div>
          ))}
          {comments.length > 1 && (
            <button className="text-gray-400 text-sm hover:opacity-70 transition-opacity">
              Ver los {comments.length} comentarios
            </button>
          )}
        </div>
      )}

      {/* Formulario de comentario */}
      <form onSubmit={handleSubmit} className="flex items-center border-t border-gray-200 pt-2">
        <input
          type="text"
          placeholder="Añade un comentario..."
          className="flex-1 text-gray-900 text-base bg-transparent border-none outline-none py-2"
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={sending}
          maxLength={500}
        />
        <button
          type="submit"
          className={`text-blue-500 font-semibold text-base hover:opacity-70 transition-opacity px-3 py-2 ${!text.trim() || sending ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={sending || !text.trim()}
        >
          {sending ? '...' : 'Publicar'}
        </button>
      </form>

      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
}
