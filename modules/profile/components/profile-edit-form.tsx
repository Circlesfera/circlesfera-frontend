'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, useRef, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import Image from 'next/image';

import { updateProfile } from '@/services/api/users';
import { uploadMedia } from '@/services/api/media';
import { logger } from '@/lib/logger';
import { useSessionStore } from '@/store/session';
import { toast } from 'sonner';
import { getAvatarUrl } from '@/lib/image-utils';

import type { PublicProfile } from '@/services/api/users';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Introduce al menos 2 caracteres').max(64, 'Nombre demasiado largo'),
  handle: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres').max(30, 'El nombre de usuario no puede superar 30 caracteres').regex(/^[a-z0-9_]+$/, 'Solo letras minúsculas, números y guiones bajos'),
  bio: z
    .string()
    .max(160, 'La biografía no puede superar 160 caracteres')
    .or(z.literal(''))
    .optional()
    .transform((value) => (value === undefined || value.trim() === '' ? undefined : value))
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const inputClass =
  'w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/40';

const textAreaClass = `${inputClass} min-h-[120px]`;
const errorClass = 'text-xs text-red-400';

interface ProfileEditFormProps {
  readonly profile: PublicProfile;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps): ReactElement {
  const router = useRouter();
  const updateUser = useSessionStore((state) => state.updateUser);
  const [formError, setFormError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile.displayName,
      handle: profile.handle,
      bio: profile.bio ?? ''
    }
  });

  const [avatarUrl, setAvatarUrl] = useState<string>(profile.avatarUrl ?? '');
  const handleValue = watch('handle');

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setUploadingAvatar(true);
    try {
      const result = await uploadMedia(file);
      setAvatarUrl(result.url);
      toast.success('Avatar subido correctamente');
    } catch (error) {
      toast.error('Error al subir el avatar. Inténtalo de nuevo.');
      setAvatarFile(null);
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = handleSubmit(async (values: ProfileFormValues) => {
    setFormError(null);
    try {
      const trimmedHandle = values.handle.trim().toLowerCase();
      const payload: {
        displayName?: string;
        handle?: string;
        bio?: string | null;
        avatarUrl?: string | null;
      } = {};

      if (values.displayName.trim() !== profile.displayName) {
        payload.displayName = values.displayName.trim();
      }

      if (trimmedHandle !== profile.handle) {
        payload.handle = trimmedHandle;
      }

      if (values.bio?.trim() !== (profile.bio ?? '')) {
        payload.bio = values.bio?.trim() || null;
      }

      if (avatarUrl.trim() !== (profile.avatarUrl ?? '')) {
        payload.avatarUrl = avatarUrl.trim() || null;
      }

      const updated = await updateProfile(payload);

      updateUser(updated);
      
      // Si el handle cambió, redirigir
      if (updated.handle !== profile.handle) {
        router.push(`/${updated.handle}`);
        toast.success('Perfil actualizado correctamente. Redirigiendo...');
      } else {
        router.refresh();
        toast.success('Perfil actualizado correctamente');
      }
    } catch (error: unknown) {
      logger.error('Error al actualizar perfil', { error });
      const axiosError = error as { response?: { data?: { message?: string; code?: string } } };
      const code = axiosError.response?.data?.code;
      
      if (code === 'HANDLE_ALREADY_EXISTS') {
        setFormError('Este nombre de usuario ya está en uso. Por favor, elige otro.');
      } else {
        setFormError(axiosError.response?.data?.message || 'No se pudo actualizar el perfil. Inténtalo nuevamente.');
      }
    }
  });

  const currentAvatarUrl = avatarPreview || getAvatarUrl(avatarUrl || profile.avatarUrl || '', profile.handle);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-gradient-primary text-2xl font-bold md:text-3xl">
          Editar perfil
        </h2>
        <p className="mt-2 text-sm text-slate-400">Actualiza la información de tu perfil público</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="displayName" className="block text-sm font-semibold text-slate-200">
            Nombre para mostrar
          </label>
          <input
            id="displayName"
            type="text"
            className="input-base"
            {...register('displayName')}
            placeholder="Tu nombre completo"
          />
          {errors.displayName ? (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.displayName.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="handle" className="block text-sm font-semibold text-slate-200">
            Nombre de usuario
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none z-10 select-none leading-none text-base">
              @
            </span>
            <input
              id="handle"
              type="text"
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 pr-4 py-3 pl-[2.75rem] text-sm text-white placeholder:text-slate-500/70 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/40 transition-all duration-300"
              {...register('handle', {
                onChange: (e) => {
                  const value = e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase();
                  setValue('handle', value);
                }
              })}
              placeholder="usuario"
              maxLength={30}
            />
          </div>
          <p className="text-xs text-slate-500">
            Solo letras minúsculas, números y guiones bajos. Entre 3 y 30 caracteres.
          </p>
          {errors.handle ? (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.handle.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="block text-sm font-semibold text-slate-200">
            Biografía
          </label>
          <textarea
            id="bio"
            className="input-base min-h-[120px] resize-none"
            {...register('bio')}
            placeholder="Cuenta algo sobre ti..."
            maxLength={160}
          />
          <p className="text-xs text-slate-500 text-right">Máximo 160 caracteres</p>
          {errors.bio ? (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.bio.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-4 rounded-2xl glass-card p-6">
          <label className="block text-sm font-semibold text-slate-200">
            Avatar
          </label>
          <div className="flex items-start gap-6">
            <div className="relative size-28 shrink-0 overflow-hidden rounded-full border-4 border-white/10 ring-2 ring-primary-500/20">
              <Image
                src={currentAvatarUrl}
                alt={profile.displayName}
                fill
                className="object-cover"
                unoptimized
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="size-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                disabled={uploadingAvatar}
                className="rounded-xl glass-dark px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {uploadingAvatar ? 'Subiendo...' : 'Subir imagen'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
              <p className="text-xs text-slate-500">
                Formatos soportados: JPG, PNG, WebP. Tamaño máximo: 5MB
              </p>
            </div>
          </div>
        </div>

        {formError ? (
          <div className="rounded-xl glass-card border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-400 flex items-center gap-2">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formError}
            </p>
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/5">
          <button
            type="button"
            onClick={() => {
              router.back();
            }}
            className="rounded-xl glass-dark px-6 py-2.5 text-sm font-semibold text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando...
              </span>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

