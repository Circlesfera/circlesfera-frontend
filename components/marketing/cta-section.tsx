import Link from 'next/link';
import type { ReactElement } from 'react';

import { Button } from '@/components/ui/button';

export function CallToActionSection(): ReactElement {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 py-20 text-white sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-hero-grid bg-[length:120px_120px] opacity-10" aria-hidden />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
          Creemos la alternativa social que prioriza la creatividad y el control
        </h2>
        <p className="text-lg text-white/90 sm:text-xl">
          Únete a la beta privada, configura tu espacio y convoca a tu comunidad en minutos.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild intent="secondary" size="lg">
            <Link href="/register">
              Crear cuenta
            </Link>
          </Button>
          <Button asChild intent="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
            <Link href="/demo">
              Agendar demo con producto
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

