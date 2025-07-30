import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <>
      {/* Sidebar para md+ */}
      <aside className="hidden md:flex flex-col w-60 h-screen pt-20 bg-white border-r border-gray-200 fixed left-0 top-0 z-40 shadow-md rounded-r-2xl">
        <nav className="flex flex-col gap-2 px-4">
          <Link href="/" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors group">
            <span className="text-2xl group-hover:text-[var(--accent)] transition-colors">🏠</span>
            <span className="font-medium text-base">Inicio</span>
          </Link>
          <Link href="/explore" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors group">
            <span className="text-2xl group-hover:text-[var(--accent)] transition-colors">🔍</span>
            <span className="font-medium text-base">Explorar</span>
          </Link>
          <Link href="/messages" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors group">
            <span className="text-2xl group-hover:text-[var(--accent)] transition-colors">✉️</span>
            <span className="font-medium text-base">Mensajes</span>
          </Link>
          <Link href="/notifications" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors group">
            <span className="text-2xl group-hover:text-[var(--accent)] transition-colors">🔔</span>
            <span className="font-medium text-base">Notificaciones</span>
          </Link>
          <Link href="/profile" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors group">
            <span className="text-2xl group-hover:text-[var(--accent)] transition-colors">👤</span>
            <span className="font-medium text-base">Perfil</span>
          </Link>
        </nav>
      </aside>
      {/* Menú inferior fijo para móvil */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-2 z-50 md:hidden shadow-t-md">
        <Link href="/" className="flex flex-col items-center text-2xl hover:text-[var(--accent)] transition-colors">
          <span>🏠</span>
        </Link>
        <Link href="/explore" className="flex flex-col items-center text-2xl hover:text-[var(--accent)] transition-colors">
          <span>🔍</span>
        </Link>
        <Link href="/messages" className="flex flex-col items-center text-2xl hover:text-[var(--accent)] transition-colors">
          <span>✉️</span>
        </Link>
        <Link href="/notifications" className="flex flex-col items-center text-2xl hover:text-[var(--accent)] transition-colors">
          <span>🔔</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-2xl hover:text-[var(--accent)] transition-colors">
          <span>👤</span>
        </Link>
      </nav>
    </>
  );
}
