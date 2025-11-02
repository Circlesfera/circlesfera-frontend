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
        href="/feed"
        className="flex items-center justify-center text-slate-400 transition hover:text-white"
        title="Inicio"
      >
        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </Link>

      <Link
        href="/explore"
        className="flex items-center justify-center text-slate-400 transition hover:text-white"
        title="Explorar"
      >
        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </Link>

      <Link
        href="/reels"
        className="flex items-center justify-center text-slate-400 transition hover:text-white"
        title="Reels"
      >
        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </Link>

      <Link
        href="/upload"
        className="flex items-center justify-center text-slate-400 transition hover:text-white"
        title="Crear publicación"
      >
        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </Link>

      <Link
        href="/messages"
        className="flex items-center justify-center text-slate-400 transition hover:text-white relative"
        title="Mensajes"
      >
        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </Link>

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
        href="/archived"
        className="flex items-center justify-center text-slate-400 transition hover:text-white"
        title="Archivados"
      >
        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      </Link>

      <Link
        href="/analytics"
        className="flex items-center justify-center text-slate-400 transition hover:text-white"
        title="Analytics"
      >
        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </Link>

      {user?.isAdmin && (
        <Link
          href="/admin/verification"
          className="flex items-center justify-center text-slate-400 transition hover:text-white"
          title="Administración"
        >
          <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </Link>
      )}

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

