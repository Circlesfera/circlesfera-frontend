import Link from 'next/link';
import type { ReactElement } from 'react';

export function MarketingFooter(): ReactElement {
  return (
    <footer className="border-t border-white/10 bg-black py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-white/70">© {new Date().getFullYear()} CircleSfera. Todos los derechos reservados.</p>
        <nav className="flex items-center gap-6">
          <Link
            href="/terms"
            className="transition-all duration-300 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-full px-3 py-1.5 hover:bg-white/5"
          >
            Términos
          </Link>
          <Link
            href="/privacy"
            className="transition-all duration-300 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-full px-3 py-1.5 hover:bg-white/5"
          >
            Privacidad
          </Link>
          <Link
            href="mailto:hola@circlesfera.com"
            className="transition-all duration-300 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-full px-3 py-1.5 hover:bg-white/5"
          >
            Contacto
          </Link>
        </nav>
      </div>
    </footer>
  );
}

