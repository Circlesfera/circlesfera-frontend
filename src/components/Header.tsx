"use client";

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import Link from 'next/link';
import { useUnreadNotifications } from '@/features/notifications/useUnreadNotifications';

// Iconos SVG modernos
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

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export default function Header() {
  const { user, logout } = useAuth();
  const unread = useUnreadNotifications();
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 left-0 w-full h-16 bg-white/90 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-center px-4 z-50 shadow-sm">
      <div className="max-w-6xl w-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <span className="font-bold text-2xl text-gradient-accent tracking-tight select-none group-hover:scale-105 transition-transform duration-200">
                CircleSfera
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-200"></div>
            </div>
          </Link>
        </div>

        {/* Buscador centrado - Desktop */}
        <div className="hidden md:block w-96">
          <div className="relative group">
            <input
              type="text"
              placeholder="Buscar en CircleSfera..."
              className={`w-full px-12 py-3 bg-gray-50/80 border-2 border-gray-200 rounded-xl text-center text-sm focus:outline-none transition-all duration-300 ${
                searchFocused 
                  ? 'border-blue-400 bg-white shadow-lg shadow-blue-100' 
                  : 'hover:border-gray-300 hover:bg-white'
              }`}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
              searchFocused ? 'text-blue-500' : 'text-gray-400'
            }`}>
              <SearchIcon />
            </div>
            {searchFocused && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* Navegación derecha - Desktop */}
        <nav className="hidden md:flex items-center gap-4">
          <Link 
            href="/" 
            className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group hover:scale-105"
            title="Inicio"
          >
            <HomeIcon />
          </Link>
          
          <Link 
            href="/messages" 
            className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group hover:scale-105"
            title="Mensajes"
          >
            <MessageIcon />
          </Link>
          
          <Link 
            href="/explore" 
            className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group hover:scale-105"
            title="Explorar"
          >
            <ExploreIcon />
          </Link>
          
          <Link 
            href="/notifications" 
            className="relative p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group hover:scale-105"
            title="Notificaciones"
          >
            <NotificationIcon />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
          
          {user && (
            <Link 
              href={`/${user.username}`} 
              className="flex items-center p-1 rounded-xl hover:bg-gray-100 transition-all duration-200 group hover:scale-105"
              title="Perfil"
            >
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="avatar" 
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all duration-200" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm shadow-lg">
                  {user.username[0].toUpperCase()}
                </div>
              )}
            </Link>
          )}
          
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
            title="Cerrar sesión"
          >
            Salir
          </button>
        </nav>

        {/* Botón de menú móvil */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
        >
          <MenuIcon />
        </button>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-lg md:hidden">
          <div className="p-4 space-y-4">
            {/* Buscador móvil */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full px-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </div>
            </div>

            {/* Navegación móvil */}
            <div className="grid grid-cols-2 gap-2">
              <Link 
                href="/" 
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HomeIcon />
                <span className="text-sm font-medium">Inicio</span>
              </Link>
              
              <Link 
                href="/messages" 
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MessageIcon />
                <span className="text-sm font-medium">Mensajes</span>
              </Link>
              
              <Link 
                href="/explore" 
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ExploreIcon />
                <span className="text-sm font-medium">Explorar</span>
              </Link>
              
              <Link 
                href="/notifications" 
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors relative"
                onClick={() => setMobileMenuOpen(false)}
              >
                <NotificationIcon />
                <span className="text-sm font-medium">Notificaciones</span>
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
            </div>

            {/* Perfil y logout móvil */}
            <div className="border-t border-gray-200 pt-4">
              {user && (
                <Link 
                  href={`/${user.username}`} 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors mb-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="avatar" 
                      className="w-8 h-8 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium">{user.username}</span>
                </Link>
              )}
              
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
