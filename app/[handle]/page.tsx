import { notFound } from 'next/navigation';

import { ProfileHeader } from '@/modules/profile/components/profile-header';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ProfileResponse = {
  user: {
    id: string;
    email: string;
    handle: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

async function getProfile(handle: string) {
  const target = `${API_URL}/users/${handle}`;
  const response = await fetch(target, { next: { revalidate: 120 } });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error('No se pudo cargar el perfil');
  }

  const data = (await response.json()) as ProfileResponse;
  return data.user;
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const resolvedParams = await params;
  return {
    title: `@${resolvedParams.handle} — CircleSfera`
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const profile = await getProfile(handle);

  return (
    <main className="flex min-h-screen flex-col items-center gap-10 bg-slate-950 px-6 py-16 text-white">
      <ProfileHeader profile={profile} />
      <section className="flex min-h-[200px] w-full max-w-5xl items-center justify-center rounded-3xl border border-white/10 bg-slate-900/40 text-sm text-white/50">
        El contenido del usuario aparecerá aquí próximamente.
      </section>
    </main>
  );
}

