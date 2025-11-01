import { ProfileSettings } from '@/modules/profile/components/profile-settings';

export const metadata = {
  title: 'Configuración de perfil — CircleSfera'
};

export default function SettingsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-slate-950 px-6 py-16 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Configura tu perfil</h1>
        <p className="mt-2 text-sm text-white/60">Actualiza tu nombre, biografía y avatar para destacar en CircleSfera.</p>
      </div>
      <ProfileSettings />
    </main>
  );
}

