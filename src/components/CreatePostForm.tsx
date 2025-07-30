import React, { useRef, useState } from 'react';
import { createPost } from '@/services/postService';
import { useAuth } from '@/features/auth/useAuth';

export default function CreatePostForm({ onPostCreated }: { onPostCreated: () => void }) {
  const { token } = useAuth();
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!image) {
      setError('Selecciona una imagen');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', caption);
      await createPost(formData, token!);
      setCaption('');
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onPostCreated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al crear el post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100 flex flex-col gap-3">
      <h2 className="text-xl font-bold mb-2 text-[var(--accent)]">Crear nueva publicación</h2>
      {error && <div className="mb-2 text-red-500 text-sm font-medium">{error}</div>}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={e => setImage(e.target.files?.[0] || null)}
        className="mb-2 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--accent)] file:text-white hover:file:bg-violet-700 transition-all cursor-pointer"
        required
      />
      <textarea
        placeholder="Escribe un pie de foto..."
        className="w-full mb-2 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-base resize-none shadow-sm"
        value={caption}
        onChange={e => setCaption(e.target.value)}
        rows={2}
        maxLength={2200}
      />
      <button type="submit" className="bg-[var(--accent)] text-white px-6 py-2 rounded-full font-semibold hover:bg-violet-700 transition-all shadow-md disabled:opacity-60" disabled={loading}>
        {loading ? 'Publicando...' : 'Publicar'}
      </button>
    </form>
  );
}
