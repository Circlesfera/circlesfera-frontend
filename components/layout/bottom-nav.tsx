'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactElement } from 'react';
import { motion } from 'framer-motion';

import { useNotifications } from '@/modules/notifications/hooks/use-notifications';
import { useSessionStore } from '@/store/session';
import { getAvatarUrl } from '@/lib/image-utils';
import Image from 'next/image';

interface BottomNavItem {
  readonly href: string;
  readonly icon: ReactElement;
  readonly activeIcon: ReactElement;
  readonly label: string;
}

const navItems: BottomNavItem[] = [
  {
    href: '/feed',
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    activeIcon: (
      <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
    label: 'Inicio'
  },
  {
    href: '/explore',
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    activeIcon: (
      <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21.53 20.47l-3.66-3.66A8.98 8.98 0 0020 11a9 9 0 10-9 9c2.215 0 4.24-.804 5.81-2.13l3.66 3.66a.75.75 0 001.06-1.06zM3.5 11a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" />
      </svg>
    ),
    label: 'Explorar'
  },
  {
    href: '/reels',
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    activeIcon: (
      <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21 7.93l-9 5.25-9-5.25L12 2.618l9 5.311z" />
        <path d="M3 13.907l9 5.25 9-5.25-9-5.186-9 5.186zM3 18.132l9 5.25 9-5.25-9-5.186-9 5.186z" />
      </svg>
    ),
    label: 'Reels'
  },
  {
    href: '/messages',
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    activeIcon: (
      <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905a13.785 13.785 0 006.963 6.963l7.905 2.432a.75.75 0 00.94-.926l-2.43-7.905A13.785 13.785 0 0018.75 4.852L11.345 2.427a.75.75 0 00-.867.867l2.432 7.905a13.785 13.785 0 006.963 6.963l7.905 2.432a.75.75 0 00.94-.926l-2.43-7.905A13.785 13.785 0 0018.75 4.852L11.345 2.427a.75.75 0 00-.867.867z" />
      </svg>
    ),
    label: 'Mensajes'
  }
];

export function BottomNav(): ReactElement {
  const pathname = usePathname();
  const user = useSessionStore((state) => state.user);
  const { unreadCount } = useNotifications(false);

  const isActive = (href: string): boolean => {
    if (href === '/feed') {
      return pathname === '/feed';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-bottom-nav">
      <div className="flex items-center justify-around px-2 py-2.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const showBadge = item.href === '/messages' && unreadCount > 0;

          return (
            <motion.div
              key={item.href}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Link
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 min-w-[60px] transition-all duration-300 ease-out ${
                  active
                    ? 'text-primary-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="relative">
                  <motion.div
                    animate={{ scale: active ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {active ? item.activeIcon : item.icon}
                  </motion.div>
                  {showBadge && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 px-1 text-[10px] font-bold text-white shadow-lg shadow-red-500/50 ring-2 ring-black"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </div>
                <span className={`text-[10px] font-medium transition-colors duration-300 ${
                  active ? 'text-primary-400' : 'text-slate-600 dark:text-slate-500'
                }`}>
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute bottom-0 left-1/2 h-1 w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}

        {/* Profile link */}
        {user && (
          <motion.div
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Link
              href={`/${user.handle}`}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 min-w-[60px] transition-all duration-300 ${
                pathname === `/${user.handle}` || pathname.startsWith(`/${user.handle}/`)
                  ? 'text-primary-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="relative size-6 overflow-hidden rounded-full ring-2 ring-slate-300 dark:ring-slate-700 transition-all duration-300">
                <Image
                  src={getAvatarUrl(user.avatarUrl, user.handle)}
                  alt={user.displayName}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {(pathname === `/${user.handle}` || pathname.startsWith(`/${user.handle}/`)) && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500/20 to-transparent" />
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-300 ${
                pathname === `/${user.handle}` || pathname.startsWith(`/${user.handle}/`)
                  ? 'text-primary-400'
                  : 'text-slate-600 dark:text-slate-500'
              }`}>
                Perfil
              </span>
              {(pathname === `/${user.handle}` || pathname.startsWith(`/${user.handle}/`)) && (
                <motion.div
                  layoutId="bottomNavProfileIndicator"
                  className="absolute bottom-0 left-1/2 h-1 w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          </motion.div>
        )}
      </div>
    </nav>
  );
}

