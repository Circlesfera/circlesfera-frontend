'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { type ReactElement } from 'react';
import { motion } from 'framer-motion';

/**
 * Barra de navegación para la homepage pública.
 */
export function MarketingNav(): ReactElement {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 glass-sidebar">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/" className="flex items-center gap-2">
            <div className="relative flex size-8 items-center justify-center">
              <Image
                src="/circlesfera-logo.png"
                alt="CircleSfera"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-gradient-primary text-lg font-bold tracking-tight">
          CircleSfera
            </span>
        </Link>
        </motion.div>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/explore"
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            Explorar
          </Link>
          <Link
            href="/pricing"
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            Planes
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-all duration-300 hover:from-primary-500 hover:via-accent-500 hover:to-primary-600 hover:shadow-xl hover:shadow-primary-500/40"
          >
            Iniciar sesión
          </Link>
          </motion.div>
        </div>
      </nav>
    </header>
  );
}

