import { notFound } from 'next/navigation';

import { ProfileHeader } from '@/modules/profile/components/profile-header';
import { ProfileHighlights } from '@/modules/profile/components/profile-highlights';
import { ProfilePostsGrid } from '@/modules/profile/components/profile-posts-grid';
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
    <div className="w-full px-0 py-8">
      <div className="mx-auto max-w-[935px]">
        <div className="animate-fade-in">
          <ProfileHeader profile={profile} stats={stats} />
          <ProfileHighlights profileHandle={handle} isOwnProfile={false} />
          <div className="mt-12 border-t border-white/5 pt-8">
            <ProfilePostsGrid handle={handle} />
          </div>
        </div>
      </div>
    </div>
  );
}

