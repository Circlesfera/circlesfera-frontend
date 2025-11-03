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
    <div className="flex min-h-screen bg-black">
      {/* Sidebar izquierdo - Solo visible en desktop */}
      <aside className="hidden md:block">
        <SidebarNav />
      </aside>
      
      {/* Contenido principal */}
      <main className="flex-1 bg-black md:ml-[260px] pb-20 md:pb-0">
        <div className="mx-auto min-h-screen max-w-[1400px] px-4 py-6 md:px-6 md:py-8">
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom Nav - Solo visible en móvil */}
      <BottomNav />
    </div>
  );
}

