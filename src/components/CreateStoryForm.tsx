import React, { useRef, useState } from 'react';
import { createStory } from '@/services/storyService';
import { useAuth } from '@/features/auth/useAuth';

export default function CreateStoryForm({ onStoryCreated }: { onStoryCreated: () => void }) {
  const { token } = useAuth();
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
      await createStory(formData, token!);
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onStoryCreated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al subir la story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2 mb-4">
      {error && <div className="text-red-500 text-xs mb-1">{error}</div>}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={e => setImage(e.target.files?.[0] || null)}
        className="text-sm"
        required
      />
      <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-700 transition" disabled={loading}>
        {loading ? 'Subiendo...' : 'Subir Story'}
      </button>
    </form>
  );
}
