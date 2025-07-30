import React from 'react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-xl text-blue-600">CircleSfera</span>
      </div>
      {/* Buscador */}
      <div className="hidden md:block w-1/3">
        <input
          type="text"
          placeholder="Buscar"
          className="w-full px-3 py-1 rounded bg-gray-100 border border-gray-300 focus:outline-none focus:ring"
        />
      </div>
      {/* Iconos navegación */}
      <nav className="flex items-center gap-6 text-gray-600 text-xl">
        <button title="Inicio" className="hover:text-blue-600"><span>🏠</span></button>
        <button title="Mensajes" className="hover:text-blue-600"><span>✉️</span></button>
        <button title="Notificaciones" className="hover:text-blue-600"><span>🔔</span></button>
        <button title="Perfil" className="hover:text-blue-600"><span>👤</span></button>
      </nav>
    </header>
  );
}
