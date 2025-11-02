import { type ReactElement } from 'react';
import { AdminVerificationShell } from '@/modules/admin/components/admin-verification-shell';

export const metadata = {
  title: 'Administración - Verificaciones — CircleSfera'
};

export default function AdminVerificationPage(): ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-slate-950 px-6 py-16 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Administración de Verificaciones</h1>
        <p className="mt-2 text-sm text-white/60">Revisa y aprueba solicitudes de verificación de cuenta</p>
      </div>
      <div className="w-full max-w-4xl">
        <AdminVerificationShell />
      </div>
    </main>
  );
}

