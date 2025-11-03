import type { ReactElement } from 'react';

import { TaggedPostsShell } from '@/modules/tags/components/tagged-posts-shell';

export default function TaggedPage(): ReactElement {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="mb-8 rounded-2xl glass-card p-6 md:p-8 animate-fade-in">
        <h1 className="text-gradient-primary text-3xl font-bold md:text-4xl">
          Posts donde estás etiquetado
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-400">
          Todos los posts donde otros usuarios te han etiquetado
        </p>
      </div>
      <TaggedPostsShell />
    </main>
  );
}

