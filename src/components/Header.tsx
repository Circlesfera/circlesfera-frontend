"use client";

import React from 'react';
import { useAuth } from '@/features/auth/useAuth';
import Link from 'next/link';
import { useUnreadNotifications } from '@/features/notifications/useUnreadNotifications';

export default function Header() {
  const { user, logout } = useAuth();
  const unread = useUnreadNotifications();

  return (
    <header className="sticky top-0 left-0 w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 z-50 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="font-extrabold text-2xl text-[var(--accent)] tracking-tight select-none">⭮ CircleSfera</span>
      </div>
      {/* Buscador */}
      <div className="hidden md:block w-1/3">
        <input
          type="text"
          placeholder="Buscar"
          className="w-full px-4 py-2 rounded-full bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all shadow-sm text-base"
        />
      </div>
      {/* Usuario y logout */}
      <nav className="flex items-center gap-6 text-gray-600 text-xl">
        <Link href="/notifications" className="relative hover:text-[var(--accent)] transition-colors">
          <span title="Notificaciones">🔔</span>
          {unread > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold animate-pulse shadow-md border-2 border-white">
              {unread}
            </span>
          )}
        </Link>
        {user && (
          <>
            <span className="flex items-center gap-2 text-base">
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover border-2 border-[var(--accent)] shadow-sm" />
              ) : (
                <span className="w-9 h-9 rounded-full bg-gradient-to-tr from-[var(--accent)] to-blue-400 flex items-center justify-center font-bold text-white text-lg border-2 border-white shadow-sm">
                  {user.username[0].toUpperCase()}
                </span>
              )}
              <span className="hidden md:inline font-medium text-gray-800">{user.username}</span>
            </span>
            <button
              onClick={logout}
              className="ml-2 px-4 py-1 bg-red-50 text-red-600 rounded-full hover:bg-red-100 text-sm font-semibold border border-red-100 transition-colors shadow-sm"
              title="Cerrar sesión"
            >
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
