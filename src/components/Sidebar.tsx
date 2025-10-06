import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  // Iconos SVG modernos
  const HomeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );

  const ExploreIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const MessagesIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );

  const NotificationsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V7a5 5 0 00-10 0v5l-5 5h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );

  const ProfileIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const CreateIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  const navigationItems = [
    { href: '/', label: 'Inicio', icon: HomeIcon, exact: true },
    { href: '/explore', label: 'Explorar', icon: ExploreIcon },
    { href: '/messages', label: 'Mensajes', icon: MessagesIcon },
    { href: '/notifications', label: 'Notificaciones', icon: NotificationsIcon },
    { href: '/profile', label: 'Perfil', icon: ProfileIcon },
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
      <aside className="hidden md:flex flex-col w-64 h-screen pt-20 bg-white border-r border-gray-200 fixed left-0 top-0 z-40 shadow-lg">
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
        <nav className="flex flex-col gap-1 px-4 flex-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 group ${
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
      {/* Menú inferior fijo para móvil */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-3 z-50 md:hidden shadow-lg">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-all duration-200 ${
                active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                <Icon />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
