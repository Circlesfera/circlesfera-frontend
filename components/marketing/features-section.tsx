'use client';

import type { ReactElement } from 'react';
import { motion } from 'framer-motion';

const FEATURES: Array<{ title: string; description: string; icon: ReactElement }> = [
  {
    title: 'Feed ultraveloz',
    description:
      'Scroll infinito con recomendaciones inteligentes y renderizado optimizado para vídeos 4K en streaming adaptativo.',
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    title: 'Historias colaborativas',
    description:
      'Combina clips de varios creadores, añade filtros en vivo y habilita reacciones en tiempo real con stickers inteligentes.',
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    title: 'Control creativo total',
    description:
      'Configura audiencias, limitaciones de contenido, monetización directa y analíticas profundas desde un panel modular.',
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    )
  }
];

export function FeaturesSection(): ReactElement {
  return (
    <section className="bg-black py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-white sm:text-5xl"
        >
          Creada para creadores{' '}
          <span className="text-gradient-primary">obsesionados</span> con la calidad
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 text-lg text-white/70"
        >
          CircleSfera ofrece un ecosistema moderno para narrativas inmersivas, eventos en directo y comunidades comprometidas.
        </motion.p>
        <div className="mt-16 grid gap-6 sm:grid-cols-3 sm:gap-8">
          {FEATURES.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass-card p-8 text-left transition-all duration-300 hover:shadow-elegant-lg"
            >
              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/20 via-primary-500/10 to-accent-500/20 p-3 text-primary-400 backdrop-blur-sm">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">{feature.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

