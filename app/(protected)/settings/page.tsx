import { Suspense, type ReactElement } from 'react';

import { SettingsShell } from '@/modules/settings/components/settings-shell';
import { SettingsShellSkeleton } from '@/components/skeletons';

function SettingsShellWrapper(): ReactElement {
  return (
    <Suspense fallback={<SettingsShellSkeleton />}>
      <SettingsShell />
    </Suspense>
  );
}

export const metadata = {
  title: 'Configuración — CircleSfera'
};

export default function SettingsPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="mb-8 rounded-2xl glass-card p-6 md:p-8 animate-fade-in">
        <h1 className="text-gradient-primary text-3xl font-bold md:text-4xl">
          Configuración
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-400">
          Administra tu cuenta y preferencias
        </p>
      </div>
      <SettingsShellWrapper />
    </main>
  );
}
