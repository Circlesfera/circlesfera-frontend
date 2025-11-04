'use client';

import type { ReactElement } from 'react';
import { motion } from 'framer-motion';

const METRICS: Array<{ label: string; value: string; description: string }> = [
  {
    label: 'Retención de audiencia',
    value: '82%',
    description: 'Usuarios activos diarios tras 30 días en las cohortes de creadores beta.'
  },
  {
    label: 'Tiempo medio por sesión',
    value: '19 min',
    description: 'Gracias a recomendaciones atomizadas y streaming continuo sin cortes.'
  },
  {
    label: 'Ingresos para creadores',
    value: '+26%',
    description: 'Incremento respecto a otras plataformas sociales mediante monetización nativa.'
  }
];

export function MetricsSection(): ReactElement {
  return (
    <section className="bg-black py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-white sm:text-5xl"
        >
          Métricas que sostienen{' '}
          <span className="text-gradient-primary">historias memorables</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 max-w-2xl text-lg text-white/70"
        >
          La infraestructura de CircleSfera prioriza performance y engagement para que cada creador potencie su comunidad.
        </motion.p>
        <dl className="mt-12 grid gap-6 sm:grid-cols-3 sm:gap-8">
          {METRICS.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass-card p-8 transition-all duration-300 hover:shadow-elegant-lg"
            >
              <dt className="text-xs uppercase tracking-wide text-white/50">{metric.label}</dt>
              <dd className="mt-4 text-4xl font-bold bg-gradient-to-r from-primary-400 via-primary-500 to-accent-500 bg-clip-text text-transparent">
                {metric.value}
              </dd>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">{metric.description}</p>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}

