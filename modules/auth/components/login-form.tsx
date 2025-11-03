'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';

import { login } from '@/services/api/auth';
import { useSessionStore } from '@/store/session';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

import { loginFormSchema, type LoginFormValues } from '../validation';

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
      // No loguear errores de login fallidos en producción por seguridad
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const logger = await import('@/lib/logger');
        logger.logger.error('Error en login', { error });
      }
    }
  });

  return (
    <Card variant="glass" padding="lg" className="w-full max-w-md">
      <form onSubmit={onSubmit} className="space-y-5">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl">Bienvenido de nuevo</CardTitle>
          <CardDescription>
            Accede a tu cuenta para continuar tu experiencia en CircleSfera
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 px-0">
          <Input
            type="text"
            autoComplete="username"
            label="Correo o usuario"
            placeholder="hola@circlesfera.com"
            variant={errors.identifier ? 'error' : 'default'}
            error={errors.identifier?.message}
            {...register('identifier')}
          />

          <Input
            type="password"
            autoComplete="current-password"
            label="Contraseña"
            placeholder="••••••••"
            variant={errors.password ? 'error' : 'default'}
            error={errors.password?.message}
            {...register('password')}
          />

          {formError && (
            <div className="rounded-xl bg-danger-500/10 border border-danger-500/20 p-3">
              <p className="text-sm text-danger-400 flex items-center gap-2">
                <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {formError}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-0 pb-0">
          <Button
            type="submit"
            intent="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
          >
            Iniciar sesión
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

