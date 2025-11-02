import { type ReactElement } from 'react';
import { VerificationShell } from '@/modules/verification/components/verification-shell';

export const metadata = {
  title: 'Verificación de cuenta — CircleSfera'
};

export default function VerificationPage(): ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-slate-950 px-6 py-16 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Verificación de cuenta</h1>
        <p className="mt-2 text-sm text-white/60">Solicita el badge azul de verificación para tu cuenta</p>
      </div>
      <div className="w-full max-w-2xl">
        <VerificationShell />
      </div>
    </main>
  );
}

