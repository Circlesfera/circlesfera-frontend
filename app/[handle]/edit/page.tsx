import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export function generateMetadata({ params }: { params: { handle: string } }): Metadata {
  return {
    title: `Editar perfil — @${params.handle} — CircleSfera`
  };
}

/**
 * Redirige la ruta antigua /[handle]/edit a la nueva página de settings
 * para mantener compatibilidad con enlaces antiguos.
 */
export default function EditProfilePage(): never {
  redirect('/settings?tab=profile');
}

