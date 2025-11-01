'use client';

import Image from 'next/image';
import type { ReactElement } from 'react';

import type { PublicProfile } from '@/services/api/users';

interface ProfileHeaderProps {
  readonly profile: PublicProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps): ReactElement {
  return (
    <header className="flex flex-col items-center gap-4 text-center">
      <div className="relative size-24">
        <Image
          src={profile.avatarUrl ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${profile.handle}`}
          alt={profile.displayName}
          fill
          className="rounded-full object-cover"
        />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">{profile.displayName}</h1>
        <p className="text-sm text-white/60">@{profile.handle}</p>
      </div>
      {profile.bio ? <p className="max-w-lg text-sm text-white/70">{profile.bio}</p> : null}
    </header>
  );
}

