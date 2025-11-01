import type { ReactElement } from 'react';

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
    <section className="bg-slate-950 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-3xl font-semibold text-white sm:text-5xl">Métricas que sostienen historias memorables</h2>
        <p className="mt-4 max-w-2xl text-lg text-white/70">
          La infraestructura de CircleSfera prioriza performance y engagement para que cada creador potencie su comunidad.
        </p>
        <dl className="mt-12 grid gap-8 sm:grid-cols-3">
          {METRICS.map((metric) => (
            <div key={metric.label} className="rounded-3xl border border-white/10 bg-slate-900/60 p-8">
              <dt className="text-xs uppercase tracking-wide text-white/50">{metric.label}</dt>
              <dd className="mt-4 text-4xl font-semibold text-primary-400">{metric.value}</dd>
              <p className="mt-3 text-sm text-white/70">{metric.description}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

