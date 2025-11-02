import { SettingsShell } from '@/modules/settings/components/settings-shell';

export const metadata = {
  title: 'Configuración — CircleSfera'
};

export default function SettingsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-slate-950 px-6 py-16 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Configuración</h1>
        <p className="mt-2 text-sm text-white/60">Administra tu cuenta y preferencias</p>
      </div>
      <SettingsShell />
    </main>
  );
}
