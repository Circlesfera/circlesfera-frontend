import { EditProfileForm } from '@/modules/profile/components/edit-profile-form';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchProfile(handle: string) {
  const target = `${API_URL}/users/${handle}`;
  const response = await fetch(target, { next: { revalidate: 120 } });

  if (!response.ok) {
    throw new Error('No se pudo cargar el perfil');
  }

  const data = await response.json();
  return data.user;
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const resolvedParams = await params;
  return {
    title: `Editar perfil — @${resolvedParams.handle} — CircleSfera`
  };
}

export default async function EditProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  
  // En un componente server, necesitamos obtener el usuario de otra manera
  // Por ahora, cargamos el perfil directamente
  const profile = await fetchProfile(handle);

  // TODO: Verificar que el usuario autenticado sea el dueño del perfil
  // Por ahora asumimos que la ruta está protegida

  return (
    <main className="flex min-h-screen flex-col items-center gap-10 bg-slate-950 px-6 py-16 text-white">
      <div className="w-full max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-white">Editar perfil</h1>
        <EditProfileForm profile={profile} />
      </div>
    </main>
  );
}

