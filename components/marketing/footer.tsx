import Link from 'next/link';
import type { ReactElement } from 'react';

export function MarketingFooter(): ReactElement {
  return (
    <footer className="border-t border-white/10 bg-slate-950 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} CircleSfera. Todos los derechos reservados.</p>
        <nav className="flex items-center gap-4">
          <Link href="/terms" className="transition hover:text-white">
            Términos
          </Link>
          <Link href="/privacy" className="transition hover:text-white">
            Privacidad
          </Link>
          <Link href="mailto:hola@circlesfera.com" className="transition hover:text-white">
            Contacto
          </Link>
        </nav>
      </div>
    </footer>
  );
}

