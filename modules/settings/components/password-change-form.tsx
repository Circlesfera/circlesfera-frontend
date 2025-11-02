'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, type ReactElement } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';

import { changePassword } from '@/services/api/users';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const inputClass =
  'w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/40';
const errorClass = 'text-xs text-red-400';

export function PasswordChangeForm(): ReactElement {
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema)
  });

  const onSubmit = handleSubmit(async (values: PasswordFormValues) => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });

      toast.success('Contraseña actualizada exitosamente');
      reset();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar la contraseña';
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Cambiar contraseña</h2>
        <p className="mt-2 text-sm text-slate-400">Actualiza tu contraseña para mantener tu cuenta segura</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="currentPassword" className="text-sm font-medium text-white">
            Contraseña actual
          </label>
          <input
            id="currentPassword"
            type="password"
            className={inputClass}
            {...register('currentPassword')}
            placeholder="Introduce tu contraseña actual"
          />
          {errors.currentPassword ? <p className={errorClass}>{errors.currentPassword.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium text-white">
            Nueva contraseña
          </label>
          <input
            id="newPassword"
            type="password"
            className={inputClass}
            {...register('newPassword')}
            placeholder="Mínimo 8 caracteres"
          />
          {errors.newPassword ? <p className={errorClass}>{errors.newPassword.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-white">
            Confirmar nueva contraseña
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={inputClass}
            {...register('confirmPassword')}
            placeholder="Repite la nueva contraseña"
          />
          {errors.confirmPassword ? <p className={errorClass}>{errors.confirmPassword.message}</p> : null}
        </div>

        {formError ? <p className={errorClass}>{formError}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:bg-primary-500/60"
        >
          {isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>
      </form>
    </div>
  );
}

