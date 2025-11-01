'use client';

import { useEffect, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';

import { ProfileEditForm } from './profile-edit-form';
import { useSession } from '@/hooks/use-session';

export function ProfileSettings(): ReactElement | null {
  const router = useRouter();
  const { user, isHydrated } = useSession();

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace('/login');
    }
  }, [isHydrated, router, user]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-white/60">
        Cargando tu perfil…
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <ProfileEditForm profile={user} />;
}

