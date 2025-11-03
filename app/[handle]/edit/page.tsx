import { redirect } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const resolvedParams = await params;
  return {
    title: `Editar perfil — @${resolvedParams.handle} — CircleSfera`
  };
}

/**
 * Redirige la ruta antigua /[handle]/edit a la nueva página de settings
 * para mantener compatibilidad con enlaces antiguos.
 */
export default async function EditProfilePage(): Promise<never> {
  redirect('/settings?tab=profile');
}

