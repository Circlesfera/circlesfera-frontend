import { type ReactElement,Suspense } from 'react';

import { ArchivedPostsShell } from '@/modules/saved/components/archived-posts-shell';

export default function ArchivedPage(): ReactElement {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="mb-8 rounded-2xl glass-card p-6 md:p-8 animate-fade-in">
        <h1 className="text-gradient-primary text-3xl font-bold md:text-4xl">
          Posts archivados
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-400">
          Publicaciones que has archivado
        </p>
      </div>
      <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center"><div className="text-center"><div className="size-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent mx-auto mb-3" /><p className="text-sm text-slate-400">Cargando...</p></div></div>}>
        <ArchivedPostsShell />
      </Suspense>
    </main>
  );
}

