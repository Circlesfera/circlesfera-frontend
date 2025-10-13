"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import CompactCreatePostForm from '@/components/forms/CompactCreatePostForm';
import CompactCreateStoryForm from '@/components/forms/CompactCreateStoryForm';
import CompactCreateReelForm from '@/components/forms/CompactCreateReelForm';
import { useUnreadNotifications } from '@/features/notifications/useUnreadNotifications';
import TestThemeButton from '@/components/TestThemeButton';

// Iconos SVG optimizados
const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ExploreIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MessageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const NotificationIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4a2 2 0 00-1.18 3.25L6 10l-2.8 2.8A2 2 0 004 15.19V19a2 2 0 002 2h12a2 2 0 002-2v-3.81a2 2 0 00-.2-2.39L18 10l2.8-2.8A2 2 0 0019.81 4H4.19z" />
  </svg>
);

const ReelsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);


const StoriesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ProfileIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | undefined;
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'post' | 'story' | 'reel' | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const unreadNotifications = useUnreadNotifications();

  // Rutas públicas (sin layout/sidebar)
  const publicRoutes = ['/', '/forgot-password', '/reset-password'];
  const isPublicRoute = pathname === '/' || publicRoutes.slice(1).some(route => pathname.startsWith(route));

  // Rutas que requieren autenticación
  const protectedRoutes = ['/explore', '/messages', '/notifications', '/profile'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Marcar como hidratado después del primer render
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Redirigir a home si no está autenticado y accede a una ruta protegida
  useEffect(() => {
    if (!loading && !user && isProtectedRoute && isHydrated) {
      router.replace('/');
    }
  }, [loading, user, isProtectedRoute, router, isHydrated]);

  // Solo mostrar loading en el cliente durante la hidratación
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si es ruta pública, NO mostrar sidebar/navegación (solo el contenido)
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Navegación minimalista organizada por secciones
  const primaryNavigation: NavigationItem[] = [
    { name: 'Inicio', href: '/feed', icon: HomeIcon },
    { name: 'Explorar', href: '/explore', icon: ExploreIcon },
    { name: 'Mensajes', href: '/messages', icon: MessageIcon, badge: 2 }, // Hardcoded por ahora
  ];

  const contentNavigation: NavigationItem[] = [
    { name: 'Reels', href: '/reels', icon: ReelsIcon },
    { name: 'Stories', href: '/stories', icon: StoriesIcon },
  ];

  const notificationsNavigation: NavigationItem[] = [
    { name: 'Notificaciones', href: '/notifications', icon: NotificationIcon, badge: unreadNotifications > 0 ? unreadNotifications : undefined },
  ];

  const userNavigation: NavigationItem[] = [
    { name: 'Perfil', href: `/profile`, icon: ProfileIcon },
    { name: 'Configuración', href: '/settings', icon: SettingsIcon },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleCreateContent = (type: 'post' | 'story' | 'reel') => {
    setCreateType(type);
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateType(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:z-50">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/80 backdrop-blur-sm border-r border-gray-200 px-6 pb-4 shadow-xl">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CircleSfera</h1>
                <p className="text-xs text-gray-500">Red Social</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            {/* Navegación Principal */}
            <div className="mb-2">
              <ul role="list" className="space-y-1">
                {primaryNavigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200",
                        isActive(item.href)
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border border-blue-100"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-colors duration-200",
                          isActive(item.href)
                            ? "text-blue-700"
                            : "text-gray-400 group-hover:text-gray-600"
                        )}
                      />
                      <span className="truncate">{item.name}</span>
                      {/* Badge para notificaciones */}
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Separador */}
            <div className="mx-3 my-2">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            </div>

            {/* Navegación de Contenido */}
            <div className="mb-2">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contenido</h3>
              <ul role="list" className="space-y-1">
                {contentNavigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200",
                        isActive(item.href)
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border border-blue-100"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-colors duration-200",
                          isActive(item.href)
                            ? "text-blue-700"
                            : "text-gray-400 group-hover:text-gray-600"
                        )}
                      />
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto inline-flex items-center rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white min-w-[20px] justify-center">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Separador */}
            <div className="mx-3 my-2">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            </div>

            {/* Navegación de Notificaciones */}
            <div className="mb-2">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Social</h3>
              <ul role="list" className="space-y-1">
                {notificationsNavigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200",
                        isActive(item.href)
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border border-blue-100"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-colors duration-200",
                          isActive(item.href)
                            ? "text-blue-700"
                            : "text-gray-400 group-hover:text-gray-600"
                        )}
                      />
                      <span className="truncate">{item.name}</span>
                      {/* Badge para notificaciones */}
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Create Button */}
            <div className="mt-auto mb-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Separador */}
            <div className="mx-3 my-2">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            </div>

            {/* Navegación de Usuario */}
            <div className="mb-3">
              <ul role="list" className="space-y-1">
                {userNavigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200",
                        isActive(item.href)
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border border-blue-100"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-colors duration-200",
                          isActive(item.href)
                            ? "text-blue-700"
                            : "text-gray-400 group-hover:text-gray-600"
                        )}
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* User Profile */}
            {user && (
              <div className="pt-6 border-t border-gray-100">
                <Link
                  href={`/${user.username}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 group cursor-pointer"
                >
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={`Avatar de ${user.username}`}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm group-hover:ring-blue-100 transition-all duration-200"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm group-hover:ring-blue-100 transition-all duration-200">
                      <span className="text-white font-semibold text-sm">
                        {user.username?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      @{user.username}
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {/* Theme Switcher */}
            <div className="mt-4 px-3">
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tema</span>
                <TestThemeButton />
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Navigation Mobile - Mejorado */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 lg:hidden transition-colors duration-200"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Abrir sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-lg font-bold text-gray-900">CircleSfera</span>
            </div>
          </div>

          <div className="flex items-center gap-x-3">
            <Link
              href="/notifications"
              className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <span className="sr-only">Ver notificaciones</span>
              <NotificationIcon className="h-6 w-6" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Page Content */}
        <main className="py-4 sm:py-6 pb-20 lg:pb-6">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Optimizado para móviles */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 lg:hidden shadow-lg">
        <div className="flex items-center justify-around px-1 py-2">
          {/* Navegación principal optimizada para móviles */}
          {primaryNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 flex-1 max-w-[80px]",
                isActive(item.href)
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <div className="relative">
                <item.icon className="h-6 w-6" />
                {/* Badge para notificaciones */}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium text-center leading-tight">
                {item.name === 'Inicio' ? 'Inicio' :
                  item.name === 'Explorar' ? 'Explorar' :
                    item.name === 'Mensajes' ? 'Mensajes' : item.name}
              </span>
            </Link>
          ))}

          {/* Botón de crear contenido */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 flex-1 max-w-[80px] text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          >
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <PlusIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs mt-1 font-medium text-center leading-tight">Crear</span>
          </button>

          {/* Navegación de contenido */}
          {contentNavigation.slice(0, 2).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 flex-1 max-w-[80px]",
                isActive(item.href)
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <div className="relative">
                <item.icon className="h-6 w-6" />
                {/* Badge para notificaciones */}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium text-center leading-tight">{item.name}</span>
            </Link>
          ))}

          {/* Perfil del Usuario */}
          {user && (
            <Link
              href={`/${user.username}`}
              className={cn(
                "relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 flex-1 max-w-[80px]",
                isActive(`/${user.username}`)
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <div className="relative">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={`Perfil de ${user.username}`}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">
                      {user.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs mt-1 font-medium text-center leading-tight">Perfil</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto bg-white px-6 pb-4 shadow-xl">
            {/* Mobile sidebar content - completo */}
            <div className="flex h-16 shrink-0 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">CircleSfera</h1>
                  <p className="text-xs text-gray-500">Red Social</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation items for mobile - Completo */}
            <nav className="flex flex-1 flex-col mt-6">
              {/* Navegación Principal */}
              <div className="mb-4">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Principal</h3>
                <ul role="list" className="space-y-1">
                  {primaryNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200",
                          isActive(item.href)
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border border-blue-100"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-colors duration-200",
                            isActive(item.href)
                              ? "text-blue-700"
                              : "text-gray-400 group-hover:text-gray-600"
                          )}
                        />
                        <span className="truncate">{item.name}</span>
                        {/* Badge para notificaciones */}
                        {item.badge && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Navegación de Contenido */}
              <div className="mb-4">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contenido</h3>
                <ul role="list" className="space-y-1">
                  {contentNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200",
                          isActive(item.href)
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border border-blue-100"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-colors duration-200",
                            isActive(item.href)
                              ? "text-blue-700"
                              : "text-gray-400 group-hover:text-gray-600"
                          )}
                        />
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <span className="ml-auto inline-flex items-center rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white min-w-[20px] justify-center">
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Navegación de Notificaciones */}
              <div className="mb-4">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Social</h3>
                <ul role="list" className="space-y-1">
                  {notificationsNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200",
                          isActive(item.href)
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border border-blue-100"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-colors duration-200",
                            isActive(item.href)
                              ? "text-blue-700"
                              : "text-gray-400 group-hover:text-gray-600"
                          )}
                        />
                        <span className="truncate">{item.name}</span>
                        {/* Badge para notificaciones */}
                        {item.badge && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Create Button */}
              <div className="mt-auto mb-3">
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    setShowCreateModal(true);
                  }}
                  className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Navegación de Usuario */}
              <div className="mb-3">
                <ul role="list" className="space-y-1">
                  {userNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200",
                          isActive(item.href)
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border border-blue-100"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-colors duration-200",
                            isActive(item.href)
                              ? "text-blue-700"
                              : "text-gray-400 group-hover:text-gray-600"
                          )}
                        />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* User Profile */}
              {user && (
                <div className="mt-auto pt-6 border-t border-gray-100">
                  <Link
                    href={`/${user.username}`}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 group cursor-pointer"
                  >
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={`Avatar de ${user.username}`}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm group-hover:ring-blue-100 transition-all duration-200"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm group-hover:ring-blue-100 transition-all duration-200">
                        <span className="text-white font-semibold text-sm">
                          {user.username?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.fullName || user.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        @{user.username}
                      </p>
                    </div>
                  </Link>
                </div>
              )}

              {/* Theme Switcher */}
              <div className="mt-4 px-3">
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tema</span>
                  <TestThemeButton />
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Modal de Crear Contenido */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={handleCloseCreateModal} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
              {!createType ? (
                // Modal de selección de tipo
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Crear Contenido</h2>
                    <button
                      onClick={handleCloseCreateModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleCreateContent('post')}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">Publicación</h3>
                        <p className="text-sm text-gray-600">Comparte una foto o video</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleCreateContent('story')}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
                    >
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">Story</h3>
                        <p className="text-sm text-gray-600">Comparte un momento efímero</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleCreateContent('reel')}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all duration-200 group"
                    >
                      <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center group-hover:bg-pink-200 transition-colors duration-200">
                        <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">Reel</h3>
                        <p className="text-sm text-gray-600">Crea un video corto</p>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                // Formulario específico
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Crear {createType === 'post' ? 'Publicación' : createType === 'story' ? 'Story' : 'Reel'}
                    </h2>
                    <button
                      onClick={handleCloseCreateModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {createType === 'post' && (
                    <CompactCreatePostForm onPostCreated={handleCloseCreateModal} />
                  )}
                  {createType === 'story' && (
                    <CompactCreateStoryForm onClose={handleCloseCreateModal} />
                  )}
                  {createType === 'reel' && (
                    <CompactCreateReelForm
                      onReelCreated={handleCloseCreateModal}
                      onClose={handleCloseCreateModal}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
