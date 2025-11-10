'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactElement,useState } from 'react';
import { useForm } from 'react-hook-form';

import { logger } from '@/lib/logger';
import { login } from '@/services/api/auth';
import { useSessionStore } from '@/store/session';

import { loginFormSchema, type LoginFormValues } from '../validation';

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 backdrop-blur-sm transition-all duration-300 focus:border-primary-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/30';

const errorClass = 'text-xs text-red-400';

export function LoginForm(): ReactElement {
  const setSession = useSessionStore((state) => state.setSession);
  const markHydrated = useSessionStore((state) => state.markHydrated);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      identifier: '',
      password: ''
    }
  });

  const onSubmit = handleSubmit(async (values: LoginFormValues) => {
    setFormError(null);
    try {
      const response = await login(values);
      setSession({
        user: response.user,
        accessToken: response.accessToken,
        expiresIn: response.expiresIn
      });
      // Marcar como hidratado inmediatamente después del login exitoso
      // para evitar que SessionHydrator intente refrescar la sesión
      markHydrated(response.user);
      
      // Configurar refresh automático del token
      const { setupTokenRefresh } = await import('@/lib/token-refresh');
      setupTokenRefresh();
      
      // Usar window.location para forzar una recarga completa y asegurar que las cookies estén disponibles
      // Esto evita problemas de timing con el middleware
      window.location.href = '/feed';
    } catch (error) {
      if (error instanceof Error && error.message) {
        setFormError(error.message);
      } else {
      setFormError('Credenciales inválidas. Verifica tus datos e inténtalo de nuevo.');
      }
      logger.error('Error iniciando sesión', error);
    }
  });

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="glass-card flex w-full max-w-md flex-col gap-6 p-8 shadow-elegant-lg"
    >
      <div className="space-y-2">
        <label className="text-sm font-semibold text-white">Correo o usuario</label>
        <input
          type="text"
          autoComplete="username"
          {...register('identifier')}
          className={inputClass}
          placeholder="hola@circlesfera.com"
        />
        {errors.identifier ? <p className={errorClass}>{errors.identifier.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-white">Contraseña</label>
        <input
          type="password"
          autoComplete="current-password"
          {...register('password')}
          className={inputClass}
          placeholder="••••••••"
        />
        {errors.password ? <p className={errorClass}>{errors.password.message}</p> : null}
      </div>

      {formError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 backdrop-blur-sm">
          <p className={errorClass}>{formError}</p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-all duration-300 hover:from-primary-500 hover:via-accent-500 hover:to-primary-600 hover:shadow-xl hover:shadow-primary-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
      >
        {isSubmitting ? 'Accediendo…' : 'Iniciar sesión'}
      </button>
    </form>
  );
}

