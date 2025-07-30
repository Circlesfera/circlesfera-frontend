import React, { useRef, useState } from 'react';
import { editProfile } from '@/services/userService';
import { useAuth } from '@/features/auth/useAuth';

export default function EditProfileForm({ initialBio, onProfileUpdated }: { initialBio: string; onProfileUpdated: () => void }) {
  const { token } = useAuth();
  const [bio, setBio] = useState(initialBio || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('bio', bio);
      if (avatar) formData.append('avatar', avatar);
      await editProfile(formData, token!);
      setAvatar(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onProfileUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded shadow p-4 mb-6 flex flex-col gap-3">
      <h2 className="text-lg font-bold mb-2">Editar perfil</h2>
      {error && <div className="text-red-500 text-xs mb-1">{error}</div>}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={e => setAvatar(e.target.files?.[0] || null)}
        className="text-sm"
      />
      <textarea
        placeholder="Tu biografía..."
        className="w-full px-3 py-2 border rounded focus:outline-none"
        value={bio}
        onChange={e => setBio(e.target.value)}
        rows={2}
        maxLength={160}
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  );
}
