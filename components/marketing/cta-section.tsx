'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { ReactElement } from 'react';

export function CallToActionSection(): ReactElement {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 py-20 text-white md:py-32">
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold sm:text-4xl md:text-5xl"
        >
          Creemos la alternativa social que prioriza la{' '}
          <span className="text-white">creatividad</span> y el control
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-white/90 sm:text-xl"
        >
          Únete a la beta privada, configura tu espacio y convoca a tu comunidad en minutos.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white px-6 py-3 text-sm font-semibold text-primary-600 shadow-lg shadow-white/20 transition-all duration-300 hover:bg-white/90 hover:shadow-xl hover:shadow-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Crear cuenta
          </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/demo"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Agendar demo con producto
          </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

