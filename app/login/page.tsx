import Link from 'next/link';

import { LoginForm } from '@/modules/auth/components/login-form';

export const metadata = {
  title: 'Iniciar sesión — CircleSfera'
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 py-20">
      <div className="mb-12 flex flex-col items-center gap-4 text-center">
        <Link 
          href="/" 
          className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400 transition-colors hover:text-primary-400"
        >
          <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 shadow-lg shadow-primary-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-primary-500/50">
            <span className="text-sm font-bold text-white">C</span>
          </div>
          <span className="text-gradient-primary font-bold">CircleSfera</span>
        </Link>
        <h1 className="text-gradient-primary text-4xl font-bold sm:text-5xl">
          Inicia sesión
        </h1>
        <p className="max-w-md text-sm text-slate-400">
          Accede a tu feed personalizado y continúa la conversación con tu comunidad.
        </p>
      </div>

      <LoginForm />

      <p className="mt-8 text-sm text-slate-400">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="font-medium text-primary-400 transition-colors hover:text-primary-300">
          Regístrate gratis
        </Link>
      </p>
    </main>
  );
}

