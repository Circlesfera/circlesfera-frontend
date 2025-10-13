import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Iconos SVG modernos - Instagram style
  const HomeIcon = ({ filled = false }) => (
    <svg className="w-6 h-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      {filled ? (
        <path d="M12 2.5L2.5 8.5V21.5H8.5V14.5H15.5V21.5H21.5V8.5L12 2.5Z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      )}
    </svg>
  );

  const ExploreIcon = ({ filled = false }) => (
    <svg className="w-6 h-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      {filled ? (
        <path d="M12 2.5C6.5 2.5 2 7 2 12.5S6.5 22.5 12 22.5S22 18 22 12.5S17.5 2.5 12 2.5ZM12 20C7.6 20 4 16.4 4 12S7.6 4 12 4S20 7.6 20 12S16.4 20 12 20Z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      )}
    </svg>
  );

  const CreateIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
    </svg>
  );

  const ReelsIcon = ({ filled = false }) => (
    <svg className="w-6 h-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h18M3 12h18M3 16h18M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  );

  const CSTVIcon = ({ filled = false }) => (
    <svg className="w-6 h-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      {filled ? (
        <path d="M21 3H3C1.9 3 1 3.9 1 5V19C1 20.1 1.9 21 3 21H21C22.1 21 23 20.1 23 19V5C23 3.9 22.1 3 21 3ZM10 16L10 8L16 12L10 16Z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h18M3 12h18M3 16h18M10 9l5 3-5 3V9z" />
      )}
    </svg>
  );

  const LiveIcon = ({ filled = false }) => (
    <svg className="w-6 h-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      {filled ? (
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      )}
    </svg>
  );

  const MessagesIcon = ({ filled = false }) => (
    <svg className="w-6 h-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );

  const NotificationsIcon = ({ filled = false }) => (
    <svg className="w-6 h-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5-5V7a5 5 0 00-10 0v5l-5 5h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );

  const ProfileIcon = ({ filled = false }) => (
    <svg className="w-6 h-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  // Items para desktop
  const desktopNavigationItems = [
    { href: '/', label: 'Inicio', icon: HomeIcon, exact: true },
    { href: '/explore', label: 'Explorar', icon: ExploreIcon },
    { href: '/reels', label: 'Reels', icon: ReelsIcon, badge: 'hot' },
    { href: '/cstv', label: 'CSTV', icon: CSTVIcon, badge: 'new' },
    { href: '/live', label: 'En Vivo', icon: LiveIcon, badge: 'live' },
    { href: '/messages', label: 'Mensajes', icon: MessagesIcon },
    { href: '/notifications', label: 'Notificaciones', icon: NotificationsIcon },
    { href: '/profile', label: 'Perfil', icon: ProfileIcon },
  ];

  // Items para móvil - Expandido con acceso rápido
  const mobileNavigationItems = [
    { href: '/', icon: HomeIcon, exact: true },
    { href: '/reels', icon: ReelsIcon },
    { href: '/explore', icon: ExploreIcon },
    { href: '/cstv', icon: CSTVIcon, badge: 'new' },
    { href: '/live', icon: LiveIcon, badge: 'live' },
    { href: '/profile', icon: 'profile' }, // Special case for profile avatar
  ];

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Sidebar para md+ */}
      <aside className="hidden md:flex flex-col w-60 h-screen pt-20 bg-white border-r border-gray-200 fixed left-0 top-0 z-40 shadow-sm">
        {/* Logo y branding */}
        <div className="px-6 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">CircleSfera</h1>
              <p className="text-xs text-gray-500">Red Social</p>
            </div>
          </div>
        </div>

        {/* Navegación principal */}
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {desktopNavigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 group relative ${active
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100'
                  : 'hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <div className={`transition-colors ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                  <Icon filled={active} />
                </div>
                <span className="font-medium text-sm">{item.label}</span>

                {/* Badges dinámicos */}
                {item.badge === 'live' && (
                  <span className="ml-auto flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded uppercase animate-pulse">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                    LIVE
                  </span>
                )}
                {item.badge === 'hot' && (
                  <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded uppercase">
                    🔥 HOT
                  </span>
                )}
                {item.badge === 'new' && (
                  <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded uppercase">
                    ✨ NUEVO
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Botón de crear contenido */}
        <div className="px-4 pb-4">
          <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium text-sm hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
            <CreateIcon />
            Crear Contenido
          </button>
        </div>

        {/* Theme Switcher */}
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tema</span>
            <ThemeSwitcher variant="icon" />
          </div>
        </div>
      </aside>
      {/* Menú inferior fijo para móvil - Expandido con scroll horizontal */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 md:hidden shadow-lg overflow-x-auto">
        <div className="flex items-center justify-start gap-2 px-2 py-3 min-w-max">
          {mobileNavigationItems.map((item) => {
            const active = isActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center gap-1 px-4 py-1 transition-all duration-200"
              >
                {item.icon === 'profile' ? (
                  // Avatar del perfil - Instagram style
                  <div className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${active ? 'border-black' : 'border-gray-300'
                    }`}>
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={`Perfil de ${user.username}`}
                        width={28}
                        height={28}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {user?.username?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  // Iconos normales
                  <div className="relative">
                    <div className={`transition-transform duration-200 ${active ? 'scale-110 text-black' : 'text-gray-500'}`}>
                      <item.icon filled={active} />
                    </div>

                    {/* Badge LIVE para móvil */}
                    {item.badge === 'live' && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white"></span>
                    )}
                    {/* Badge NEW para móvil */}
                    {item.badge === 'new' && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-white"></span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
