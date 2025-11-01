import Link from 'next/link';
import type { ReactElement } from 'react';

const linkClass =
  'text-sm font-medium text-slate-200 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-full px-4 py-2';

/**
 * Barra de navegación para la homepage pública.
 */
export function MarketingNav(): ReactElement {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 backdrop-blur bg-slate-950/70">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-white">
          CircleSfera
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/explore" className={linkClass}>
            Explorar
          </Link>
          <Link href="/pricing" className={linkClass}>
            Planes
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white/90"
          >
            Iniciar sesión
          </Link>
        </div>
      </nav>
    </header>
  );
}

