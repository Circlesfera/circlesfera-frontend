'use client';

import { useRouter } from 'next/navigation';
import { type ReactElement,useEffect } from 'react';

import { useSession } from '@/hooks/use-session';

import { ProfileEditForm } from './profile-edit-form';

export function ProfileSettings(): ReactElement | null {
  const router = useRouter();
  const { user, isHydrated } = useSession();

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, user]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-slate-600 dark:text-white/60">
        Cargando tu perfil…
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <ProfileEditForm profile={user} />;
}

