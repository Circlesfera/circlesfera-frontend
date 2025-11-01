import type { ReactElement } from 'react';

const FEATURES: Array<{ title: string; description: string }> = [
  {
    title: 'Feed ultraveloz',
    description:
      'Scroll infinito con recomendaciones inteligentes y renderizado optimizado para vídeos 4K en streaming adaptativo.'
  },
  {
    title: 'Historias colaborativas',
    description:
      'Combina clips de varios creadores, añade filtros en vivo y habilita reacciones en tiempo real con stickers inteligentes.'
  },
  {
    title: 'Control creativo total',
    description:
      'Configura audiencias, limitaciones de contenido, monetización directa y analíticas profundas desde un panel modular.'
  }
];

export function FeaturesSection(): ReactElement {
  return (
    <section className="bg-slate-900 py-24">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-3xl font-semibold text-white sm:text-5xl">Creada para creadores obsesionados con la calidad</h2>
        <p className="mt-4 text-lg text-white/70">
          CircleSfera ofrece un ecosistema moderno para narrativas inmersivas, eventos en directo y comunidades comprometidas.
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-white/10 bg-slate-950/50 p-8 text-left shadow-[0_20px_60px_-30px_rgba(15,23,42,0.7)]"
            >
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm text-white/70">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

