import Link from 'next/link';

import { RegisterForm } from '@/modules/auth/components/register-form';

export const metadata = {
  title: 'Crear cuenta — CircleSfera'
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-20 text-white">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <Link href="/" className="text-sm uppercase tracking-[0.3em] text-white/60">
          CircleSfera
        </Link>
        <h1 className="text-3xl font-semibold sm:text-4xl">Únete a CircleSfera</h1>
        <p className="max-w-md text-sm text-white/60">
          Comparte historias inmersivas, conecta con tus seguidores y construye tu comunidad.
        </p>
      </div>

      <RegisterForm />

      <p className="mt-6 text-xs text-white/50">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-white hover:text-primary-200">
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}

