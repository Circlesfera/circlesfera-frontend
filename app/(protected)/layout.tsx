'use client';

import { type ReactElement, type ReactNode } from 'react';

import { SidebarNav } from '@/components/layout/sidebar-nav';
import { BottomNav } from '@/components/layout/bottom-nav';

interface ProtectedLayoutProps {
  readonly children: ReactNode;
}

/**
 * Layout compartido para rutas protegidas con sidebar izquierdo (desktop) y bottom nav (móvil).
 */
export default function ProtectedLayout({ children }: ProtectedLayoutProps): ReactElement {
  return (
    <div className="relative flex min-h-screen">
      {/* Background effects para el área protegida */}
      <div className="pointer-events-none fixed inset-0 bg-hero-grid bg-[length:80px_80px] opacity-[0.15]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-primary-500/3 via-transparent to-accent-500/3" aria-hidden />
      
      {/* Sidebar izquierdo - Solo visible en desktop */}
      <aside className="hidden md:block relative z-10">
        <SidebarNav />
      </aside>
      
      {/* Contenido principal */}
      <main className="relative z-10 flex-1 md:ml-[260px] pb-20 md:pb-0">
        <div className="w-full min-h-screen">
          <div className="animate-fade-in h-full">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom Nav - Solo visible en móvil */}
      <BottomNav />
    </div>
  );
}

