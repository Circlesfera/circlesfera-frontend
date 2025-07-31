"use client";

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import Link from 'next/link';
import { useUnreadNotifications } from '@/features/notifications/useUnreadNotifications';

// Iconos SVG simples
const HomeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const MessageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ExploreIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const NotificationIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4a2 2 0 00-1.18 3.25L6 10l-2.8 2.8A2 2 0 004 15.19V19a2 2 0 002 2h12a2 2 0 002-2v-3.81a2 2 0 00-.2-2.39L18 10l2.8-2.8A2 2 0 0019.81 4H4.19z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default function Header() {
  const { user, logout } = useAuth();
  const unread = useUnreadNotifications();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 left-0 w-full h-16 bg-white border-b border-gray-200 flex items-center justify-center px-4 z-50">
      <div className="max-w-4xl w-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="font-bold text-2xl text-gray-900 tracking-tight select-none">CircleSfera</span>
          </Link>
        </div>

        {/* Buscador centrado */}
        <div className="hidden md:block w-72">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar"
              className={`w-full px-12 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center text-sm focus:outline-none transition-colors ${
                searchFocused ? 'border-gray-400 bg-white' : 'hover:border-gray-300'
              }`}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          </div>
        </div>

        {/* Navegación derecha */}
        <nav className="flex items-center gap-6">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <HomeIcon />
          </Link>
          
          <Link href="/messages" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MessageIcon />
          </Link>
          
          <Link href="/explore" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ExploreIcon />
          </Link>
          
          <Link href="/notifications" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <NotificationIcon />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
          
          {user && (
            <Link href={`/${user.username}`} className="flex items-center p-1 hover:bg-gray-100 rounded-lg transition-colors">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="avatar" 
                  className="w-6 h-6 rounded-full object-cover" 
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center font-bold text-white text-xs">
                  {user.username[0].toUpperCase()}
                </div>
              )}
            </Link>
          )}
          
          <button
            onClick={logout}
            className="text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
          >
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
}
