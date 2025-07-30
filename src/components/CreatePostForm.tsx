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
    <form onSubmit={handleSubmit} className="bg-white rounded shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-3">Crear nueva publicación</h2>
      {error && <div className="mb-2 text-red-500 text-sm">{error}</div>}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={e => setImage(e.target.files?.[0] || null)}
        className="mb-3"
        required
      />
      <textarea
        placeholder="Escribe un pie de foto..."
        className="w-full mb-3 px-3 py-2 border rounded focus:outline-none"
        value={caption}
        onChange={e => setCaption(e.target.value)}
        rows={2}
        maxLength={2200}
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={loading}>
        {loading ? 'Publicando...' : 'Publicar'}
      </button>
    </form>
  );
}
