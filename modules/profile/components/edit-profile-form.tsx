'use client';

import Image from 'next/image';
import { useState, type ReactElement } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { updateProfile, type PublicProfile } from '@/services/api/users';
import { useSessionStore } from '@/store/session';
import { toast } from 'sonner';

interface EditProfileFormProps {
  readonly profile: PublicProfile;
}

export function EditProfileForm({ profile }: EditProfileFormProps): ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const updateUser = useSessionStore((state) => state.updateUser);

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? '');

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries({ queryKey: ['profile', profile.handle] });
      updateUser(updatedProfile);
      toast.success('Perfil actualizado correctamente');
      router.push(`/${profile.handle}`);
    },
    onError: () => {
      toast.error('No se pudo actualizar el perfil');
    }
  });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    updateMutation.mutate({
      displayName: displayName.trim() || profile.displayName,
      bio: bio.trim() || null,
      avatarUrl: avatarUrl.trim() || null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative size-24 shrink-0">
          <Image
            src={avatarUrl || `https://api.dicebear.com/7.x/thumbs/svg?seed=${profile.handle}`}
            alt={displayName}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="avatarUrl" className="block text-sm font-medium text-white mb-2">
            URL del avatar
          </label>
          <input
            id="avatarUrl"
            type="url"
            value={avatarUrl}
            onChange={(e) => {
              setAvatarUrl(e.target.value);
            }}
            placeholder="https://ejemplo.com/avatar.jpg"
            className="w-full rounded-lg border border-white/10 bg-slate-800/60 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/40"
          />
        </div>
      </div>

      {/* Display Name */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-white mb-2">
          Nombre completo
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
          }}
          maxLength={50}
          required
          className="w-full rounded-lg border border-white/10 bg-slate-800/60 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/40"
        />
        <p className="mt-1 text-xs text-white/50">{displayName.length}/50</p>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-white mb-2">
          Biografía
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => {
            setBio(e.target.value);
          }}
          maxLength={150}
          rows={4}
          placeholder="Escribe algo sobre ti..."
          className="w-full resize-none rounded-lg border border-white/10 bg-slate-800/60 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/40"
        />
        <p className="mt-1 text-xs text-white/50">{bio.length}/150</p>
      </div>

      {/* Handle (readonly) */}
      <div>
        <label htmlFor="handle" className="block text-sm font-medium text-white mb-2">
          Nombre de usuario
        </label>
        <input
          id="handle"
          type="text"
          value={`@${profile.handle}`}
          disabled
          className="w-full rounded-lg border border-white/10 bg-slate-800/30 px-4 py-2 text-sm text-white/50 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-white/50">El nombre de usuario no se puede cambiar</p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="flex-1 rounded-full bg-primary-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={() => {
            router.back();
          }}
          className="rounded-full border border-white/20 bg-transparent px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

