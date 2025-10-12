"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUnreadNotifications } from '@/features/notifications/useUnreadNotifications';
import CreatePostForm from './CreatePostForm';
import CreateStoryForm from './CreateStoryForm';
import CreateReelForm from './CreateReelForm';
import UserSearch from './UserSearch';
import logger from '@/utils/logger';

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

const ReelsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 16h14l-2-16M10 11v6M14 11v6" />
  </svg>
);

const StoriesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const FeedIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const NotificationIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4a2 2 0 00-1.18 3.25L6 10l-2.8 2.8A2 2 0 004 15.19V19a2 2 0 002 2h12a2 2 0 002-2v-3.81a2 2 0 00-.2-2.39L18 10l2.8-2.8A2 2 0 0019.81 4H4.19z" />
  </svg>
);

const CSTVIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h18M3 12h18M3 16h18M10 9l5 3-5 3V9z" />
  </svg>
);

const LiveIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const PostIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
  </svg>
);

const StoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const ReelIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const unread = useUnreadNotifications();
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [showReelForm, setShowReelForm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowCreateMenu(false);
    setShowPostForm(false);
    setShowStoryForm(false);
    setShowUserMenu(false);
    setShowSearch(false);
  }, [router]);

  const handlePostCreated = () => {
    setShowPostForm(false);
    setShowCreateMenu(false);
  };

  const handleStoryCreated = () => {
    setShowStoryForm(false);
    setShowCreateMenu(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      logger.info('User logged out successfully');
    } catch (logoutError) {
      logger.error('Error during logout:', {
        error: logoutError instanceof Error ? logoutError.message : 'Unknown error'
      });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="sticky top-0 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14 lg:h-16">
            {/* Logo - Optimizado para móvil */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white font-bold text-xs sm:text-sm lg:text-lg">C</span>
                </div>
                <span className="font-bold text-base sm:text-lg lg:text-2xl text-gray-900 tracking-tight select-none group-hover:text-blue-600 transition-colors">
                  CircleSfera
                </span>
              </Link>
            </div>

            {/* Buscador centrado - Desktop */}
            <div className="hidden md:block w-72 relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Buscar usuarios, posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setSearchFocused(true);
                    setShowSearch(true);
                  }}
                  onBlur={() => setSearchFocused(false)}
                  className={`w-full px-12 py-2 bg-gray-50 border border-gray-200 rounded-xl text-center text-sm !text-gray-900 !placeholder-gray-500 focus:outline-none transition-all duration-200 ${searchFocused ? 'border-blue-400 bg-white shadow-lg !text-gray-900' : 'hover:border-gray-300'
                    }`}
                  style={{ color: '#111827', '--tw-placeholder-opacity': '1' } as React.CSSProperties}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <SearchIcon />
                </div>
              </form>

              {/* Resultados de búsqueda */}
              {showSearch && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                  <UserSearch query={searchQuery} onResultClick={() => setShowSearch(false)} />
                </div>
              )}
            </div>

            {/* Navegación derecha - Desktop */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <Link href="/" className="p-2 lg:p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
                <HomeIcon />
                <span className="sr-only">Inicio</span>
              </Link>

              <Link href="/messages" className="p-2 lg:p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
                <MessageIcon />
                <span className="sr-only">Mensajes</span>
              </Link>

              <Link href="/explore" className="p-2 lg:p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
                <ExploreIcon />
                <span className="sr-only">Explorar</span>
              </Link>

              <Link href="/reels" className="p-2 lg:p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
                <ReelsIcon />
                <span className="sr-only">Reels</span>
              </Link>

              <Link href="/stories" className="p-2 lg:p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
                <StoriesIcon />
                <span className="sr-only">Stories</span>
              </Link>

              <Link href="/search" className="p-2 lg:p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
                <SearchIcon />
                <span className="sr-only">Buscar</span>
              </Link>

              <Link href="/feed" className="p-2 lg:p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
                <FeedIcon />
                <span className="sr-only">Feed</span>
              </Link>

              <Link href="/settings" className="p-2 lg:p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
                <SettingsIcon />
                <span className="sr-only">Configuración</span>
              </Link>

              <Link href="/notifications" className="relative p-2 lg:p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
                <NotificationIcon />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center font-bold animate-pulse">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
                <span className="sr-only">Notificaciones</span>
              </Link>

              {/* Botón de crear contenido */}
              <div className="relative">
                <button
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="p-2 lg:p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
                >
                  <PlusIcon />
                  <span className="sr-only">Crear contenido</span>
                </button>

                {/* Menú desplegable de crear contenido */}
                {showCreateMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-[200px] z-50 animate-fade-in">
                    <div className="space-y-1">
                      <button
                        onClick={() => setShowPostForm(true)}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <PostIcon />
                        <span className="font-medium text-gray-900">Crear publicación</span>
                      </button>

                      <button
                        onClick={() => setShowStoryForm(true)}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <StoryIcon />
                        <span className="font-medium text-gray-900">Crear story</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar del usuario */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="block group"
                >
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={`Avatar de ${user.username}`}
                      width={32}
                      height={32}
                      className="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all duration-200"
                      priority
                    />
                  ) : (
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-xs lg:text-sm shadow-lg">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </button>

                {/* Menú de usuario */}
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-[200px] z-50 animate-fade-in">
                    <div className="space-y-1">
                      <Link
                        href={`/${user?.username}`}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {user?.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={`Avatar de ${user.username}`}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/${user?.username}`}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            {user?.username || 'Usuario'}
                          </Link>
                          <div className="text-sm text-gray-500">Ver perfil</div>
                        </div>
                      </Link>

                      <Link
                        href="/settings"
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium text-gray-900">Configuración</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors text-red-600"
                      >
                        <LogoutIcon />
                        <span className="font-medium">Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Menú móvil - Optimizado */}
            <div className="md:hidden flex items-center gap-2">
              {/* Notificaciones en móvil */}
              <Link href="/notifications" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <NotificationIcon />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold animate-pulse">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MenuIcon />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menú móvil desplegable - Optimizado */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-12 sm:top-14 lg:top-16 left-0 w-full bg-white border-b border-gray-200 z-40 animate-slide-in">
          <div className="px-4 py-2 space-y-1">
            <Link href="/" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <HomeIcon />
              <span>Inicio</span>
            </Link>

            <Link href="/messages" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <MessageIcon />
              <span>Mensajes</span>
            </Link>

            <Link href="/explore" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <ExploreIcon />
              <span>Explorar</span>
            </Link>

            <Link href="/reels" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <ReelsIcon />
              <span>Reels</span>
            </Link>

            <Link href="/stories" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <StoriesIcon />
              <span>Stories</span>
            </Link>

            <Link href="/cstv" className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition-colors group">
              <div className="flex items-center space-x-3">
                <CSTVIcon />
                <span>CSTV</span>
              </div>
              <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded">
                ✨ NUEVO
              </span>
            </Link>

            <Link href="/live" className="flex items-center justify-between p-3 hover:bg-red-50 rounded-lg transition-colors group">
              <div className="flex items-center space-x-3">
                <LiveIcon />
                <span>En Vivo</span>
              </div>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded animate-pulse">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                LIVE
              </span>
            </Link>

            <Link href="/search" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <SearchIcon />
              <span>Buscar</span>
            </Link>

            <Link href="/feed" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <FeedIcon />
              <span>Feed</span>
            </Link>

            <Link href="/settings" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <SettingsIcon />
              <span>Configuración</span>
            </Link>

            {/* Botón de crear contenido en móvil */}
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <PlusIcon />
              <span>Crear contenido</span>
            </button>

            {/* Submenú de crear contenido en móvil */}
            {showCreateMenu && (
              <div className="ml-4 space-y-1">
                <button
                  onClick={() => setShowPostForm(true)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <PostIcon />
                  <span>Crear publicación</span>
                </button>

                <button
                  onClick={() => setShowStoryForm(true)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <StoryIcon />
                  <span>Crear story</span>
                </button>

                <button
                  onClick={() => setShowReelForm(true)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ReelIcon />
                  <span>Crear reel</span>
                </button>
              </div>
            )}

            <Link href={`/${user?.username}`} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={`Avatar de ${user.username}`}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <span>Perfil</span>
            </Link>

            <Link href="/settings" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Configuración</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-red-600"
            >
              <LogoutIcon />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal para crear post */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Crear publicación</h2>
                <button
                  onClick={() => setShowPostForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
              <CreatePostForm onPostCreated={handlePostCreated} />
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear story */}
      {showStoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Crear story</h2>
                <button
                  onClick={() => setShowStoryForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
              <CreateStoryForm onStoryCreated={handleStoryCreated} />
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear reel */}
      {showReelForm && (
        <CreateReelForm
          onReelCreated={() => {
            setShowReelForm(false);
            // Aquí puedes agregar lógica adicional después de crear el reel
          }}
          onClose={() => setShowReelForm(false)}
        />
      )}

    </>
  );
}
