import Link from 'next/link';
import type { ReactElement } from 'react';

export function CallToActionSection(): ReactElement {
  return (
    <section className="bg-primary-500 py-20 text-white">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center">
        <h2 className="text-3xl font-semibold sm:text-4xl">
          Creemos la alternativa social que prioriza la creatividad y el control
        </h2>
        <p className="text-lg text-white/90">
          Únete a la beta privada, configura tu espacio y convoca a tu comunidad en minutos.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-600 transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Crear cuenta
          </Link>
          <Link
            href="/demo"
            className="rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Agendar demo con producto
          </Link>
        </div>
      </div>
    </section>
  );
}

