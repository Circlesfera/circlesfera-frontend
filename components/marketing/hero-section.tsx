import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement } from 'react';

const primaryButtonClass =
  'inline-flex items-center justify-center rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-soft-lg transition hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300';

const ghostButtonClass =
  'inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50';

export function HeroSection(): ReactElement {
  return (
    <section className="relative flex flex-col items-center overflow-hidden bg-slate-950 py-24">
      <div className="pointer-events-none absolute inset-0 bg-hero-grid bg-[length:120px_120px] opacity-20" aria-hidden />
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 text-center">
        <span className="rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/80">
          Beta privada
        </span>
        <h1 className="text-4xl font-semibold text-white sm:text-6xl">
          El escenario donde tus historias conquistan a la próxima generación
        </h1>
        <p className="max-w-2xl text-lg text-white/70">
          CircleSfera combina vídeo vertical, directos interactivos y comunidades vivas en una interfaz diseñada para creadores, marcas y fans exigentes.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/register" className={primaryButtonClass}>
            Solicitar acceso anticipado
          </Link>
          <Link href="/product" className={ghostButtonClass}>
            Conoce la visión del producto
          </Link>
        </div>
        <div className="mt-16 w-full max-w-4xl rounded-[2.5rem] border border-white/10 bg-slate-900/40 p-3 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
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

