'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactElement } from 'react';
import { motion } from 'framer-motion';

import { useSessionStore } from '@/store/session';
import { useNotifications } from '@/modules/notifications/hooks/use-notifications';
import { getAvatarUrl } from '@/lib/image-utils';

interface NavItem {
  readonly href: string;
  readonly icon: ReactElement;
  readonly activeIcon: ReactElement;
  readonly label: string;
  readonly badge?: number;
}

interface NavSection {
  readonly title?: string;
  readonly items: NavItem[];
}

export function SidebarNav(): ReactElement {
  const pathname = usePathname();
  const user = useSessionStore((state) => state.user);
  const { unreadCount } = useNotifications(false);

  const isActive = (href: string): boolean => {
    if (href === '/feed') {
      return pathname === '/feed';
    }
    return pathname.startsWith(href);
  };

  // Navegación Principal
  const mainNavigation: NavSection = {
    items: [
      {
        href: '/feed',
        icon: (
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
        activeIcon: (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        ),
        label: 'Inicio'
      },
      {
        href: '/explore',
        icon: (
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        ),
        activeIcon: (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.53 20.47l-3.66-3.66A8.98 8.98 0 0020 11a9 9 0 10-9 9c2.215 0 4.24-.804 5.81-2.13l3.66 3.66a.75.75 0 001.06-1.06zM3.5 11a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" />
          </svg>
        ),
        label: 'Explorar'
      },
      {
        href: '/reels',
        icon: (
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        ),
        activeIcon: (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21 7.93l-9 5.25-9-5.25L12 2.618l9 5.311z" />
            <path d="M3 13.907l9 5.25 9-5.25-9-5.186-9 5.186zM3 18.132l9 5.25 9-5.25-9-5.186-9 5.186z" />
          </svg>
        ),
        label: 'Reels'
      },
      {
        href: '/messages',
        icon: (
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ),
        activeIcon: (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.464l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.036z" />
          </svg>
        ),
        label: 'Mensajes'
      }
    ]
  };

  // Interacciones
  const interactionsSection: NavSection = {
    title: 'Interacciones',
    items: [
      {
        href: '/notifications',
        icon: (
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        ),
        activeIcon: (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
        ),
        label: 'Notificaciones',
        badge: unreadCount > 0 ? unreadCount : undefined
      },
      {
        href: '/mentions',
        icon: (
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        ),
        activeIcon: (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
            <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
          </svg>
        ),
        label: 'Menciones'
      },
      {
        href: '/tagged',
        icon: (
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        ),
        activeIcon: (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 5.5a2.5 2.5 0 105 0 2.5 2.5 0 00-5 0z" />
            <path d="M18.5 2.5L21 5l-7 7-4-4-2.5 2.5L10 13l4-4 7 7 2.5-2.5L18.5 8 16 5.5 18.5 2.5z" />
          </svg>
        ),
        label: 'Etiquetadas'
      }
    ]
  };

  // Contenido
  const contentSection: NavSection = {
    title: 'Contenido',
    items: [
      {
        href: '/upload',
        icon: (
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        ),
        activeIcon: (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
          </svg>
        ),
        label: 'Crear'
      },
      {
        href: '/saved',
        icon: (
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        ),
        activeIcon: (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5zm2 0v14l5-2.5L17 19V5H7z" />
          </svg>
        ),
        label: 'Guardados'
      },
      {
        href: '/archived',
        icon: (
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        ),
        activeIcon: (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 6h18v2H3V6zm0 5v11h18V11H3zm9 7h-1v-3H8v-2h3v-1h2v1h3v2h-3v3h-1z" />
          </svg>
        ),
        label: 'Archivados'
      }
    ]
  };

  // Análisis y Configuración
  const settingsSection: NavSection = {
    title: 'Más',
    items: [
      {
        href: '/analytics',
        icon: (
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        activeIcon: (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
          </svg>
        ),
        label: 'Analytics'
      },
      {
        href: '/settings',
        icon: (
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        activeIcon: (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 15.5A3.5 3.5 0 018.5 12 3.5 3.5 0 0112 8.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.4-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0014 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z" />
          </svg>
        ),
        label: 'Configuración'
      }
    ]
  };

  const sections = [mainNavigation, interactionsSection, contentSection, settingsSection];

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);
    const showBadge = item.badge !== undefined && item.badge > 0;

    return (
      <motion.div
        key={item.href}
        whileHover={{ x: 4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Link
          href={item.href}
          className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 ease-out ${
            active
              ? 'bg-gradient-to-r from-primary-500/20 via-primary-500/15 to-transparent font-semibold shadow-lg shadow-primary-500/10 before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:rounded-r-full before:bg-gradient-to-b before:from-primary-400 before:to-accent-500'
              : 'hover:bg-white/5 hover:shadow-md'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <motion.div 
              className={`transition-all duration-300 ${active ? 'scale-110 text-primary-400' : 'text-slate-400 group-hover:text-slate-200'}`}
              whileHover={!active ? { scale: 1.1 } : {}}
              transition={{ duration: 0.2 }}
            >
              {active ? item.activeIcon : item.icon}
            </motion.div>
            {showBadge && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 px-1 text-[10px] font-bold text-white shadow-lg shadow-red-500/50 ring-2 ring-black"
              >
                {item.badge! > 9 ? '9+' : item.badge}
              </motion.span>
            )}
          </div>
          <span className={`flex-1 text-sm font-medium transition-colors duration-300 ${
            active 
              ? 'text-white' 
              : 'text-slate-400 group-hover:text-slate-200'
          }`}>
            {item.label}
          </span>
          {active && (
            <motion.div 
              layoutId="sidebarActiveIndicator"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/5 to-transparent"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </Link>
      </motion.div>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-50 h-full w-[260px] glass-sidebar border-r border-white/5">
      <div className="flex h-full flex-col overflow-y-auto custom-scrollbar px-4 py-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link 
            href="/feed" 
            className="group mb-8 flex items-center gap-3 px-3 transition-all duration-300"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative flex size-9 items-center justify-center transition-all duration-300"
            >
              <Image
                src="/circlesfera-logo.png"
                alt="CircleSfera"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </motion.div>
            <span className="text-gradient-primary text-xl font-bold tracking-tight">
              CircleSfera
            </span>
          </Link>
        </motion.div>

        {/* Navigation Sections */}
        <nav className="flex-1 space-y-8">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && (
                <div className="mb-3 px-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {section.title}
                  </h3>
                </div>
              )}
              <div className="space-y-1.5">
                {section.items.map((item) => renderNavItem(item))}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile Link */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-auto border-t border-white/5 pt-6"
          >
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Link
                href={`/${user.handle}`}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 ${
                  pathname === `/${user.handle}` || pathname.startsWith(`/${user.handle}/`)
                    ? 'bg-gradient-to-r from-primary-500/20 via-primary-500/15 to-transparent font-semibold shadow-lg shadow-primary-500/10 before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:rounded-r-full before:bg-gradient-to-b before:from-primary-400 before:to-accent-500'
                    : 'hover:bg-white/5 hover:shadow-md'
                }`}
              >
              <div className="relative size-8 overflow-hidden rounded-full ring-2 ring-slate-800 transition-all duration-300 group-hover:ring-primary-500/50">
                <Image
                  src={getAvatarUrl(user.avatarUrl, user.handle)}
                  alt={user.displayName}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  unoptimized
                />
                {(pathname === `/${user.handle}` || pathname.startsWith(`/${user.handle}/`)) && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500/20 to-transparent" />
                )}
              </div>
              <div className="flex flex-1 flex-col min-w-0">
                <span className={`truncate text-sm font-medium transition-colors duration-300 ${
                  pathname === `/${user.handle}` || pathname.startsWith(`/${user.handle}/`)
                    ? 'text-white'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  Perfil
                </span>
                <span className="truncate text-xs text-slate-500">
                  @{user.handle}
                </span>
              </div>
              {(pathname === `/${user.handle}` || pathname.startsWith(`/${user.handle}/`)) && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/5 to-transparent" />
              )}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </div>
    </aside>
  );
}
