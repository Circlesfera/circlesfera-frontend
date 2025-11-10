'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { JSX } from 'react';

import { RegisterForm } from '@/modules/auth/components/register-form';

export default function RegisterPage(): JSX.Element {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20 text-white">
      {/* Background effects adicionales */}
      <div className="pointer-events-none absolute inset-0 bg-hero-grid bg-[length:80px_80px] opacity-[0.2]" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/8 via-transparent to-accent-500/8" />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col items-center gap-4 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link href="/" className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 shadow-lg shadow-primary-500/30">
                <span className="text-xl font-bold text-white">C</span>
              </div>
              <span className="text-gradient-primary text-2xl font-bold tracking-tight">CircleSfera</span>
            </Link>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-bold sm:text-4xl"
          >
            Únete a{' '}
            <span className="text-gradient-primary">CircleSfera</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-md text-sm text-white/70"
          >
            Comparte historias inmersivas, conecta con tus seguidores y construye tu comunidad.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full"
        >
          <RegisterForm />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6 text-xs text-white/60"
        >
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="font-semibold text-primary-400 transition-all duration-300 hover:text-primary-300 hover:underline"
          >
            Inicia sesión
          </Link>
        </motion.p>
      </div>
    </main>
  );
}

