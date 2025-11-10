'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type ReactElement,useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { getAvatarUrl, isLocalImage } from '@/lib/image-utils';
import { uploadMedia } from '@/services/api/media';
import type { PublicProfile } from '@/services/api/users';
import { updateProfile } from '@/services/api/users';
import { useSessionStore } from '@/store/session';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Introduce al menos 2 caracteres').max(64, 'Nombre demasiado largo'),
  handle: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(32, 'El nombre de usuario no puede superar 32 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guiones bajos'),
  bio: z
    .string()
    .max(160, 'La biografía no puede superar 160 caracteres')
    .or(z.literal(''))
    .optional()
    .transform((value) => (value === undefined || value.trim() === '' ? undefined : value))
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const inputClass =
  'w-full rounded-xl border border-slate-300 dark:border-white/5 bg-slate-50 dark:bg-white/5 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 transition-all duration-200 focus:border-primary-500/50 focus:bg-slate-100 dark:focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20';

const textAreaClass = `${inputClass} min-h-[100px] resize-none`;
const errorClass = 'mt-1.5 text-xs font-medium text-red-400';
const helpTextClass = 'mt-1.5 text-xs text-slate-600 dark:text-white/40';

interface ProfileEditFormProps {
  readonly profile: PublicProfile;
  readonly onSuccess?: () => void;
}

export function ProfileEditForm({ profile, onSuccess }: ProfileEditFormProps): ReactElement {
  const router = useRouter();
  const updateUser = useSessionStore((state) => state.updateUser);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile.displayName,
      handle: profile.handle,
      bio: profile.bio ?? ''
    }
  });

  useEffect(() => {
    // Actualizar preview basado en URL subida o avatar actual
    if (uploadedAvatarUrl) {
      setAvatarPreview(uploadedAvatarUrl);
    } else {
      setAvatarPreview(profile.avatarUrl);
    }
  }, [uploadedAvatarUrl, profile.avatarUrl]);

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB para avatares)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    // Crear preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Subir automáticamente
    setUploadingAvatar(true);
    try {
      const result = await uploadMedia(file);
      setUploadedAvatarUrl(result.url);
      toast.success('Avatar subido correctamente');
    } catch {
      toast.error('Error al subir el avatar. Inténtalo de nuevo.');
      setAvatarPreview(profile.avatarUrl);
      setUploadedAvatarUrl(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = handleSubmit(async (values: ProfileFormValues) => {
    try {
      // Usar la URL subida si existe, sino mantener el avatar actual
      const finalAvatarUrl = uploadedAvatarUrl ?? profile.avatarUrl;
      
      // Preparar payload, solo incluir handle si cambió
      const payload: {
        displayName?: string;
        bio?: string | null;
        avatarUrl?: string | null;
        handle?: string;
      } = {
        displayName: values.displayName,
        bio: values.bio ?? null,
        avatarUrl: finalAvatarUrl
      };

      // Solo incluir handle si cambió
      if (values.handle.trim().toLowerCase() !== profile.handle.toLowerCase()) {
        payload.handle = values.handle.trim();
      }
      
      const updated = await updateProfile(payload);

      updateUser(updated);
      toast.success('Perfil actualizado correctamente');
      
      // Si el handle cambió, redirigir al nuevo handle
      const newHandle = updated.handle;
      const handleChanged = newHandle.toLowerCase() !== profile.handle.toLowerCase();
      
      // Si hay un callback onSuccess, ejecutarlo primero
      if (onSuccess) {
        onSuccess();
        // Si cambió el handle, también redirigir después del callback
        if (handleChanged) {
          // Usar setTimeout para dar tiempo al callback de ejecutarse
          setTimeout(() => {
            window.location.href = `/${newHandle}`;
          }, 100);
        }
      } else if (handleChanged) {
        // Si cambió el handle, redirigir al nuevo perfil con recarga completa
        window.location.href = `/${newHandle}`;
      } else {
        // Si no cambió el handle, redirigir al perfil actual
        router.push(`/${newHandle}`);
      }
    } catch (error: unknown) {
      console.error(error);
      const axiosError = error as { response?: { data?: { code?: string; message?: string } } };
      const code = axiosError.response?.data?.code;
      const message = axiosError.response?.data?.message;
      
      if (code === 'HANDLE_ALREADY_EXISTS') {
        toast.error('Este nombre de usuario ya está en uso. Por favor, elige otro.');
      } else {
        toast.error(message || 'No se pudo actualizar el perfil. Inténtalo nuevamente.');
      }
    }
  });

  const previewAvatarUrl = avatarPreview ? getAvatarUrl(avatarPreview, profile.handle) : null;

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="w-full max-w-3xl"
    >
      <div className="space-y-8">
        {/* Avatar Preview Section */}
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-white/5 bg-white/5 p-8">
          <div className="relative">
            <div className="relative size-32 overflow-hidden rounded-full border-2 border-primary-500/30 shadow-lg">
              {previewAvatarUrl ? (
                <Image
                  src={previewAvatarUrl}
                  alt="Preview del avatar"
                  fill
                  className="object-cover"
                  unoptimized={isLocalImage(previewAvatarUrl)}
                  onError={() => setAvatarPreview(null)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-overlay/60 backdrop-blur-sm rounded-full dark:bg-black/60">
                  <span className="text-4xl font-bold text-primary-400">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 dark:bg-black/60 backdrop-blur-sm rounded-full">
                  <div className="size-8 animate-spin rounded-full border-2 border-white dark:border-white border-t-transparent" />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white backdrop-blur-sm transition-all duration-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:border-slate-400 dark:hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploadingAvatar ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Subiendo...
                </>
              ) : (
                <>
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Subir avatar
                </>
              )}
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => {
                void handleAvatarFileChange(event);
              }}
              className="hidden"
            />
            <p className="text-xs text-slate-600 dark:text-white/40">Formatos: JPG, PNG, WebP. Máximo 5MB</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Handle / Nombre de usuario */}
          <div className="space-y-2">
            <label htmlFor="handle" className="block text-sm font-semibold text-slate-900 dark:text-white">
              Nombre de usuario
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-white/40 text-sm">@</span>
              <input
                id="handle"
                type="text"
                className={`${inputClass} pl-8`}
                {...register('handle')}
                placeholder="nombre_usuario"
              />
            </div>
            {errors.handle ? (
              <p className={errorClass}>{errors.handle.message}</p>
            ) : (
              <p className={helpTextClass}>Entre 3 y 32 caracteres. Solo letras, números y guiones bajos</p>
            )}
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <label htmlFor="displayName" className="block text-sm font-semibold text-slate-900 dark:text-white">
              Nombre para mostrar
            </label>
            <input
              id="displayName"
              type="text"
              className={inputClass}
              {...register('displayName')}
              placeholder="Tu nombre público"
            />
            {errors.displayName ? (
              <p className={errorClass}>{errors.displayName.message}</p>
            ) : (
              <p className={helpTextClass}>Este nombre aparecerá en tu perfil público</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label htmlFor="bio" className="block text-sm font-semibold text-slate-900 dark:text-white">
              Biografía
            </label>
            <textarea
              id="bio"
              className={textAreaClass}
              {...register('bio')}
              placeholder="Cuenta algo sobre ti..."
              rows={4}
            />
            {errors.bio ? (
              <p className={errorClass}>{errors.bio.message}</p>
            ) : (
              <p className={helpTextClass}>Máximo 160 caracteres. Comparte lo que te hace único.</p>
            )}
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200/50 dark:border-white/5 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-300 dark:border-white/10 bg-transparent px-6 py-2.5 text-sm font-medium text-slate-700 dark:text-white/80 transition-colors hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando…
              </span>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

