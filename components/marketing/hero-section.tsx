import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement } from 'react';

import { Button } from '@/components/ui/button';

export function HeroSection(): ReactElement {
  return (
    <section className="relative flex flex-col items-center overflow-hidden bg-black py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-hero-grid bg-[length:120px_120px] opacity-10" aria-hidden />
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 text-center">
        <span className="badge-primary px-4 py-1.5 text-xs uppercase tracking-[0.35em]">
          Beta privada
        </span>
        <h1 className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-5xl font-bold leading-tight text-transparent sm:text-7xl">
          El escenario donde tus historias conquistan a la próxima generación
        </h1>
        <p className="max-w-2xl text-lg text-slate-400 sm:text-xl">
          CircleSfera combina vídeo vertical, directos interactivos y comunidades vivas en una interfaz diseñada para creadores, marcas y fans exigentes.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild intent="primary" size="lg">
            <Link href="/register">
              Solicitar acceso anticipado
            </Link>
          </Button>
          <Button asChild intent="outline" size="lg">
            <Link href="/product">
              Conoce la visión del producto
            </Link>
          </Button>
        </div>
        <div className="mt-16 w-full max-w-4xl rounded-[2.5rem] border border-slate-800/50 bg-slate-900/40 p-3 shadow-elegant-xl backdrop-blur-sm">
          <Image
            src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2"
            alt="Experiencia CircleSfera"
            width={1280}
            height={720}
            priority
            className="w-full rounded-[2rem] object-cover"
          />
        </div>
      </div>
    </section>
  );
}

