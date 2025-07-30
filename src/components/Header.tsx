import React from 'react';
import { useAuth } from '@/features/auth/useAuth';

export default function Header() {
  const { user, logout } = useAuth();

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
      {/* Usuario y logout */}
      <nav className="flex items-center gap-6 text-gray-600 text-xl">
        {user && (
          <>
            <span className="flex items-center gap-2 text-base">
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                  {user.username[0].toUpperCase()}
                </span>
              )}
              <span className="hidden md:inline">{user.username}</span>
            </span>
            <button
              onClick={logout}
              className="ml-2 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
              title="Cerrar sesión"
            >
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
