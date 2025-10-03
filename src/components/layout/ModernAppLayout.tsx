"use client";

import React from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar, Header } from '@/design-system';
import { cn } from '@/utils/cn';

interface ModernAppLayoutProps {
  children: React.ReactNode;
}

const ModernAppLayout: React.FC<ModernAppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Rutas que no necesitan layout completo
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.includes(pathname);

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Items del sidebar
  const sidebarItems = [
    {
      href: '/',
      label: 'Inicio',
      icon: null, // Se maneja internamente
    },
    {
      href: '/explore',
      label: 'Explorar',
      icon: null,
    },
    {
      href: '/messages',
      label: 'Mensajes',
      icon: null,
      badge: 3, // Ejemplo de badge
    },
    {
      href: '/notifications',
      label: 'Notificaciones',
      icon: null,
      badge: 5, // Ejemplo de badge
    },
    {
      href: '/profile',
      label: 'Perfil',
      icon: null,
    },
  ];

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para desktop */}
      <Sidebar
        user={user}
        items={sidebarItems}
        onLogout={handleLogout}
        className="hidden lg:flex"
      />

      {/* Header */}
      <Header
        user={user}
        onSearch={handleSearch}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          "lg:ml-64", // Offset para el sidebar
          "pt-16", // Offset para el header
          "pb-16 lg:pb-0" // Padding bottom para mobile nav
        )}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Mobile navigation está incluida en el Sidebar */}
    </div>
  );
};

export default ModernAppLayout;
