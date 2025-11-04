'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement } from 'react';
import { motion } from 'framer-motion';

export function HeroSection(): ReactElement {
  return (
    <section className="relative flex flex-col items-center overflow-hidden py-24 md:py-32">
      {/* Efectos adicionales solo para esta sección */}
      <div className="pointer-events-none absolute inset-0 bg-hero-grid bg-[length:80px_80px] opacity-[0.25]" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 via-transparent to-accent-500/10" />
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-full border border-primary-500/30 bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-accent-500/10 px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-primary-400 backdrop-blur-sm shadow-lg shadow-primary-500/20"
        >
          Beta privada
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl font-bold text-white sm:text-6xl md:text-7xl"
        >
          El escenario donde tus{' '}
          <span className="text-gradient-primary">historias</span>{' '}
          conquistan a la próxima generación
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl text-lg text-white/70 sm:text-xl"
        >
          CircleSfera combina vídeo vertical, directos interactivos y comunidades vivas en una interfaz diseñada para creadores, marcas y fans exigentes.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-all duration-300 hover:from-primary-500 hover:via-accent-500 hover:to-primary-600 hover:shadow-xl hover:shadow-primary-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
            Solicitar acceso anticipado
          </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/product"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
            Conoce la visión del producto
          </Link>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 w-full max-w-4xl rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900/50 via-slate-900/30 to-slate-900/50 p-3 backdrop-blur-sm shadow-elegant-lg"
        >
          <Image
            src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2"
            alt="Experiencia CircleSfera"
            width={1280}
            height={720}
            priority
            className="w-full rounded-[2rem] object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}

