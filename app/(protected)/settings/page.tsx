import { SettingsShell } from '@/modules/settings/components/settings-shell';

export const metadata = {
  title: 'Configuración — CircleSfera'
};

export default function SettingsPage() {
  return (
    <div className="w-full p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-gradient-primary text-3xl font-bold sm:text-4xl">Configuración</h1>
          <p className="mt-3 text-sm text-white/70 sm:text-base">
            Gestiona tu cuenta, perfil, privacidad y preferencias
          </p>
        </div>
        <SettingsShell />
      </div>
    </div>
  );
}

