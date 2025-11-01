'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

import { updateProfile } from '@/services/api/users';
import { useSessionStore } from '@/store/session';

import type { PublicProfile } from '@/services/api/users';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Introduce al menos 2 caracteres').max(64, 'Nombre demasiado largo'),
  bio: z
    .string()
    .max(160, 'La biografía no puede superar 160 caracteres')
    .or(z.literal(''))
    .optional()
    .transform((value) => (value === undefined || value.trim() === '' ? undefined : value)),
  avatarUrl: z
    .string()
    .url('Introduce una URL válida')
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
  const { updateUser } = useSessionStore((state) => ({ updateUser: state.updateUser }));
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(
      profileSchema.extend({
        bio: profileSchema.shape.displayName?.transform(() => '')?.optional(),
        avatarUrl: profileSchema.shape.displayName?.transform(() => '')?.optional()
      })
    ),
    defaultValues: {
      displayName: profile.displayName,
      bio: profile.bio ?? '',
      avatarUrl: profile.avatarUrl ?? ''
    }
  });

  const onSubmit = handleSubmit(async (values: ProfileFormValues) => {
    setFormError(null);
    try {
      const updated = await updateProfile({
        displayName: values.displayName,
        bio: values.bio ?? null,
        avatarUrl: values.avatarUrl?.trim() ? values.avatarUrl : null
      });

      updateUser(updated);
      router.refresh();
    } catch (error) {
      console.error(error);
      setFormError('No se pudo actualizar el perfil. Inténtalo nuevamente.');
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 rounded-3xl bg-slate-900/60 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,1)]">
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Nombre para mostrar</label>
        <input type="text" className={inputClass} {...register('displayName')} />
        {errors.displayName ? <p className={errorClass}>{errors.displayName.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Biografía</label>
        <textarea className={textAreaClass} {...register('bio')} placeholder="Cuenta algo sobre ti" />
        {errors.bio ? <p className={errorClass}>{errors.bio.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Avatar (URL)</label>
        <input
          type="url"
          className={inputClass}
          {...register('avatarUrl')}
          placeholder="https://cdn.circlesfera.com/avatar.jpg"
        />
        {errors.avatarUrl ? <p className={errorClass}>{errors.avatarUrl.message}</p> : null}
      </div>

      {formError ? <p className={errorClass}>{formError}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="self-end rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:bg-primary-500/60"
      >
        {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  );
}

