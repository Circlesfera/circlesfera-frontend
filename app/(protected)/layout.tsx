import Link from 'next/link';
import { type ReactElement, type ReactNode } from 'react';

import { SearchBar } from '@/modules/search/components/search-bar';
import { ClientNav } from './client-nav';

interface ProtectedLayoutProps {
  readonly children: ReactNode;
}

/**
 * Layout compartido para rutas protegidas con header y barra de búsqueda.
 */
export default function ProtectedLayout({ children }: ProtectedLayoutProps): ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/feed" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">CircleSfera</span>
          </Link>

          <div className="flex-1 max-w-md">
            <SearchBar />
          </div>

          <ClientNav />
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}

