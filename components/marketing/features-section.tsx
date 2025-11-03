import type { ReactElement } from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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
    <section className="bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
          Creada para creadores obsesionados con la calidad
        </h2>
        <p className="mt-4 text-lg text-slate-400 sm:text-xl">
          CircleSfera ofrece un ecosistema moderno para narrativas inmersivas, eventos en directo y comunidades comprometidas.
        </p>
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              variant="glass"
              interactive
              padding="lg"
              className="text-left transition-all duration-300 hover:scale-[1.02]"
            >
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <p className="text-sm text-slate-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

