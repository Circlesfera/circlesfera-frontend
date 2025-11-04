import { notFound } from 'next/navigation';

import { ProfileHeader } from '@/modules/profile/components/profile-header';
import { ProfileHighlights } from '@/modules/profile/components/profile-highlights';
import { ProfileTabs } from '@/modules/profile/components/profile-tabs';
import type { ProfileResponse, UserStats } from '@/services/api/users';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getProfile(handle: string): Promise<ProfileResponse> {
  const target = `${API_URL}/users/${handle}`;
  const response = await fetch(target, { next: { revalidate: 120 } });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error('No se pudo cargar el perfil');
  }

  const data = (await response.json()) as ProfileResponse;
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const resolvedParams = await params;
  return {
    title: `@${resolvedParams.handle} — CircleSfera`
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const { user: profile, stats } = await getProfile(handle);

  return (
    <div className="w-full min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="animate-fade-in space-y-8">
          {/* Header con mejor diseño */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/50 via-slate-900/30 to-slate-900/50 p-8 md:p-12 backdrop-blur-sm shadow-elegant-lg">
          <ProfileHeader profile={profile} stats={stats} />
          </div>
          
          {/* Highlights */}
          {profile.bio || true ? (
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-slate-900/40 p-6 backdrop-blur-sm">
            <ProfileHighlights profileHandle={handle} isOwnProfile={false} />
          </div>
          ) : null}

          {/* Tabs con contenido */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-slate-900/40 p-6 md:p-8 backdrop-blur-sm">
            <ProfileTabs handle={handle} />
          </div>
        </div>
      </div>
    </div>
  );
}

