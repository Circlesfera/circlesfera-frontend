import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';

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

  // Items para desktop
  const desktopNavigationItems = [
    { href: '/', label: 'Inicio', icon: HomeIcon, exact: true },
    { href: '/explore', label: 'Explorar', icon: ExploreIcon },
    { href: '/cstv', label: 'CSTV', icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 7a2 2 0 012-2h16a2 2 0 012 2v9a2 2 0 01-2 2H8l-4 3v-3H4a2 2 0 01-2-2V7z" />
      </svg>
    ) },
    { href: '/live', label: 'Live', icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ) },
    { href: '/messages', label: 'Mensajes', icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ) },
    { href: '/notifications', label: 'Notificaciones', icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V7a5 5 0 00-10 0v5l-5 5h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ) },
    { href: '/profile', label: 'Perfil', icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ) },
  ];

  // Items para móvil - Instagram style (3 elementos principales)
  const mobileNavigationItems = [
    { href: '/', icon: HomeIcon, exact: true },
    { href: '/explore', icon: ExploreIcon },
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
                className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 group ${
                  active
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className={`transition-colors ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                  <Icon />
                </div>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Botón de crear contenido */}
        <div className="px-4 pb-6">
          <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium text-sm hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
            <CreateIcon />
            Crear Contenido
          </button>
        </div>
      </aside>
      {/* Menú inferior fijo para móvil - Instagram style (3 elementos) */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex items-center justify-center gap-16 py-3 z-50 md:hidden shadow-lg">
        {mobileNavigationItems.map((item) => {
          const active = isActive(item.href, item.exact);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center transition-all duration-200 ${
                active ? 'text-black' : 'text-gray-500'
              }`}
            >
              {item.icon === 'profile' ? (
                // Avatar del perfil - Instagram style
                <div className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                  active ? 'border-black' : 'border-gray-300'
                }`}>
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
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
                <div className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                  <item.icon filled={active} />
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
