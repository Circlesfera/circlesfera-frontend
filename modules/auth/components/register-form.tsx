'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';

import { register as registerRequest } from '@/services/api/auth';
import { useSessionStore } from '@/store/session';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

import { registerFormSchema, type RegisterFormValues } from '../validation';

export function RegisterForm(): ReactElement {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: '',
      password: '',
      displayName: '',
      handle: ''
    }
  });

  const onSubmit = handleSubmit(async (values: RegisterFormValues) => {
    setFormError(null);
    try {
      const response = await registerRequest(values);
      setSession({
        user: response.user,
        accessToken: response.accessToken,
        expiresIn: response.expiresIn
      });
      router.replace('/feed');
    } catch (error) {
      setFormError('No pudimos crear tu cuenta. Verifica los datos e inténtalo nuevamente.');
      // No loguear errores de registro en producción por seguridad
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const logger = await import('@/lib/logger');
        logger.logger.error('Error en registro', { error });
      }
    }
  });

  return (
    <Card variant="glass" padding="lg" className="w-full max-w-lg">
      <form onSubmit={onSubmit} className="space-y-5">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl">Crea tu cuenta</CardTitle>
          <CardDescription>
            Únete a CircleSfera y comienza a compartir con tu comunidad
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 px-0">
          <Input
            type="text"
            label="Nombre público"
            placeholder="Tu nombre"
            variant={errors.displayName ? 'error' : 'default'}
            error={errors.displayName?.message}
            {...register('displayName')}
          />

          <Input
            type="text"
            label="Usuario"
            placeholder="tunombre"
            variant={errors.handle ? 'error' : 'default'}
            error={errors.handle?.message}
            helperText="Este será tu @usuario único"
            {...register('handle')}
          />

          <Input
            type="email"
            autoComplete="email"
            label="Correo electrónico"
            placeholder="hola@circlesfera.com"
            variant={errors.email ? 'error' : 'default'}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            type="password"
            autoComplete="new-password"
            label="Contraseña"
            placeholder="••••••••"
            variant={errors.password ? 'error' : 'default'}
            error={errors.password?.message}
            helperText="Mínimo 8 caracteres"
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
            Crear cuenta
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

