import Link from 'next/link';
import type { ReactElement } from 'react';

import { Button } from '@/components/ui/button';

/**
 * Barra de navegación para la homepage pública.
 */
export function MarketingNav(): ReactElement {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/50 backdrop-blur-xl bg-black/60">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link 
          href="/" 
          className="group inline-flex items-center gap-2 text-lg font-bold transition-colors hover:text-primary-400"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 shadow-lg shadow-primary-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-primary-500/40">
            <span className="text-sm font-bold text-white">C</span>
          </div>
          <span className="text-gradient-primary">CircleSfera</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            href="/explore" 
            className="text-sm font-medium text-slate-400 transition-colors hover:text-white focus-ring rounded-full px-4 py-2"
          >
            Explorar
          </Link>
          <Link 
            href="/pricing" 
            className="text-sm font-medium text-slate-400 transition-colors hover:text-white focus-ring rounded-full px-4 py-2"
          >
            Planes
          </Link>
          <Button asChild intent="secondary" size="sm">
            <Link href="/login">
              Iniciar sesión
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

