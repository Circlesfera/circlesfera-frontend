'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, type ReactElement } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { changePassword } from '@/services/api/users';
import { fadeUpVariants } from '@/lib/motion-config';

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
    <div className="space-y-8">
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-gradient-primary text-2xl font-bold md:text-3xl">
          Cambiar contraseña
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Actualiza tu contraseña para mantener tu cuenta segura</p>
      </motion.div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="currentPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Contraseña actual
          </label>
          <input
            id="currentPassword"
            type="password"
            className="input-base"
            {...register('currentPassword')}
            placeholder="Introduce tu contraseña actual"
          />
          {errors.currentPassword ? (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.currentPassword.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Nueva contraseña
          </label>
          <input
            id="newPassword"
            type="password"
            className="input-base"
            {...register('newPassword')}
            placeholder="Mínimo 8 caracteres"
          />
          <p className="text-xs text-slate-500">La contraseña debe tener al menos 8 caracteres</p>
          {errors.newPassword ? (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.newPassword.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Confirmar nueva contraseña
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="input-base"
            {...register('confirmPassword')}
            placeholder="Repite la nueva contraseña"
          />
          {errors.confirmPassword ? (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.confirmPassword.message}
            </p>
          ) : null}
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

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200/50 dark:border-white/5">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Actualizando...
              </span>
            ) : (
              'Actualizar contraseña'
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}

