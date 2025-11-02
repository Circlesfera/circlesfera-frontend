'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type ReactElement } from 'react';

import { useSessionStore } from '@/store/session';
import { useNotifications } from '@/modules/notifications/hooks/use-notifications';

export function ClientNav(): ReactElement {
  const user = useSessionStore((state) => state.user);
  const { unreadCount } = useNotifications(false);

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
        href="/notifications"
        className="relative flex items-center justify-center text-slate-400 transition hover:text-white"
        title="Notificaciones"
      >
        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
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

