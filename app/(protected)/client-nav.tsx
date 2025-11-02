'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type ReactElement } from 'react';

import { useSessionStore } from '@/store/session';

export function ClientNav(): ReactElement {
  const user = useSessionStore((state) => state.user);

  return (
    <nav className="flex items-center gap-4">
      <Link
        href="/saved"
        className="flex items-center justify-center text-slate-400 transition hover:text-white"
        title="Guardados"
      >
        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      </Link>
      <Link
        href={user ? `/${user.handle}` : '/feed'}
        className="relative size-10 overflow-hidden rounded-full border border-white/20 transition hover:border-white/40"
      >
        <Image
          src={user?.avatarUrl ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.handle ?? 'user'}`}
          alt={user?.displayName ?? 'Usuario'}
          fill
          className="object-cover"
        />
      </Link>
    </nav>
  );
}

