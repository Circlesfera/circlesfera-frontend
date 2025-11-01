import Link from 'next/link';

import { LoginForm } from '@/modules/auth/components/login-form';

export const metadata = {
  title: 'Iniciar sesión — CircleSfera'
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-20 text-white">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <Link href="/" className="text-sm uppercase tracking-[0.3em] text-white/60">
          CircleSfera
        </Link>
        <h1 className="text-3xl font-semibold sm:text-4xl">Inicia sesión en tu espacio</h1>
        <p className="max-w-md text-sm text-white/60">
          Accede a tu feed personalizado y continúa la conversación con tu comunidad.
        </p>
      </div>

      <LoginForm />

      <p className="mt-6 text-xs text-white/50">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-white hover:text-primary-200">
          Regístrate gratis
        </Link>
      </p>
    </main>
  );
}

