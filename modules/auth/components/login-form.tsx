'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';

import { login } from '@/services/api/auth';
import { useSessionStore } from '@/store/session';

import { loginFormSchema, type LoginFormValues } from '../validation';

const inputClass =
  'w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/40';

const errorClass = 'text-xs text-red-400';

export function LoginForm(): ReactElement {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);
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
      router.replace('/feed');
    } catch (error) {
      setFormError('Credenciales inválidas. Verifica tus datos e inténtalo de nuevo.');
      console.error(error);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-6 rounded-3xl bg-slate-900/60 p-8 shadow-[0_25px_60px_-40px_rgba(15,23,42,1)]">
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Correo o usuario</label>
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
        <label className="text-sm font-medium text-white">Contraseña</label>
        <input
          type="password"
          autoComplete="current-password"
          {...register('password')}
          className={inputClass}
          placeholder="••••••••"
        />
        {errors.password ? <p className={errorClass}>{errors.password.message}</p> : null}
      </div>

      {formError ? <p className={errorClass}>{formError}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:bg-primary-500/60"
      >
        {isSubmitting ? 'Accediendo…' : 'Iniciar sesión'}
      </button>
    </form>
  );
}

